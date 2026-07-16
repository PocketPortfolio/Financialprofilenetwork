import type { ScrubbedText, ScrubRedactionKind } from './types';

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
// Permissive; keyword-gated rules should handle most true PII. This is a safety net.
const PHONE_RE =
  /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}\b/g;
const IBAN_RE = /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/gi;
const CARD_SHAPE_RE = /\b(?:\d[ -]*?){13,19}\b/g;
const ACCOUNT_KEYWORD_RE =
  /\b(?:account(?:\s*number)?|acct|sort\s*code|routing|aba|swift|bic)\b/gi;
const ACCOUNT_CAPTURE_RE =
  /\b(?:account(?:\s*number)?|acct|sort\s*code|routing|aba|swift|bic)\b[^\n]{0,32}\b([A-Z0-9][A-Z0-9 -]{5,})\b/gi;
const ADDRESS_LINE_RE =
  /\b(?:address|street|st\.|road|rd\.|avenue|ave\.|postcode|zip)\b[^\n]{0,120}/gi;
const LONG_DIGITS_RE = /\b\d{10,}\b/g;
const AMOUNT_RE = /(?:£|\$|€)\s?\d{1,3}(?:,\d{3})+(?:\.\d{2})?/g;

function normalizeInput(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/[ \t]{2,}/g, ' ').trim();
}

function addCount(counts: Map<ScrubRedactionKind, number>, kind: ScrubRedactionKind, n: number) {
  if (n <= 0) return;
  counts.set(kind, (counts.get(kind) ?? 0) + n);
}

function countMatches(text: string, re: RegExp): number {
  const m = text.match(re);
  return m ? m.length : 0;
}

function redactByRegex(
  input: string,
  re: RegExp,
  kind: ScrubRedactionKind,
  replacement: string,
  counts: Map<ScrubRedactionKind, number>
): string {
  const n = countMatches(input, re);
  if (n > 0) addCount(counts, kind, n);
  return input.replace(re, replacement);
}

function redactLedgerRows(input: string, counts: Map<ScrubRedactionKind, number>): string {
  const lines = input.split('\n');
  let changed = 0;
  const out = lines.map((line) => {
    const commaCount = (line.match(/,/g) ?? []).length;
    const semiCount = (line.match(/;/g) ?? []).length;
    const tabCount = (line.match(/\t/g) ?? []).length;
    const isLedgerLike = commaCount >= 6 || semiCount >= 6 || tabCount >= 6;
    if (!isLedgerLike) return line;
    changed += 1;
    return '[REDACTED:LEDGER_ROW]';
  });
  if (changed) addCount(counts, 'LEDGER_ROW', changed);
  return out.join('\n');
}

function redactCardLike(input: string, counts: Map<ScrubRedactionKind, number>): string {
  const matches = input.match(CARD_SHAPE_RE) ?? [];
  let valid = 0;
  for (const m of matches) {
    const digits = m.replace(/[^\d]/g, '');
    if (digits.length >= 13 && digits.length <= 19) valid += 1;
  }
  if (valid > 0) addCount(counts, 'CARD', valid);
  // Replace all card-shape matches; we already guarded counts to avoid overstating.
  return input.replace(CARD_SHAPE_RE, '[REDACTED:CARD]');
}

function redactAccountIds(input: string, counts: Map<ScrubRedactionKind, number>): string {
  // Only attempt capture replacement if keyword present to reduce false positives.
  if (!ACCOUNT_KEYWORD_RE.test(input)) return input;
  ACCOUNT_KEYWORD_RE.lastIndex = 0;
  const n = countMatches(input, ACCOUNT_CAPTURE_RE);
  if (n > 0) addCount(counts, 'ACCOUNT_ID', n);
  return input.replace(ACCOUNT_CAPTURE_RE, (full, captured) => {
    if (!captured) return full;
    return full.replace(captured, '[REDACTED:ACCOUNT_ID]');
  });
}

export function scrubFeedbackText(raw: string, opts?: { maxChars?: number }): ScrubbedText {
  const original = String(raw ?? '');
  const counts = new Map<ScrubRedactionKind, number>();
  const maxChars = Math.max(200, Math.min(opts?.maxChars ?? 4000, 12000));

  let text = normalizeInput(original);

  let truncated = false;
  if (text.length > maxChars) {
    text = text.slice(0, maxChars);
    truncated = true;
    addCount(counts, 'TRUNCATED', 1);
  }

  // Order matters: email before phone; ledger rows before long digits.
  text = redactByRegex(text, EMAIL_RE, 'EMAIL', '[REDACTED:EMAIL]', counts);
  text = redactByRegex(text, PHONE_RE, 'PHONE', '[REDACTED:PHONE]', counts);
  text = redactByRegex(text, IBAN_RE, 'IBAN', '[REDACTED:IBAN]', counts);
  text = redactCardLike(text, counts);
  text = redactAccountIds(text, counts);
  text = redactByRegex(text, ADDRESS_LINE_RE, 'ADDRESS_LINE', '[REDACTED:ADDRESS_LINE]', counts);
  text = redactLedgerRows(text, counts);
  text = redactByRegex(text, LONG_DIGITS_RE, 'LONG_ID', '[REDACTED:LONG_ID]', counts);
  text = redactByRegex(text, AMOUNT_RE, 'AMOUNT', '[REDACTED:AMOUNT]', counts);

  const redactions = Array.from(counts.entries()).map(([kind, count]) => ({ kind, count }));
  return {
    text,
    meta: {
      redactions,
      truncated,
      originalLength: original.length,
      finalLength: text.length,
    },
  };
}


import { normalizeHeader } from './synonyms';

export type SanitizeFlag =
  | 'empty'
  | 'control_chars_removed'
  | 'zero_width_removed'
  | 'whitespace_collapsed'
  | 'truncated'
  | 'non_ascii_normalized';

export interface SanitizeHeaderResult {
  clean: string;
  flags: SanitizeFlag[];
  normId: string;
}

export interface SanitizeHeadersResult {
  headers: string[];
  meta: {
    rawByIndex: string[];
    flagsByHeader: Record<string, SanitizeFlag[]>;
    normIds: string[];
    duplicates: Array<{ normId: string; originals: string[] }>;
  };
}

export interface SanitizeSampleRowsResult {
  rows: Record<string, string>[];
  meta: {
    truncatedCells: number;
    suspiciousCells: number;
  };
}

const ZERO_WIDTH_RE = /[\u200B-\u200F\u2060\uFEFF]/g;
const CONTROL_RE = /[\u0000-\u001F\u007F]/g;

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function stripToMostlyAscii(s: string): { next: string; changed: boolean } {
  // Conservative confusable mapping for the most common ASCII-lookalikes seen in CSV headers.
  // We map a small set of characters explicitly, then drop any remaining non-ASCII.
  const map: Record<string, string> = {
    // Cyrillic/Greek letters commonly used as confusables in latin words
    '\u0430': 'a', // а
    '\u0410': 'A', // А
    '\u0435': 'e', // е
    '\u0415': 'E', // Е
    '\u043E': 'o', // о
    '\u041E': 'O', // О
    '\u0440': 'p', // р
    '\u0420': 'P', // Р
    '\u0441': 'c', // с
    '\u0421': 'C', // С
    '\u0445': 'x', // х
    '\u0425': 'X', // Х
    '\u0456': 'i', // і
    '\u0406': 'I', // І
    '\u0458': 'j', // ј
    '\u0408': 'J', // Ј
    '\u03BF': 'o', // ο (Greek omicron)
    '\u039F': 'O', // Ο
    '\u03B9': 'i', // ι
    '\u0399': 'I', // Ι
    '\u03B1': 'a', // α
    '\u0391': 'A', // Α
    '\u03B5': 'e', // ε
    '\u0395': 'E', // Ε
  };

  let changed = false;
  let out = '';
  for (const ch of s) {
    const repl = map[ch];
    if (repl) {
      out += repl;
      changed = true;
      continue;
    }
    if (ch.charCodeAt(0) <= 0x7e && ch.charCodeAt(0) >= 0x20) {
      out += ch;
      continue;
    }
    // drop any remaining non-ASCII
    changed = true;
  }
  return { next: out, changed: changed || out !== s };
}

export function sanitizeHeader(raw: string, maxLen = 120): SanitizeHeaderResult {
  const flags: SanitizeFlag[] = [];
  const input = (raw ?? '').toString();

  let s = input.replace(/^\uFEFF/, '');
  const beforeControl = s;
  s = s.replace(CONTROL_RE, '');
  if (s !== beforeControl) flags.push('control_chars_removed');

  const beforeZw = s;
  s = s.replace(ZERO_WIDTH_RE, '');
  if (s !== beforeZw) flags.push('zero_width_removed');

  const beforeWs = s;
  s = collapseWhitespace(s);
  if (s !== beforeWs) flags.push('whitespace_collapsed');

  const beforeAscii = s;
  const ascii = stripToMostlyAscii(s);
  s = ascii.next;
  if (ascii.changed) flags.push('non_ascii_normalized');

  if (!s) flags.push('empty');

  if (s.length > maxLen) {
    s = s.slice(0, maxLen);
    flags.push('truncated');
  }

  return { clean: s, flags, normId: normalizeHeader(s) };
}

export function sanitizeHeaders(headers: string[], maxLen = 120): SanitizeHeadersResult {
  const out: string[] = [];
  const rawByIndex: string[] = [];
  const flagsByHeader: Record<string, SanitizeFlag[]> = {};
  const normIds: string[] = [];
  const dupMap = new Map<string, string[]>();

  for (const h of headers) {
    const r = sanitizeHeader(h, maxLen);
    out.push(r.clean);
    rawByIndex.push(h);
    flagsByHeader[r.clean] = r.flags;
    normIds.push(r.normId);
    if (r.normId) {
      const cur = dupMap.get(r.normId) ?? [];
      cur.push(h);
      dupMap.set(r.normId, cur);
    }
  }

  const duplicates: Array<{ normId: string; originals: string[] }> = [];
  for (const [normId, originals] of dupMap.entries()) {
    if (originals.length > 1) duplicates.push({ normId, originals });
  }

  return { headers: out, meta: { rawByIndex, flagsByHeader, normIds, duplicates } };
}

function looksSuspiciousCell(v: string): boolean {
  const s = (v ?? '').toString();
  if (!s) return false;
  if (s.includes('```')) return true;
  if (/<\s*system\s*>/i.test(s)) return true;
  if (/ignore\s+previous\s+instructions/i.test(s)) return true;
  if (/base64/i.test(s) && s.length > 200) return true;
  // very long uninterrupted tokens are common in base64/hex payloads
  if (/[A-Za-z0-9+/]{300,}={0,2}/.test(s)) return true;
  return false;
}

export function sanitizeSampleRows(
  rows: Record<string, string>[],
  options?: { maxCellLen?: number; maxRows?: number }
): SanitizeSampleRowsResult {
  const maxCellLen = options?.maxCellLen ?? 512;
  const maxRows = options?.maxRows ?? rows.length;

  let truncatedCells = 0;
  let suspiciousCells = 0;

  const nextRows: Record<string, string>[] = [];
  for (const row of rows.slice(0, maxRows)) {
    const next: Record<string, string> = {};
    for (const [k, v0] of Object.entries(row)) {
      let v = (v0 ?? '').toString();
      const before = v;
      v = v.replace(CONTROL_RE, '').replace(ZERO_WIDTH_RE, '');
      v = v.trim();
      if (v.length > maxCellLen) {
        v = v.slice(0, maxCellLen);
        truncatedCells += 1;
      }
      if (looksSuspiciousCell(before)) suspiciousCells += 1;
      next[k] = v;
    }
    nextRows.push(next);
  }

  return { rows: nextRows, meta: { truncatedCells, suspiciousCells } };
}


import type { SanitizeHeadersResult, SanitizeSampleRowsResult } from './sanitize';

export type AdversarialSeverity = 'low' | 'med' | 'high';

export interface AdversarialDetection {
  isAdversarial: boolean;
  severity: AdversarialSeverity;
  reasons: string[];
}

function hasInjectionPhrase(s: string): boolean {
  const v = (s || '').toLowerCase();
  if (!v) return false;
  return (
    v.includes('ignore previous') ||
    v.includes('disregard previous') ||
    v.includes('system prompt') ||
    v.includes('<system>') ||
    v.includes('```') ||
    v.includes('do not follow') ||
    v.includes('developer message')
  );
}

function highNonAlnumRatio(s: string): boolean {
  const v = (s || '').toString();
  if (!v) return false;
  const len = v.length;
  const non = v.replace(/[a-z0-9]/gi, '').length;
  return len >= 12 && non / len > 0.6;
}

export function detectAdversarialSchema(
  headers: SanitizeHeadersResult,
  rows: SanitizeSampleRowsResult
): AdversarialDetection {
  const reasons: string[] = [];

  if (headers.meta.duplicates.length > 0) {
    reasons.push('duplicate_normalized_headers');
  }

  for (const h of headers.headers) {
    if (hasInjectionPhrase(h)) reasons.push('injection_phrase_in_header');
    if (highNonAlnumRatio(h)) reasons.push('high_non_alnum_header');
    const flags = headers.meta.flagsByHeader[h] ?? [];
    if (flags.includes('truncated')) reasons.push('truncated_header');
    if (flags.includes('control_chars_removed') || flags.includes('zero_width_removed')) {
      reasons.push('control_or_zero_width_in_header');
    }
  }

  if (rows.meta.truncatedCells > 0) reasons.push('truncated_cells');
  if (rows.meta.suspiciousCells > 0) reasons.push('suspicious_cells');

  const uniqueReasons = Array.from(new Set(reasons));
  if (uniqueReasons.length === 0) {
    return { isAdversarial: false, severity: 'low', reasons: [] };
  }

  // Severity heuristic: duplicates + injection markers or suspicious payloads are high.
  const hasDup = uniqueReasons.includes('duplicate_normalized_headers');
  const hasInjection = uniqueReasons.includes('injection_phrase_in_header');
  const hasSuspiciousCells = uniqueReasons.includes('suspicious_cells');
  const hasTrunc = uniqueReasons.includes('truncated_cells') || uniqueReasons.includes('truncated_header');

  let severity: AdversarialSeverity = 'low';
  if ((hasDup && hasInjection) || hasSuspiciousCells) severity = 'high';
  else if (hasDup || hasInjection || hasTrunc) severity = 'med';

  return { isAdversarial: true, severity, reasons: uniqueReasons };
}


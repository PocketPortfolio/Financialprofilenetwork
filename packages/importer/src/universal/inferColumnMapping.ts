/**
 * Heuristic column mapping: match CSV headers to StandardField using synonym dictionary.
 */

import type { UniversalMapping, StandardField } from './types';
import { REQUIRED_FIELDS } from './types';
import { SYNONYMS, normalizeHeader, headerMatchesSynonym } from './synonyms';
import { toISO, toNumber } from '../normalize';

export interface InferResult {
  mapping: UniversalMapping;
  confidence: number;
}

const LOCALE_FOR_VALIDATION = 'en-US';

/**
 * Infer which CSV column maps to each standard field.
 * Optionally validates quantity/price columns have numeric sample values.
 */
export function inferColumnMapping(
  headers: string[],
  sampleRows: Record<string, string>[],
  _options?: { validateNumeric?: boolean }
): InferResult {
  const mapping: UniversalMapping = {};
  const usedNorm = new Set<string>();

  const rows = sampleRows.slice(0, 5);

  const headerNorm = new Map<string, string>();
  for (const h of headers) headerNorm.set(h, normalizeHeader(h));

  function scoreCandidate(field: StandardField, header: string): number {
    let score = 0;

    // Base: synonym hit (already filtered by caller) – small positive
    score += 10;

    // Shape checks from sample values
    if (rows.length > 0) {
      let ok = 0;
      let seen = 0;
      for (const r of rows) {
        const v = r[header];
        if (v == null || String(v).trim() === '') continue;
        seen += 1;
        try {
          if (field === 'date') toISO(String(v), LOCALE_FOR_VALIDATION);
          else if (field === 'quantity' || field === 'price' || field === 'fees')
            toNumber(String(v), LOCALE_FOR_VALIDATION);
          else if (field === 'action') {
            const a = String(v).toUpperCase();
            if (/BUY|SELL|DEPOSIT|WITHDRAW|TRANSFER|DIVIDEND|INTEREST/.test(a)) ok += 1;
            continue;
          }
          ok += 1;
        } catch {
          // ignore
        }
      }
      if (seen > 0) score += Math.round((ok / seen) * 20); // up to +20
    }

    // Prefer shorter, earlier headers (deterministic tie-break helpers)
    score += Math.max(0, 8 - Math.floor(header.length / 10));

    return score;
  }

  function pickBest(field: StandardField): string | null {
    const synonyms = SYNONYMS[field];
    const candidates = headers.filter((h) => synonyms.some((s) => headerMatchesSynonym(h, s)));
    if (candidates.length === 0) return null;

    let best: string | null = null;
    let bestScore = -1;
    for (const c of candidates) {
      const norm = headerNorm.get(c) ?? normalizeHeader(c);
      if (usedNorm.has(norm)) continue;
      const s = scoreCandidate(field, c);
      if (s > bestScore) {
        bestScore = s;
        best = c;
        continue;
      }
      if (s === bestScore && best) {
        // Deterministic tie-break: shorter header, then earlier occurrence
        if (c.length < best.length) best = c;
        else if (c.length === best.length) {
          if (headers.indexOf(c) < headers.indexOf(best)) best = c;
        }
      }
    }
    return best;
  }

  // Assign in a stable order (required fields first) to reduce collisions.
  const fieldOrder: StandardField[] = [
    ...REQUIRED_FIELDS,
    ...(['currency', 'fees'] as StandardField[]),
  ];

  for (const field of fieldOrder) {
    const chosen = pickBest(field);
    if (!chosen) continue;
    mapping[field] = chosen;
    usedNorm.add(normalizeHeader(chosen));
  }

  const requiredMapped = REQUIRED_FIELDS.filter((f) => mapping[f]).length;
  const confidence =
    REQUIRED_FIELDS.length === 0
      ? 1
      : requiredMapped / REQUIRED_FIELDS.length;

  return { mapping, confidence };
}

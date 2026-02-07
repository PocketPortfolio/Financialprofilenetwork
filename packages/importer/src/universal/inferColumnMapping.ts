/**
 * Heuristic column mapping: match CSV headers to StandardField using synonym dictionary.
 */

import type { UniversalMapping, StandardField } from './types';
import { REQUIRED_FIELDS } from './types';
import { SYNONYMS, normalizeHeader, headerMatchesSynonym } from './synonyms';
import { toNumber } from '../normalize';

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

  for (const field of Object.keys(SYNONYMS) as StandardField[]) {
    const synonyms = SYNONYMS[field];
    for (const syn of synonyms) {
      const match = headers.find((h) => headerMatchesSynonym(h, syn));
      if (match) {
        // Avoid mapping the same header to multiple fields (first wins)
        const alreadyUsed = Object.values(mapping).some(
          (v) => normalizeHeader(v) === normalizeHeader(match)
        );
        if (!alreadyUsed) {
          mapping[field] = match;
          break;
        }
      }
    }
  }

  // Optional: prefer numeric-looking columns for quantity/price when ambiguous
  if (sampleRows.length > 0) {
    for (const field of ['quantity', 'price'] as const) {
      const col = mapping[field];
      if (!col) continue;
      let allNumeric = true;
      for (const row of sampleRows.slice(0, 5)) {
        const val = row[col];
        if (val == null || String(val).trim() === '') continue;
        try {
          toNumber(String(val), LOCALE_FOR_VALIDATION);
        } catch {
          allNumeric = false;
          break;
        }
      }
      if (!allNumeric) {
        // Try to find another header that matches synonym and has numeric samples
        const synonyms = SYNONYMS[field];
        for (const syn of synonyms) {
          const candidate = headers.find((h) => headerMatchesSynonym(h, syn));
          if (!candidate || candidate === col) continue;
          const used = Object.values(mapping).some(
            (v) => normalizeHeader(v) === normalizeHeader(candidate)
          );
          if (used) continue;
          let ok = true;
          for (const row of sampleRows.slice(0, 5)) {
            const val = row[candidate];
            if (val == null || String(val).trim() === '') continue;
            try {
              toNumber(String(val), LOCALE_FOR_VALIDATION);
            } catch {
              ok = false;
              break;
            }
          }
          if (ok) {
            mapping[field] = candidate;
            break;
          }
        }
      }
    }
  }

  const requiredMapped = REQUIRED_FIELDS.filter((f) => mapping[f]).length;
  const confidence =
    REQUIRED_FIELDS.length === 0
      ? 1
      : requiredMapped / REQUIRED_FIELDS.length;

  return { mapping, confidence };
}

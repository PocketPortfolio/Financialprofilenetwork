/**
 * Universal pipeline (probabilistic). Trigger: unknown broker or "Smart Import".
 * Always requires user confirmation of mapping before final parse when confidence is low.
 */

import type { RawFile, ParseResult } from '../adapters/types';
import type { UniversalMapping, RequiresMappingResult } from './types';
import { REQUIRED_FIELDS } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { inferMapping } from './inference';
import { genericParse } from './genericAdapter';

export type { UniversalMapping, RequiresMappingResult, StandardField } from './types';
export { genericParse, genericRowToTrade } from './genericAdapter';
export { inferMapping } from './inference';
export type { InferMappingInput, InferMappingOutput } from './inference';

const UNIVERSAL_CONFIDENCE_THRESHOLD = 0.9;

/**
 * Parse via Universal path. If userMapping is provided, parse immediately.
 * Otherwise infer mapping and return REQUIRES_MAPPING for UI confirmation when confidence is low.
 */
export async function parseUniversal(
  file: RawFile,
  locale: string = 'en-US',
  userMapping?: UniversalMapping
): Promise<ParseResult | RequiresMappingResult> {
  const text = await csvFrom(file);
  const rows = csvParse(text);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const sampleRows = rows.slice(0, 10);

  if (userMapping && REQUIRED_FIELDS.every((f) => userMapping[f])) {
    return genericParse(text, userMapping, locale);
  }

  const { mapping, confidence } = await inferMapping({ headers, sampleRows });

  const allRequiredMapped = REQUIRED_FIELDS.every((f) => mapping[f]);
  if (confidence >= UNIVERSAL_CONFIDENCE_THRESHOLD && allRequiredMapped) {
    return genericParse(text, mapping, locale);
  }

  return {
    type: 'REQUIRES_MAPPING',
    headers,
    sampleRows,
    proposedMapping: mapping,
    confidence,
    rawCsvText: text,
  };
}

/**
 * Universal import: semantic column mapping (no broker-specific parsing).
 */

export type StandardField =
  | 'date'
  | 'ticker'
  | 'action'
  | 'quantity'
  | 'price'
  | 'currency'
  | 'fees';

/** Maps our internal field names to CSV column names (headers). */
export type UniversalMapping = Partial<Record<StandardField, string>>;

/** Result when we need user to confirm or edit column mapping before parsing. */
export interface RequiresMappingResult {
  type: 'REQUIRES_MAPPING';
  headers: string[];
  sampleRows: Record<string, string>[];
  proposedMapping: UniversalMapping;
  confidence: number;
  rawCsvText: string;
}

export const REQUIRED_FIELDS: StandardField[] = [
  'date',
  'ticker',
  'action',
  'quantity',
  'price',
];

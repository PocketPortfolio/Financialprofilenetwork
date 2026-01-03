/**
 * @pocket-portfolio/importer
 * Universal CSV parser for 15+ brokers (Robinhood, Fidelity, eToro, etc.)
 *
 * @example
 * ```typescript
 * import { parseCSV, detectBroker } from '@pocket-portfolio/importer';
 *
 * const file = // ... File object
 * const broker = detectBroker(csvHeader);
 * const result = await parseCSV(file, 'en-US');
 * ```
 */
import type { RawFile, ParseResult, BrokerId } from './adapters/types';
/**
 * Detect the broker from a CSV header sample
 * @param sampleCsvHead First few lines of the CSV file (header + 1-2 data rows)
 * @returns Detected broker ID or 'unknown'
 */
export declare function detectBrokerFromSample(sampleCsvHead: string): BrokerId | 'unknown';
/**
 * Parse a CSV file and return normalized trades
 * @param file CSV or Excel file
 * @param locale Locale for date/number parsing (default: 'en-US')
 * @param brokerId Optional broker ID to use (if not provided, will auto-detect)
 * @returns ParseResult with trades, warnings, and metadata
 */
export declare function parseCSV(file: RawFile, locale?: string, brokerId?: BrokerId): Promise<ParseResult>;
export type { BrokerId, RawFile, NormalizedTrade, ParseResult, BrokerAdapter, } from './adapters/types';
export { detectBroker, ADAPTERS } from './registry';

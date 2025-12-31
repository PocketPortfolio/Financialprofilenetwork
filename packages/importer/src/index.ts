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

import { detectBroker, ADAPTERS } from './registry';
import type { RawFile, ParseResult, BrokerId } from './adapters/types';

// Runtime Nudge - Track if we've shown the console message
let hasLoggedRuntimeNudge = false;

/**
 * Detect the broker from a CSV header sample
 * @param sampleCsvHead First few lines of the CSV file (header + 1-2 data rows)
 * @returns Detected broker ID or 'unknown'
 */
export function detectBrokerFromSample(sampleCsvHead: string): BrokerId | 'unknown' {
  return detectBroker(sampleCsvHead);
}

/**
 * Parse a CSV file and return normalized trades
 * @param file CSV or Excel file
 * @param locale Locale for date/number parsing (default: 'en-US')
 * @param brokerId Optional broker ID to use (if not provided, will auto-detect)
 * @returns ParseResult with trades, warnings, and metadata
 */
export async function parseCSV(
  file: RawFile,
  locale: string = 'en-US',
  brokerId?: BrokerId
): Promise<ParseResult> {
  // Runtime Nudge - Show once per session in browser console
  if (!hasLoggedRuntimeNudge) {
    try {
      // Check if we're in a browser environment
      if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
        console.log(
          "%c 🚀 Pocket Portfolio Importer %c \n" + 
          "You are using the Open Source version.\n" +
          "Only 12/50 Founder's Club spots remain: https://pocketportfolio.app/sponsor?ref=console_log", 
          "background: #f97316; color: white; font-weight: bold; padding: 2px 4px; border-radius: 2px;",
          "color: #f97316;"
        );
        hasLoggedRuntimeNudge = true;
      }
    } catch (e) {
      // Silently fail if window is not available (Node.js environment)
    }
  }
  // If broker ID is provided, use it directly
  if (brokerId) {
    const adapter = ADAPTERS.find(a => a.id === brokerId);
    if (!adapter) {
      throw new Error(`Broker adapter not found: ${brokerId}`);
    }
    return adapter.parse(file, locale);
  }

  // Otherwise, auto-detect
  const text = await file.arrayBuffer().then(buf => {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buf.slice(0, 2048)); // First 2KB for detection
  });

  const detected = detectBroker(text);
  if (detected === 'unknown') {
    throw new Error('Could not detect broker from CSV header. Please specify brokerId manually.');
  }

  const adapter = ADAPTERS.find(a => a.id === detected);
  if (!adapter) {
    throw new Error(`Broker adapter not found: ${detected}`);
  }

  return adapter.parse(file, locale);
}

// Re-export types
export type {
  BrokerId,
  RawFile,
  NormalizedTrade,
  ParseResult,
  BrokerAdapter,
} from './adapters/types';

// Re-export registry functions
export { detectBroker, ADAPTERS } from './registry';








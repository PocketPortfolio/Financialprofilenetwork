/**
 * Parse Koinly CSV exports into normalized format
 * 
 * This package is a lightweight wrapper around @pocket-portfolio/importer
 * for koinly csv parser.
 * 
 * @example
 * ```javascript
 * import { parseCSV } from '@pocket-portfolio/koinly-csv-parser';
 * 
 * const result = await parseCSV(file, 'en-US');
 * console.log(`Parsed ${result.trades.length} trades`);
 * ```
 */

// Re-export everything from core importer
module.exports = require('@pocket-portfolio/importer');


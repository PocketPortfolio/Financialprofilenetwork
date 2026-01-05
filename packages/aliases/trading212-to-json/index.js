/**
 * Convert Trading212 CSV exports to JSON format
 * 
 * This package is a lightweight wrapper around @pocket-portfolio/importer
 * for trading212 to json.
 * 
 * @example
 * ```javascript
 * import { parseCSV } from '@pocket-portfolio/trading212-to-json';
 * 
 * const result = await parseCSV(file, 'en-US');
 * console.log(`Parsed ${result.trades.length} trades`);
 * ```
 */

// Re-export everything from core importer
module.exports = require('@pocket-portfolio/importer');

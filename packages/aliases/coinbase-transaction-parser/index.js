/**
 * Parse Coinbase transaction history from CSV
 * 
 * This package is a lightweight wrapper around @pocket-portfolio/importer
 * for coinbase transaction parser.
 * 
 * @example
 * ```javascript
 * import { parseCSV } from '@pocket-portfolio/coinbase-transaction-parser';
 * 
 * const result = await parseCSV(file, 'en-US');
 * console.log(`Parsed ${result.trades.length} trades`);
 * ```
 */

// Re-export everything from core importer
module.exports = require('@pocket-portfolio/importer');

/**
 * Parse Fidelity CSV exports for portfolio tracking
 * 
 * This package is a lightweight wrapper around @pocket-portfolio/importer
 * for fidelity csv export.
 * 
 * @example
 * ```javascript
 * import { parseCSV } from '@pocket-portfolio/fidelity-csv-export';
 * 
 * const result = await parseCSV(file, 'en-US');
 * console.log(`Parsed ${result.trades.length} trades`);
 * ```
 */

// Re-export everything from core importer
module.exports = require('@pocket-portfolio/importer');

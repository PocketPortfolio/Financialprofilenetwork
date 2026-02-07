/**
 * Universal CSV Importer – Smart Mapping for any broker
 *
 * This package exposes only the Universal Import API from @pocket-portfolio/importer:
 * parseUniversal, genericParse, genericRowToTrade, inferMapping.
 * For TypeScript types (UniversalMapping, RequiresMappingResult, etc.) use the core package.
 *
 * @example
 * ```javascript
 * const { parseUniversal, genericParse, inferMapping } = require('@pocket-portfolio/universal-csv-importer');
 *
 * // Parse with automatic column inference (returns ParseResult or RequiresMappingResult)
 * const result = await parseUniversal(file, 'en-US');
 * if (result.type === 'REQUIRES_MAPPING') {
 *   // Show UI for user to confirm/edit mapping, then:
 *   const parsed = genericParse(result.rawCsvText, userMapping, 'en-US');
 * }
 * ```
 */

const importer = require('@pocket-portfolio/importer');

module.exports = {
  parseUniversal: importer.parseUniversal,
  genericParse: importer.genericParse,
  genericRowToTrade: importer.genericRowToTrade,
  inferMapping: importer.inferMapping,
};

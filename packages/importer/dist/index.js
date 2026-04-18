"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.headerMatchesSynonym = exports.normalizeHeader = exports.SYNONYMS = exports.inferMapping = exports.genericRowToTrade = exports.genericParse = exports.parseUniversal = exports.ADAPTERS = exports.detectBroker = void 0;
exports.detectBrokerFromSample = detectBrokerFromSample;
exports.parseCSV = parseCSV;
const registry_1 = require("./registry");
// Runtime Nudge - Track if we've shown the console message
let hasLoggedRuntimeNudge = false;
/**
 * Detect the broker from a CSV header sample
 * @param sampleCsvHead First few lines of the CSV file (header + 1-2 data rows)
 * @returns Detected broker ID or 'unknown'
 */
function detectBrokerFromSample(sampleCsvHead) {
    return (0, registry_1.detectBroker)(sampleCsvHead);
}
/**
 * Parse a CSV file and return normalized trades
 * @param file CSV or Excel file
 * @param locale Locale for date/number parsing (default: 'en-US')
 * @param brokerId Optional broker ID to use (if not provided, will auto-detect)
 * @returns ParseResult with trades, warnings, and metadata
 */
async function parseCSV(file, locale = 'en-US', brokerId) {
    // Runtime Nudge - Show once per session in browser console
    if (!hasLoggedRuntimeNudge) {
        try {
            // Check if we're in a browser environment
            if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
                console.log("%c 🚀 Pocket Portfolio Importer %c \n" +
                    "You are using the Open Source version.\n" +
                    "Only 42/50 Founder's Club spots remain: https://pocketportfolio.app/sponsor?ref=console_log", "background: #f97316; color: white; font-weight: bold; padding: 2px 4px; border-radius: 2px;", "color: #f97316;");
                hasLoggedRuntimeNudge = true;
            }
        }
        catch (e) {
            // Silently fail if window is not available (Node.js environment)
        }
    }
    // If broker ID is provided, use it directly
    if (brokerId) {
        const adapter = registry_1.ADAPTERS.find(a => a.id === brokerId);
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
    const detected = (0, registry_1.detectBroker)(text);
    if (detected === 'unknown') {
        throw new Error('Could not detect broker from CSV header. Please specify brokerId manually.');
    }
    const adapter = registry_1.ADAPTERS.find(a => a.id === detected);
    if (!adapter) {
        throw new Error(`Broker adapter not found: ${detected}`);
    }
    return adapter.parse(file, locale);
}
// Re-export registry functions
var registry_2 = require("./registry");
Object.defineProperty(exports, "detectBroker", { enumerable: true, get: function () { return registry_2.detectBroker; } });
Object.defineProperty(exports, "ADAPTERS", { enumerable: true, get: function () { return registry_2.ADAPTERS; } });
// Re-export Universal Import (Smart Mapping) API
var universal_1 = require("./universal");
Object.defineProperty(exports, "parseUniversal", { enumerable: true, get: function () { return universal_1.parseUniversal; } });
Object.defineProperty(exports, "genericParse", { enumerable: true, get: function () { return universal_1.genericParse; } });
Object.defineProperty(exports, "genericRowToTrade", { enumerable: true, get: function () { return universal_1.genericRowToTrade; } });
Object.defineProperty(exports, "inferMapping", { enumerable: true, get: function () { return universal_1.inferMapping; } });
/** Column header normalization for client-side fuzzy pre-pass (CSV first row). */
var synonyms_1 = require("./universal/synonyms");
Object.defineProperty(exports, "SYNONYMS", { enumerable: true, get: function () { return synonyms_1.SYNONYMS; } });
Object.defineProperty(exports, "normalizeHeader", { enumerable: true, get: function () { return synonyms_1.normalizeHeader; } });
Object.defineProperty(exports, "headerMatchesSynonym", { enumerable: true, get: function () { return synonyms_1.headerMatchesSynonym; } });

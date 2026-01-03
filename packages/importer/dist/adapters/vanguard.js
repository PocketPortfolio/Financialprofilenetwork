"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vanguard = void 0;
const csvFrom_1 = require("../io/csvFrom");
const normalize_1 = require("../normalize");
exports.vanguard = {
    id: 'vanguard',
    detect: (sample) => /(^|\n)(Transaction Date|Symbol|Action|Quantity|Price|Vanguard|Vanguard.*Account)/i.test(sample),
    parse: async (file, locale = 'en-US') => {
        const t0 = performance.now();
        const text = await (0, csvFrom_1.csvFrom)(file);
        const rows = (0, csvFrom_1.csvParse)(text);
        const trades = [];
        const warnings = [];
        for (const r of rows) {
            try {
                const action = (r['Action'] || r['Transaction Type'] || '').toUpperCase();
                if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER')) {
                    continue; // Skip non-trade rows
                }
                const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
                const out = {
                    date: (0, normalize_1.toISO)(r['Transaction Date'] ?? r['Date'] ?? r['Trade Date'] ?? '', locale),
                    ticker: (0, normalize_1.toTicker)(r['Symbol'] ?? r['Ticker'] ?? r['Security'] ?? ''),
                    type,
                    qty: (0, normalize_1.toNumber)(r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0', locale),
                    price: (0, normalize_1.toNumber)(r['Price'] ?? r['Trade Price'] ?? r['Execution Price'] ?? '0', locale),
                    currency: r['Currency'] ?? (0, normalize_1.inferCurrency)(r, 'USD'),
                    fees: r['Commission'] ? (0, normalize_1.toNumber)(r['Commission'], locale) : 0,
                    source: 'vanguard',
                    rawHash: (0, normalize_1.hashRow)(r),
                };
                if (!(out.qty > 0) || !(out.price > 0))
                    throw new Error('Non-positive qty/price');
                trades.push(out);
            }
            catch (e) {
                warnings.push(`row ${JSON.stringify(r).slice(0, 120)}… → ${e.message}`);
            }
        }
        const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now() - t0), version: '1.0.0' };
        return { broker: 'vanguard', trades, warnings, meta };
    }
};

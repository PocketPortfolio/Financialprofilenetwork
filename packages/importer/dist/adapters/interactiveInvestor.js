"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactiveInvestor = void 0;
const csvFrom_1 = require("../io/csvFrom");
const normalize_1 = require("../normalize");
exports.interactiveInvestor = {
    id: 'interactive_investor',
    detect: (sample) => /(^|\n)(Date|Stock|Action|Quantity|Price|Interactive Investor)/i.test(sample),
    parse: async (file, locale = 'en-GB') => {
        const t0 = performance.now();
        const text = await (0, csvFrom_1.csvFrom)(file);
        const rows = (0, csvFrom_1.csvParse)(text);
        const trades = [];
        const warnings = [];
        for (const r of rows) {
            try {
                const action = (r['Action'] || r['Type'] || '').toUpperCase();
                if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER')) {
                    continue; // Skip non-trade rows
                }
                const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
                const out = {
                    date: (0, normalize_1.toISO)(r['Date'] ?? r['Trade Date'] ?? r['Transaction Date'] ?? '', locale),
                    ticker: (0, normalize_1.toTicker)(r['Stock'] ?? r['Symbol'] ?? r['Ticker'] ?? ''),
                    type,
                    qty: (0, normalize_1.toNumber)(r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0', locale),
                    price: (0, normalize_1.toNumber)(r['Price'] ?? r['Trade Price'] ?? r['Execution Price'] ?? '0', locale),
                    currency: r['Currency'] ?? (0, normalize_1.inferCurrency)(r, 'GBP'),
                    fees: r['Commission'] ? (0, normalize_1.toNumber)(r['Commission'], locale) : 0,
                    source: 'interactive_investor',
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
        return { broker: 'interactive_investor', trades, warnings, meta };
    }
};

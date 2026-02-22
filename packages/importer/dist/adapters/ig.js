"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ig = void 0;
const csvFrom_1 = require("../io/csvFrom");
const normalize_1 = require("../normalize");
exports.ig = {
    id: 'ig',
    detect: (sample) => /\bIG\b/i.test(sample) && /(Date|Instrument|Action|Quantity|Price)/i.test(sample),
    parse: async (file, locale = 'en-GB') => {
        const t0 = performance.now();
        const text = await (0, csvFrom_1.csvFrom)(file);
        const rows = (0, csvFrom_1.csvParse)(text);
        const trades = [];
        const warnings = [];
        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            try {
                const action = (r['Action'] || r['Type'] || '').toUpperCase();
                if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER')) {
                    continue; // Skip non-trade rows
                }
                const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
                const dateStr = r['Date'] ?? r['Trade Date'] ?? r['Transaction Date'] ?? '';
                const instrument = r['Instrument'] ?? r['Symbol'] ?? r['Ticker'] ?? '';
                const qtyStr = r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0';
                const priceStr = r['Price'] ?? r['Trade Price'] ?? r['Execution Price'] ?? '0';
                const date = (0, normalize_1.toISO)(dateStr, locale);
                const ticker = (0, normalize_1.toTicker)(instrument);
                const qty = (0, normalize_1.toNumber)(qtyStr, locale);
                const price = (0, normalize_1.toNumber)(priceStr, locale);
                const out = {
                    date,
                    ticker,
                    type,
                    qty,
                    price,
                    currency: r['Currency'] ?? (0, normalize_1.inferCurrency)(r, 'GBP'),
                    fees: r['Commission'] ? (0, normalize_1.toNumber)(r['Commission'], locale) : 0,
                    source: 'ig',
                    rawHash: (0, normalize_1.hashRow)(r),
                };
                if (!(out.qty > 0) || !(out.price > 0)) {
                    throw new Error('Non-positive qty/price');
                }
                trades.push(out);
            }
            catch (e) {
                warnings.push(`row ${JSON.stringify(r).slice(0, 120)}… → ${e.message}`);
            }
        }
        const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now() - t0), version: '1.0.0' };
        return { broker: 'ig', trades, warnings, meta };
    }
};

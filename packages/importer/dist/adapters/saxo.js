"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saxo = void 0;
const csvFrom_1 = require("../io/csvFrom");
const normalize_1 = require("../normalize");
exports.saxo = {
    id: 'saxo',
    detect: (sample) => /(^|\n)(Trade Date|Instrument|Action|Quantity|Price|Saxo)/i.test(sample),
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
                const rawDate = r['Trade Date'] ?? r['Date'] ?? r['Transaction Date'] ?? '';
                const rawInstrument = r['Instrument'] ?? r['Symbol'] ?? r['Ticker'] ?? '';
                const rawQuantity = r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0';
                const rawPrice = r['Price'] ?? r['Trade Price'] ?? r['Execution Price'] ?? '0';
                const normalizedDate = (0, normalize_1.toISO)(rawDate, locale);
                const normalizedTicker = (0, normalize_1.toTicker)(rawInstrument);
                const normalizedQty = (0, normalize_1.toNumber)(rawQuantity, locale);
                const normalizedPrice = (0, normalize_1.toNumber)(rawPrice, locale);
                const out = {
                    date: normalizedDate,
                    ticker: normalizedTicker,
                    type,
                    qty: normalizedQty,
                    price: normalizedPrice,
                    currency: r['Currency'] ?? (0, normalize_1.inferCurrency)(r, 'GBP'),
                    fees: r['Commission'] ? (0, normalize_1.toNumber)(r['Commission'], locale) : 0,
                    source: 'saxo',
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
        return { broker: 'saxo', trades, warnings, meta };
    }
};

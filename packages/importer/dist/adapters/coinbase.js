"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coinbase = void 0;
const csvFrom_1 = require("../io/csvFrom");
const normalize_1 = require("../normalize");
exports.coinbase = {
    id: 'coinbase',
    detect: (sample) => {
        // More specific: require "Transaction Type" AND "Spot Price at Transaction" (Coinbase-specific columns)
        const hasTransactionType = /(^|\n)(Transaction Type)/i.test(sample);
        const hasSpotPriceAtTransaction = /(^|\n)(Spot Price at Transaction)/i.test(sample);
        const hasAsset = /(^|\n)(Asset)/i.test(sample);
        // Coinbase has these three specific columns together
        return hasTransactionType && hasSpotPriceAtTransaction && hasAsset;
    },
    parse: async (file, locale = 'en-US') => {
        const t0 = performance.now();
        const text = await (0, csvFrom_1.csvFrom)(file);
        const rows = (0, csvFrom_1.csvParse)(text);
        const trades = [];
        const warnings = [];
        for (const r of rows) {
            try {
                const action = (r['Transaction Type'] || r['Type'] || '').toUpperCase();
                if (!action || action.includes('DEPOSIT') || action.includes('WITHDRAWAL') || action.includes('TRANSFER')) {
                    continue; // Skip non-trade rows
                }
                const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
                const out = {
                    date: (0, normalize_1.toISO)(r['Timestamp'] ?? r['Date'] ?? r['Time'] ?? '', locale),
                    ticker: (0, normalize_1.toTicker)(r['Asset'] ?? r['Symbol'] ?? r['Ticker'] ?? ''),
                    type,
                    qty: (0, normalize_1.toNumber)(r['Quantity Transacted'] ?? r['Quantity'] ?? r['Qty'] ?? '0', locale),
                    price: (0, normalize_1.toNumber)(r['Spot Price at Transaction'] ?? r['Price'] ?? r['Trade Price'] ?? '0', locale),
                    currency: r['Spot Price Currency'] ?? r['Currency'] ?? (0, normalize_1.inferCurrency)(r, 'USD'),
                    fees: r['Fees'] ? (0, normalize_1.toNumber)(r['Fees'], locale) : 0,
                    source: 'coinbase',
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
        return { broker: 'coinbase', trades, warnings, meta };
    }
};

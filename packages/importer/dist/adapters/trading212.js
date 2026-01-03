"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trading212 = void 0;
const csvFrom_1 = require("../io/csvFrom");
const normalize_1 = require("../normalize");
exports.trading212 = {
    id: 'trading212',
    detect: (sample) => {
        // Trading212 has very specific column names
        const hasAction = /\bAction\b/i.test(sample);
        const hasTime = /\bTime\b/i.test(sample);
        const hasISIN = /\bISIN\b/i.test(sample);
        const hasNoOfShares = /\bNo\. of shares\b/i.test(sample);
        const hasPricePerShare = /\bPrice \/ share\b/i.test(sample);
        // Must have at least 3 of these specific Trading212 columns
        const matchCount = [hasAction, hasTime, hasISIN, hasNoOfShares, hasPricePerShare].filter(Boolean).length;
        return matchCount >= 3;
    },
    parse: async (file, locale = 'en-GB') => {
        const t0 = performance.now();
        const text = await (0, csvFrom_1.csvFrom)(file);
        const rows = (0, csvFrom_1.csvParse)(text);
        const trades = [];
        const warnings = [];
        for (const r of rows) {
            try {
                let action = (r['Action'] || r['Type'] || '').toUpperCase();
                if (!action)
                    continue;
                // Extract base action from suffixes (e.g., "Dividend (Ordinary)" -> skip, "Market buy" -> "BUY")
                if (action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('DEPOSIT') || action.includes('WITHDRAWAL')) {
                    continue; // Skip non-trade rows
                }
                // Handle "Market buy", "Market sell" -> extract "BUY" or "SELL"
                if (action.includes('MARKET BUY') || action.includes('BUY')) {
                    action = 'BUY';
                }
                else if (action.includes('MARKET SELL') || action.includes('SELL')) {
                    action = 'SELL';
                }
                const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
                const out = {
                    date: (0, normalize_1.toISO)(r['Time'] ?? r['Date'] ?? r['Timestamp'] ?? '', locale),
                    ticker: (0, normalize_1.toTicker)(r['Ticker'] ?? r['Instrument'] ?? r['Asset'] ?? ''),
                    type,
                    qty: (0, normalize_1.toNumber)(r['No. of shares'] ?? r['Quantity'] ?? r['Units'] ?? r['Amount'] ?? '0', locale),
                    price: (0, normalize_1.toNumber)(r['Price / share'] ?? r['Price'] ?? r['OpenRate'] ?? r['Share Price'] ?? '0', locale),
                    currency: r['Currency (Price / share)'] ?? r['Currency'] ?? (0, normalize_1.inferCurrency)(r, 'GBP'),
                    fees: r['Charge amount (USD)'] ? (0, normalize_1.toNumber)(r['Charge amount (USD)'], locale) : 0,
                    source: 'trading212',
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
        return { broker: 'trading212', trades, warnings, meta };
    }
};

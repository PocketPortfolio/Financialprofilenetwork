"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ghostfolio = void 0;
const csvFrom_1 = require("../io/csvFrom");
const normalize_1 = require("../normalize");
exports.ghostfolio = {
    id: 'ghostfolio',
    detect: (sample) => /(^|\n)(accountId|symbol|type|quantity|unitPrice|currency|date|Ghostfolio)/i.test(sample),
    parse: async (file, locale = 'en-US') => {
        const t0 = performance.now();
        const text = await (0, csvFrom_1.csvFrom)(file);
        const rows = (0, csvFrom_1.csvParse)(text);
        const trades = [];
        const warnings = [];
        for (const r of rows) {
            try {
                // Ghostfolio uses lowercase column names
                const action = (r['type'] ?? r['Type'] ?? r['Transaction Type'] ?? '').toUpperCase();
                if (!action || action.includes('DIVIDEND') || action.includes('INTEREST')) {
                    continue; // Skip non-trade rows (can be added later)
                }
                const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
                const out = {
                    date: (0, normalize_1.toISO)(r['date'] ?? r['Date'] ?? r['Transaction Date'] ?? '', locale),
                    ticker: (0, normalize_1.toTicker)(r['symbol'] ?? r['Symbol'] ?? r['Ticker'] ?? r['Asset'] ?? ''),
                    type,
                    qty: (0, normalize_1.toNumber)(r['quantity'] ?? r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0', locale),
                    price: (0, normalize_1.toNumber)(r['unitPrice'] ?? r['Unit Price'] ?? r['Price'] ?? r['price'] ?? r['Trade Price'] ?? '0', locale),
                    currency: r['currency'] ?? r['Currency'] ?? (0, normalize_1.inferCurrency)(r, 'USD'),
                    fees: (0, normalize_1.toNumber)(r['fee'] ?? r['Fee'] ?? r['Fees'] ?? r['Commission'] ?? '0', locale),
                    source: 'ghostfolio',
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
        return { broker: 'ghostfolio', trades, warnings, meta };
    }
};

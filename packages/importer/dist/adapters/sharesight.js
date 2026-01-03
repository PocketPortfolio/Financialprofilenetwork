"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharesight = void 0;
const csvFrom_1 = require("../io/csvFrom");
const normalize_1 = require("../normalize");
exports.sharesight = {
    id: 'sharesight',
    detect: (sample) => /(^|\n)(Trade Date|Instrument Code|Quantity|Price in Dollars|Transaction Type|Sharesight)/i.test(sample),
    parse: async (file, locale = 'en-US') => {
        const t0 = performance.now();
        const text = await (0, csvFrom_1.csvFrom)(file);
        const rows = (0, csvFrom_1.csvParse)(text);
        const trades = [];
        const warnings = [];
        for (const r of rows) {
            try {
                const action = (r['Transaction Type'] ?? r['transaction type'] ?? r['Type'] ?? r['type'] ?? '').toUpperCase();
                if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('SPLIT')) {
                    continue; // Skip non-trade rows (can be added later)
                }
                const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
                const out = {
                    date: (0, normalize_1.toISO)(r['Trade Date'] ?? r['trade date'] ?? r['Date'] ?? r['date'] ?? '', locale),
                    ticker: (0, normalize_1.toTicker)(r['Instrument Code'] ?? r['instrument code'] ?? r['Stock'] ?? r['Symbol'] ?? r['Ticker'] ?? ''),
                    type,
                    qty: (0, normalize_1.toNumber)(r['Quantity'] ?? r['quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0', locale),
                    price: (0, normalize_1.toNumber)(r['Price in Dollars'] ?? r['price in dollars'] ?? r['Price'] ?? r['price'] ?? r['Unit Price'] ?? '0', locale),
                    currency: r['Brokerage Currency'] ?? r['brokerage currency'] ?? r['Currency'] ?? (0, normalize_1.inferCurrency)(r, 'USD'),
                    fees: (0, normalize_1.toNumber)(r['Brokerage'] ?? r['brokerage'] ?? r['Commission'] ?? r['Fee'] ?? r['Fees'] ?? '0', locale),
                    source: 'sharesight',
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
        return { broker: 'sharesight', trades, warnings, meta };
    }
};

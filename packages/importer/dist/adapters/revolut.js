"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revolut = void 0;
const csvFrom_1 = require("../io/csvFrom");
const normalize_1 = require("../normalize");
exports.revolut = {
    id: 'revolut',
    detect: (sample) => /(^|\n)(Date|Stock|Ticker|Action|Type|Quantity|Price|Price per share|Revolut)/i.test(sample),
    parse: async (file, locale = 'en-GB') => {
        const t0 = performance.now();
        const text = await (0, csvFrom_1.csvFrom)(file);
        const rows = (0, csvFrom_1.csvParse)(text);
        const trades = [];
        const warnings = [];
        for (const r of rows) {
            try {
                // Handle both Action and Type columns, strip suffixes like "BUY - MARKET" -> "BUY"
                let action = (r['Action'] || r['Type'] || '').toUpperCase();
                if (!action)
                    continue;
                // Extract base action from suffixes (e.g., "BUY - MARKET" -> "BUY")
                action = action.split(/\s*-\s*/)[0].trim();
                // Skip non-trade rows
                if (action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER') ||
                    action.includes('CASH TOP-UP') || action.includes('CASH WITHDRAWAL') || action.includes('TOP-UP') ||
                    action.includes('WITHDRAWAL') || !action) {
                    continue;
                }
                // Skip rows without ticker/stock
                const tickerValue = r['Stock'] ?? r['Ticker'] ?? r['Symbol'] ?? '';
                if (!tickerValue || tickerValue.trim() === '')
                    continue;
                const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
                // Handle both "Price" and "Price per share" columns, strip currency prefix
                let priceValue = r['Price'] ?? r['Price per share'] ?? r['Trade Price'] ?? r['Execution Price'] ?? '0';
                // Strip currency prefix (e.g., "USD 111.97" -> "111.97")
                priceValue = priceValue.replace(/^[A-Z]{3}\s+/i, '').trim();
                // #region agent log
                const rowDebug = {
                    action: r['Action'] || r['Type'] || '',
                    tickerValue,
                    priceValue,
                    quantity: r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '',
                    date: r['Date'] ?? r['Trade Date'] ?? r['Transaction Date'] ?? '',
                };
                // #endregion
                const out = {
                    date: (0, normalize_1.toISO)(r['Date'] ?? r['Trade Date'] ?? r['Transaction Date'] ?? '', locale),
                    ticker: (0, normalize_1.toTicker)(tickerValue),
                    type,
                    qty: (0, normalize_1.toNumber)(r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0', locale),
                    price: (0, normalize_1.toNumber)(priceValue, locale),
                    currency: r['Currency'] ?? (0, normalize_1.inferCurrency)(r, 'GBP'),
                    fees: r['Commission'] ? (0, normalize_1.toNumber)(r['Commission'], locale) : 0,
                    source: 'revolut',
                    rawHash: (0, normalize_1.hashRow)(r),
                };
                if (!(out.qty > 0) || !(out.price > 0))
                    throw new Error('Non-positive qty/price');
                trades.push(out);
            }
            catch (e) {
                warnings.push(`row ${JSON.stringify(r).slice(0, 120)}… → ${e.message}`);
                // #region agent log
                console.error('[REVOLUT ADAPTER] Row parse error', { row: JSON.stringify(r).slice(0, 200), error: e.message });
                // #endregion
            }
        }
        const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now() - t0), version: '1.0.0' };
        return { broker: 'revolut', trades, warnings, meta };
    }
};

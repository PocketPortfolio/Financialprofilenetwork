"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ibkrFlex = void 0;
const csvFrom_1 = require("../io/csvFrom");
const normalize_1 = require("../normalize");
exports.ibkrFlex = {
    id: 'ibkr_flex',
    detect: (sample) => {
        // IBKR Flex has specific pattern: T.Price and Proceeds
        const hasTPrice = /T\.Price/i.test(sample);
        const hasProceeds = /Proceeds/i.test(sample);
        const hasIBKR = /IBKR/i.test(sample);
        return (hasTPrice && hasProceeds) || hasIBKR;
    },
    parse: async (file, locale = 'en-US') => {
        const t0 = performance.now();
        const text = await (0, csvFrom_1.csvFrom)(file);
        const rows = (0, csvFrom_1.csvParse)(text);
        const trades = [];
        const warnings = [];
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ibkrFlex.ts:parse:entry', message: 'IBKR Flex parse started', data: { rowsCount: rows.length, firstRow: rows[0] ? Object.keys(rows[0]) : [], sampleRow: rows[0] }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G' }) }).catch(() => { });
        // #endregion
        for (const r of rows) {
            try {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ibkrFlex.ts:parse:row', message: 'Processing row', data: { rowKeys: Object.keys(r), rowData: r, hasQuantity: !!r['Quantity'], hasTPrice: !!r['T.Price'], hasProceeds: !!r['Proceeds'], hasSymbol: !!r['Symbol'] }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G' }) }).catch(() => { });
                // #endregion
                // IBKR Flex may not have Action column - infer from quantity sign or proceeds
                let action = (r['Action'] || r['Type'] || '').toUpperCase();
                let qty = (0, normalize_1.toNumber)(r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0', locale);
                const proceeds = (0, normalize_1.toNumber)(r['Proceeds'] ?? '0', locale);
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ibkrFlex.ts:parse:values', message: 'Extracted values', data: { action, qty, proceeds, rawQuantity: r['Quantity'], rawProceeds: r['Proceeds'], rawTPrice: r['T.Price'], rawSymbol: r['Symbol'], rawDate: r['Date'] }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G' }) }).catch(() => { });
                // #endregion
                // If no Action column, infer from quantity sign (negative = sell) or proceeds sign
                if (!action) {
                    if (qty < 0) {
                        action = 'SELL';
                        qty = Math.abs(qty); // Make positive
                    }
                    else if (proceeds < 0) {
                        action = 'BUY'; // Negative proceeds = buy (money out)
                        qty = Math.abs(qty);
                    }
                    else if (proceeds > 0 && qty > 0) {
                        action = 'SELL'; // Positive proceeds = sell (money in)
                    }
                    else {
                        action = 'BUY'; // Default
                    }
                }
                if (action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER')) {
                    continue; // Skip non-trade rows
                }
                const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
                // Ensure quantity is positive
                if (qty < 0)
                    qty = Math.abs(qty);
                const date = (0, normalize_1.toISO)(r['Date'] ?? r['Trade Date'] ?? r['Transaction Date'] ?? '', locale);
                const ticker = (0, normalize_1.toTicker)(r['Symbol'] ?? r['Ticker'] ?? r['Security'] ?? '');
                const price = (0, normalize_1.toNumber)(r['T.Price'] ?? r['Price'] ?? r['Trade Price'] ?? '0', locale);
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ibkrFlex.ts:parse:final', message: 'Final values before trade creation', data: { date, ticker, type, qty, price, action }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G' }) }).catch(() => { });
                // #endregion
                const out = {
                    date,
                    ticker,
                    type,
                    qty,
                    price,
                    currency: r['Currency'] ?? (0, normalize_1.inferCurrency)(r, 'USD'),
                    fees: r['Commission'] ? (0, normalize_1.toNumber)(r['Commission'], locale) : 0,
                    source: 'ibkr_flex',
                    rawHash: (0, normalize_1.hashRow)(r),
                };
                if (!(out.qty > 0) || !(out.price > 0))
                    throw new Error('Non-positive qty/price');
                trades.push(out);
            }
            catch (e) {
                warnings.push(`row ${JSON.stringify(r).slice(0, 120)}… → ${e.message}`);
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ibkrFlex.ts:parse:error', message: 'Row parsing error', data: { error: e.message, row: r, warningsCount: warnings.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G' }) }).catch(() => { });
                // #endregion
            }
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ibkrFlex.ts:parse:exit', message: 'IBKR Flex parse completed', data: { tradesCount: trades.length, warningsCount: warnings.length, rowsCount: rows.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G' }) }).catch(() => { });
        // #endregion
        const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now() - t0), version: '1.0.0' };
        return { broker: 'ibkr_flex', trades, warnings, meta };
    }
};

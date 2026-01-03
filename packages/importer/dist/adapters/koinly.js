"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.koinly = void 0;
const csvFrom_1 = require("../io/csvFrom");
const normalize_1 = require("../normalize");
exports.koinly = {
    id: 'koinly',
    detect: (sample) => {
        // #region agent log
        // Simplified detection: check for key Koinly identifiers
        // Must have "Koinly Date" OR ("Pair" + "Sent Amount" + "Received Amount" together)
        const firstLine = sample.split('\n')[0] || '';
        const hasKoinlyDate = /Koinly Date/i.test(firstLine);
        const hasPair = /Pair/i.test(firstLine);
        const hasSentAmount = /Sent Amount/i.test(firstLine);
        const hasReceivedAmount = /Received Amount/i.test(firstLine);
        const hasKoinly = /Koinly/i.test(sample);
        // Match if: (Koinly Date in first line) OR (Pair + Sent Amount + Received Amount in first line) OR (contains "Koinly" anywhere)
        const testResult = hasKoinlyDate || (hasPair && hasSentAmount && hasReceivedAmount) || hasKoinly;
        console.log('[KOINLY DETECT]', {
            testResult,
            firstLine,
            hasKoinlyDate,
            hasPair,
            hasSentAmount,
            hasReceivedAmount,
            hasKoinly,
            samplePreview: sample.slice(0, 200)
        });
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'koinly.ts:7', message: 'Koinly detect function', data: { testResult, firstLine, hasKoinlyDate, hasPair, hasSentAmount, hasReceivedAmount, hasKoinly, samplePreview: sample.slice(0, 300) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch((e) => { console.error('[KOINLY FETCH ERROR]', e); });
        // #endregion
        return testResult;
    },
    parse: async (file, locale = 'en-US') => {
        const t0 = performance.now();
        const text = await (0, csvFrom_1.csvFrom)(file);
        const rows = (0, csvFrom_1.csvParse)(text);
        const trades = [];
        const warnings = [];
        for (const r of rows) {
            try {
                const label = (r['Label'] || r['label'] || '').toUpperCase();
                if (!label || label.includes('DEPOSIT') || label.includes('WITHDRAWAL') || label.includes('TRANSFER') || (label !== 'TRADE' && !label.includes('TRADE'))) {
                    continue; // Skip non-trade rows
                }
                // Koinly format: Sent Amount / Received Amount determines BUY/SELL
                const sentAmount = (0, normalize_1.toNumber)(r['Sent Amount'] ?? r['sent amount'] ?? '0', locale);
                const receivedAmount = (0, normalize_1.toNumber)(r['Received Amount'] ?? r['received amount'] ?? '0', locale);
                const sentCurrency = r['Sent Currency'] ?? r['sent currency'] ?? '';
                const receivedCurrency = r['Received Currency'] ?? r['received currency'] ?? '';
                // Extract ticker from Pair column (e.g., "BTC-USD" -> "BTC")
                const pair = r['Pair'] ?? r['pair'] ?? '';
                let ticker = '';
                if (pair) {
                    // Extract base currency from pair (e.g., "BTC-USD" -> "BTC")
                    const pairParts = pair.split('-');
                    ticker = pairParts[0] || '';
                }
                // Determine trade direction
                let type = 'BUY';
                let qty = 0;
                let price = 0;
                let currency = '';
                if (sentAmount > 0 && receivedAmount > 0) {
                    // Exchange: sent one asset, received another
                    // Determine which asset to track based on pair
                    if (pair) {
                        const pairParts = pair.split('-');
                        const baseCurrency = pairParts[0] || sentCurrency;
                        const quoteCurrency = pairParts[1] || receivedCurrency;
                        // If we sent the base currency, it's a SELL
                        if (sentCurrency === baseCurrency || !sentCurrency) {
                            type = 'SELL';
                            ticker = ticker || (0, normalize_1.toTicker)(baseCurrency);
                            qty = sentAmount;
                            price = receivedAmount / sentAmount; // Exchange rate
                            currency = quoteCurrency || receivedCurrency || (0, normalize_1.inferCurrency)(r, 'USD');
                        }
                        else {
                            // If we received the base currency, it's a BUY
                            type = 'BUY';
                            ticker = ticker || (0, normalize_1.toTicker)(baseCurrency);
                            qty = receivedAmount;
                            price = sentAmount / receivedAmount; // Exchange rate
                            currency = quoteCurrency || sentCurrency || (0, normalize_1.inferCurrency)(r, 'USD');
                        }
                    }
                    else {
                        // No pair info - treat as SELL of sent currency
                        type = 'SELL';
                        ticker = ticker || (0, normalize_1.toTicker)(sentCurrency || '');
                        qty = sentAmount;
                        price = receivedAmount / sentAmount; // Exchange rate
                        currency = receivedCurrency || (0, normalize_1.inferCurrency)(r, 'USD');
                    }
                }
                else if (sentAmount > 0) {
                    // Sell: sent currency, received fiat or nothing
                    type = 'SELL';
                    ticker = ticker || (0, normalize_1.toTicker)(sentCurrency || (pair ? pair.split('-')[0] : ''));
                    qty = sentAmount;
                    // Calculate price from received amount (if any) or use USD price
                    if (receivedAmount > 0) {
                        price = receivedAmount / sentAmount;
                        currency = receivedCurrency || sentCurrency || (0, normalize_1.inferCurrency)(r, 'USD');
                    }
                    else {
                        price = (0, normalize_1.toNumber)(r['Price'] ?? '0', locale);
                        currency = sentCurrency || (0, normalize_1.inferCurrency)(r, 'USD');
                    }
                }
                else if (receivedAmount > 0) {
                    // Buy: received currency, sent fiat
                    type = 'BUY';
                    ticker = ticker || (0, normalize_1.toTicker)(receivedCurrency || (pair ? pair.split('-')[0] : ''));
                    qty = receivedAmount;
                    // Calculate price from sent amount (if any) or use USD price
                    if (sentAmount > 0) {
                        price = sentAmount / receivedAmount;
                        currency = sentCurrency || receivedCurrency || (0, normalize_1.inferCurrency)(r, 'USD');
                    }
                    else {
                        price = (0, normalize_1.toNumber)(r['Price'] ?? '0', locale);
                        currency = receivedCurrency || (0, normalize_1.inferCurrency)(r, 'USD');
                    }
                }
                else {
                    continue; // Skip rows with no amounts
                }
                // Ensure price is positive and valid
                if (!price || price <= 0) {
                    price = 1; // Fallback to 1 if calculation fails
                }
                const out = {
                    date: (0, normalize_1.toISO)(r['Koinly Date'] ?? r['koinly date'] ?? r['Date'] ?? r['date'] ?? '', locale),
                    ticker: ticker || (0, normalize_1.toTicker)(r['Asset'] ?? r['Symbol'] ?? ''),
                    type,
                    qty,
                    price: price || 1, // Fallback to 1 if price calculation fails
                    currency: currency || (0, normalize_1.inferCurrency)(r, 'USD'),
                    fees: (0, normalize_1.toNumber)(r['Fee Amount'] ?? r['fee amount'] ?? r['Fee'] ?? '0', locale),
                    source: 'koinly',
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
        return { broker: 'koinly', trades, warnings, meta };
    }
};

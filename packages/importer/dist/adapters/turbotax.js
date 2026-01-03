"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turbotax = void 0;
const csvFrom_1 = require("../io/csvFrom");
const normalize_1 = require("../normalize");
exports.turbotax = {
    id: 'turbotax',
    detect: (sample) => /(^|\n)(Currency Name|Purchase Date|Cost Basis|Date Sold|Proceeds|TurboTax|Intuit)/i.test(sample),
    parse: async (file, locale = 'en-US') => {
        const t0 = performance.now();
        const text = await (0, csvFrom_1.csvFrom)(file);
        const rows = (0, csvFrom_1.csvParse)(text);
        const trades = [];
        const warnings = [];
        for (const r of rows) {
            try {
                // TurboTax Universal Gains format: Currency Name, Purchase Date, Cost Basis, Date Sold, Proceeds
                // This represents a SELL transaction - we need to create both BUY and SELL
                const currencyName = r['Currency Name'] ?? r['currency name'] ?? '';
                if (!currencyName)
                    continue; // Skip rows without currency name
                const purchaseDate = r['Purchase Date'] ?? r['purchase date'] ?? '';
                const costBasis = (0, normalize_1.toNumber)(r['Cost Basis'] ?? r['cost basis'] ?? '0', locale);
                const dateSold = r['Date Sold'] ?? r['date sold'] ?? '';
                const proceeds = (0, normalize_1.toNumber)(r['Proceeds'] ?? r['proceeds'] ?? '0', locale);
                if (!purchaseDate || !dateSold || costBasis <= 0 || proceeds <= 0) {
                    continue; // Skip incomplete rows
                }
                // Normalize currency names to ticker symbols (e.g., "Bitcoin" -> "BTC")
                const normalizeCurrencyToTicker = (currency) => {
                    const normalized = currency.trim().toUpperCase();
                    const currencyMap = {
                        'BITCOIN': 'BTC',
                        'ETHEREUM': 'ETH',
                        'SOLANA': 'SOL',
                        'CARDANO': 'ADA',
                        'POLKADOT': 'DOT',
                        'POLYGON': 'MATIC',
                        'AVALANCHE': 'AVAX',
                        'CHAINLINK': 'LINK',
                        'UNISWAP': 'UNI',
                        'COSMOS': 'ATOM',
                        'ALGORAND': 'ALGO',
                        'RIPPLE': 'XRP',
                        'DOGECOIN': 'DOGE',
                        'LITECOIN': 'LTC',
                        'BITCOIN CASH': 'BCH',
                        'ETHEREUM CLASSIC': 'ETC',
                        'STELLAR': 'XLM',
                        'TRON': 'TRX',
                        'EOS': 'EOS',
                    };
                    return currencyMap[normalized] || (0, normalize_1.toTicker)(currencyName);
                };
                const ticker = normalizeCurrencyToTicker(currencyName);
                // Calculate quantity and price from cost basis and proceeds
                // For TurboTax Universal Gains format:
                // - Cost Basis = total amount paid (quantity * buy price)
                // - Proceeds = total amount received (quantity * sell price)
                // We need to estimate quantity - use average price to calculate
                const avgPrice = (costBasis + proceeds) / 2;
                const estimatedQty = avgPrice > 0 ? Math.max(1, Math.round(costBasis / avgPrice)) : 1;
                const buyPricePerUnit = estimatedQty > 0 ? costBasis / estimatedQty : costBasis;
                const sellPricePerUnit = estimatedQty > 0 ? proceeds / estimatedQty : proceeds;
                // Create BUY transaction
                const buyTrade = {
                    date: (0, normalize_1.toISO)(purchaseDate, locale),
                    ticker,
                    type: 'BUY',
                    qty: estimatedQty,
                    price: buyPricePerUnit,
                    currency: (0, normalize_1.inferCurrency)(r, 'USD'),
                    fees: 0,
                    source: 'turbotax',
                    rawHash: (0, normalize_1.hashRow)({ ...r, _type: 'BUY' }),
                };
                trades.push(buyTrade);
                // Create SELL transaction
                const sellTrade = {
                    date: (0, normalize_1.toISO)(dateSold, locale),
                    ticker,
                    type: 'SELL',
                    qty: estimatedQty,
                    price: sellPricePerUnit,
                    currency: (0, normalize_1.inferCurrency)(r, 'USD'),
                    fees: 0,
                    source: 'turbotax',
                    rawHash: (0, normalize_1.hashRow)({ ...r, _type: 'SELL' }),
                };
                trades.push(sellTrade);
            }
            catch (e) {
                warnings.push(`row ${JSON.stringify(r).slice(0, 120)}… → ${e.message}`);
            }
        }
        const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now() - t0), version: '1.0.0' };
        return { broker: 'turbotax', trades, warnings, meta };
    }
};

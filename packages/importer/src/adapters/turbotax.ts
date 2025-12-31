import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const turbotax: BrokerAdapter = {
  id: 'turbotax',
  detect: (sample) => /(^|\n)(Currency Name|Purchase Date|Cost Basis|Date Sold|Proceeds|TurboTax|Intuit)/i.test(sample),
  parse: async (file, locale='en-US') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    for (const r of rows) {
      try {
        // TurboTax Universal Gains format: Currency Name, Purchase Date, Cost Basis, Date Sold, Proceeds
        // This represents a SELL transaction - we need to create both BUY and SELL
        
        const currencyName = r['Currency Name'] ?? r['currency name'] ?? '';
        if (!currencyName) continue; // Skip rows without currency name
        
        const purchaseDate = r['Purchase Date'] ?? r['purchase date'] ?? '';
        const costBasis = toNumber(r['Cost Basis'] ?? r['cost basis'] ?? '0', locale);
        const dateSold = r['Date Sold'] ?? r['date sold'] ?? '';
        const proceeds = toNumber(r['Proceeds'] ?? r['proceeds'] ?? '0', locale);
        
        if (!purchaseDate || !dateSold || costBasis <= 0 || proceeds <= 0) {
          continue; // Skip incomplete rows
        }
        
        // Normalize currency names to ticker symbols (e.g., "Bitcoin" -> "BTC")
        const normalizeCurrencyToTicker = (currency: string): string => {
          const normalized = currency.trim().toUpperCase();
          const currencyMap: Record<string, string> = {
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
          return currencyMap[normalized] || toTicker(currencyName);
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
        const buyTrade: NormalizedTrade = {
          date: toISO(purchaseDate, locale),
          ticker,
          type: 'BUY',
          qty: estimatedQty,
          price: buyPricePerUnit,
          currency: inferCurrency(r, 'USD'),
          fees: 0,
          source: 'turbotax',
          rawHash: hashRow({ ...r, _type: 'BUY' }),
        };
        trades.push(buyTrade);
        
        // Create SELL transaction
        const sellTrade: NormalizedTrade = {
          date: toISO(dateSold, locale),
          ticker,
          type: 'SELL',
          qty: estimatedQty,
          price: sellPricePerUnit,
          currency: inferCurrency(r, 'USD'),
          fees: 0,
          source: 'turbotax',
          rawHash: hashRow({ ...r, _type: 'SELL' }),
        };
        trades.push(sellTrade);
      } catch (e:any) {
        warnings.push(`row ${JSON.stringify(r).slice(0,120)}… → ${e.message}`);
      }
    }

    const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now()-t0), version: '1.0.0' };
    return { broker: 'turbotax', trades, warnings, meta };
  }
};


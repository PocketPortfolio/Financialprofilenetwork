import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const binance: BrokerAdapter = {
  id: 'binance',
  detect: (sample) => {
    // Binance has a unique "Market" column (e.g., "BTC/USDT")
    // Must have "Market" column to distinguish from degiro and other brokers
    const hasMarket = /\bMarket\b/i.test(sample);
    const hasType = /\bType\b/i.test(sample);
    const hasDate = /\bDate\b/i.test(sample);
    const hasAmount = /\bAmount\b/i.test(sample);
    const hasPrice = /\bPrice\b/i.test(sample);
    const hasBinance = /Binance/i.test(sample);
    
    // Binance format: Date,Type,Market,Amount,Price
    // Must have Market column (unique to Binance) and Type column
    // This distinguishes it from degiro which has Date,Price but not Market
    return hasMarket && hasType && (hasDate || hasAmount || hasPrice || hasBinance);
  },
  parse: async (file, locale='en-US') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    for (const r of rows) {
      try {
        const action = (r['Type'] || r['Action'] || '').toUpperCase();
        if (!action || action.includes('DEPOSIT') || action.includes('WITHDRAWAL') || action.includes('TRANSFER')) {
          continue; // Skip non-trade rows
        }
        
        const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
        
        // Extract ticker from Market column (e.g., "BTC/USDT" -> "BTC")
        const marketValue = r['Market'] ?? r['Symbol'] ?? r['Ticker'] ?? '';
        const ticker = toTicker(marketValue);
        
        const out: NormalizedTrade = {
          date: toISO(r['Date'] ?? r['Time'] ?? r['Timestamp'] ?? '', locale),
          ticker,
          type,
          qty: toNumber(r['Amount'] ?? r['Quantity'] ?? r['Qty'] ?? '0', locale),
          price: toNumber(r['Price'] ?? r['Trade Price'] ?? r['Execution Price'] ?? '0', locale),
          currency: r['Currency'] ?? inferCurrency(r, 'USD'),
          fees: r['Fee'] ? toNumber(r['Fee'], locale) : 0,
          source: 'binance',
          rawHash: hashRow(r),
        };
        if (!(out.qty > 0) || !(out.price > 0)) throw new Error('Non-positive qty/price');
        trades.push(out);
      } catch (e:any) {
        warnings.push(`row ${JSON.stringify(r).slice(0,120)}… → ${e.message}`);
      }
    }

    const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now()-t0), version: '1.0.0' };
    return { broker: 'binance', trades, warnings, meta };
  }
};








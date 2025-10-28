import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const binance: BrokerAdapter = {
  id: 'binance',
  detect: (sample) => /(^|\n)(Date|Type|Market|Amount|Price|Binance)/i.test(sample),
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
        const out: NormalizedTrade = {
          date: toISO(r['Date'] ?? r['Time'] ?? r['Timestamp'] ?? '', locale),
          ticker: toTicker(r['Market'] ?? r['Symbol'] ?? r['Ticker'] ?? ''),
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







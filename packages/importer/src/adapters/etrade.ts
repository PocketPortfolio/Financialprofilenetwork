import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const etrade: BrokerAdapter = {
  id: 'etrade',
  detect: (sample) => /E\*TRADE/i.test(sample) && /(Trade Date|Symbol|Action|Quantity|Price)/i.test(sample),
  parse: async (file, locale='en-US') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    for (const r of rows) {
      try {
        const action = (r['Action'] || r['Transaction Type'] || '').toUpperCase();
        if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER')) {
          continue; // Skip non-trade rows
        }
        
        const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
        const out: NormalizedTrade = {
          date: toISO(r['Trade Date'] ?? r['Date'] ?? r['Transaction Date'] ?? '', locale),
          ticker: toTicker(r['Symbol'] ?? r['Ticker'] ?? r['Security'] ?? ''),
          type,
          qty: toNumber(r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0', locale),
          price: toNumber(r['Price'] ?? r['Trade Price'] ?? r['Execution Price'] ?? '0', locale),
          currency: r['Currency'] ?? inferCurrency(r, 'USD'),
          fees: r['Commission'] ? toNumber(r['Commission'], locale) : 0,
          source: 'etrade',
          rawHash: hashRow(r),
        };
        if (!(out.qty > 0) || !(out.price > 0)) throw new Error('Non-positive qty/price');
        trades.push(out);
      } catch (e:any) {
        warnings.push(`row ${JSON.stringify(r).slice(0,120)}… → ${e.message}`);
      }
    }

    const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now()-t0), version: '1.0.0' };
    return { broker: 'etrade', trades, warnings, meta };
  }
};










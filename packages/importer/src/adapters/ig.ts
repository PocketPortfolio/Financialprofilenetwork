import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const ig: BrokerAdapter = {
  id: 'ig',
  detect: (sample) => /\bIG\b/i.test(sample) && /(Date|Instrument|Action|Quantity|Price)/i.test(sample),
  parse: async (file, locale='en-GB') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        const action = (r['Action'] || r['Type'] || '').toUpperCase();
        if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER')) {
          continue; // Skip non-trade rows
        }
        
        const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
        const dateStr = r['Date'] ?? r['Trade Date'] ?? r['Transaction Date'] ?? '';
        const instrument = r['Instrument'] ?? r['Symbol'] ?? r['Ticker'] ?? '';
        const qtyStr = r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0';
        const priceStr = r['Price'] ?? r['Trade Price'] ?? r['Execution Price'] ?? '0';
        
        const date = toISO(dateStr, locale);
        const ticker = toTicker(instrument);
        const qty = toNumber(qtyStr, locale);
        const price = toNumber(priceStr, locale);
        
        const out: NormalizedTrade = {
          date,
          ticker,
          type,
          qty,
          price,
          currency: r['Currency'] ?? inferCurrency(r, 'GBP'),
          fees: r['Commission'] ? toNumber(r['Commission'], locale) : 0,
          source: 'ig',
          rawHash: hashRow(r),
        };
        if (!(out.qty > 0) || !(out.price > 0)) {
          throw new Error('Non-positive qty/price');
        }
        trades.push(out);
      } catch (e:any) {
        warnings.push(`row ${JSON.stringify(r).slice(0,120)}… → ${e.message}`);
      }
    }

    const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now()-t0), version: '1.0.0' };
    return { broker: 'ig', trades, warnings, meta };
  }
};








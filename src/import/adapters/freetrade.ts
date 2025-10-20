import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const freetrade: BrokerAdapter = {
  id: 'freetrade',
  detect: (sample) => /(^|\n)(Date,Time,Type,Symbol,Security,Quantity,Price \(native\),Currency \(native\),FX rate \(to GBP\),Consideration \(GBP\),Fee \(GBP\),Stamp Duty \(GBP\),Total \(GBP\),Notes,Order ID,Account|Freetrade)/i.test(sample),
  parse: async (file, locale='en-GB') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    for (const r of rows) {
      try {
        const type = (r['Type'] || '').toUpperCase();
        if (!type || type.includes('DIVIDEND') || type.includes('INTEREST') || type.includes('CASH TOP UP') || type.includes('CASH WITHDRAWAL') || type.includes('STOCK SPLIT')) {
          continue; // Skip non-trade rows
        }
        
        const tradeType = /SELL/i.test(type) ? 'SELL' : 'BUY';
        const out: NormalizedTrade = {
          date: toISO(r['Date'] ?? '', locale),
          ticker: toTicker(r['Symbol'] ?? ''),
          type: tradeType,
          qty: toNumber(r['Quantity'] ?? '0', locale),
          price: toNumber(r['Price (native)'] ?? '0', locale),
          currency: r['Currency (native)'] ?? inferCurrency(r, 'GBP'),
          fees: r['Fee (GBP)'] ? toNumber(r['Fee (GBP)'], locale) : 0,
          source: 'freetrade',
          rawHash: hashRow(r),
        };
        if (!(out.qty > 0) || !(out.price > 0)) throw new Error('Non-positive qty/price');
        trades.push(out);
      } catch (e:any) {
        warnings.push(`row ${JSON.stringify(r).slice(0,120)}… → ${e.message}`);
      }
    }

    const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now()-t0), version: '1.0.0' };
    return { broker: 'freetrade', trades, warnings, meta };
  }
};

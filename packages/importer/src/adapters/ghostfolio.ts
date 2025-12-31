import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const ghostfolio: BrokerAdapter = {
  id: 'ghostfolio',
  detect: (sample) => /(^|\n)(accountId|symbol|type|quantity|unitPrice|currency|date|Ghostfolio)/i.test(sample),
  parse: async (file, locale='en-US') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    for (const r of rows) {
      try {
        // Ghostfolio uses lowercase column names
        const action = (r['type'] ?? r['Type'] ?? r['Transaction Type'] ?? '').toUpperCase();
        if (!action || action.includes('DIVIDEND') || action.includes('INTEREST')) {
          continue; // Skip non-trade rows (can be added later)
        }
        
        const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
        
        const out: NormalizedTrade = {
          date: toISO(r['date'] ?? r['Date'] ?? r['Transaction Date'] ?? '', locale),
          ticker: toTicker(r['symbol'] ?? r['Symbol'] ?? r['Ticker'] ?? r['Asset'] ?? ''),
          type,
          qty: toNumber(r['quantity'] ?? r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0', locale),
          price: toNumber(r['unitPrice'] ?? r['Unit Price'] ?? r['Price'] ?? r['price'] ?? r['Trade Price'] ?? '0', locale),
          currency: r['currency'] ?? r['Currency'] ?? inferCurrency(r, 'USD'),
          fees: toNumber(r['fee'] ?? r['Fee'] ?? r['Fees'] ?? r['Commission'] ?? '0', locale),
          source: 'ghostfolio',
          rawHash: hashRow(r),
        };
        if (!(out.qty > 0) || !(out.price > 0)) throw new Error('Non-positive qty/price');
        trades.push(out);
      } catch (e:any) {
        warnings.push(`row ${JSON.stringify(r).slice(0,120)}… → ${e.message}`);
      }
    }

    const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now()-t0), version: '1.0.0' };
    return { broker: 'ghostfolio', trades, warnings, meta };
  }
};


import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const sharesight: BrokerAdapter = {
  id: 'sharesight',
  detect: (sample) => /(^|\n)(Trade Date|Instrument Code|Quantity|Price in Dollars|Transaction Type|Sharesight)/i.test(sample),
  parse: async (file, locale='en-US') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    for (const r of rows) {
      try {
        const action = (r['Transaction Type'] ?? r['transaction type'] ?? r['Type'] ?? r['type'] ?? '').toUpperCase();
        if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('SPLIT')) {
          continue; // Skip non-trade rows (can be added later)
        }
        
        const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
        
        const out: NormalizedTrade = {
          date: toISO(r['Trade Date'] ?? r['trade date'] ?? r['Date'] ?? r['date'] ?? '', locale),
          ticker: toTicker(r['Instrument Code'] ?? r['instrument code'] ?? r['Stock'] ?? r['Symbol'] ?? r['Ticker'] ?? ''),
          type,
          qty: toNumber(r['Quantity'] ?? r['quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0', locale),
          price: toNumber(r['Price in Dollars'] ?? r['price in dollars'] ?? r['Price'] ?? r['price'] ?? r['Unit Price'] ?? '0', locale),
          currency: r['Brokerage Currency'] ?? r['brokerage currency'] ?? r['Currency'] ?? inferCurrency(r, 'USD'),
          fees: toNumber(r['Brokerage'] ?? r['brokerage'] ?? r['Commission'] ?? r['Fee'] ?? r['Fees'] ?? '0', locale),
          source: 'sharesight',
          rawHash: hashRow(r),
        };
        if (!(out.qty > 0) || !(out.price > 0)) throw new Error('Non-positive qty/price');
        trades.push(out);
      } catch (e:any) {
        warnings.push(`row ${JSON.stringify(r).slice(0,120)}… → ${e.message}`);
      }
    }

    const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now()-t0), version: '1.0.0' };
    return { broker: 'sharesight', trades, warnings, meta };
  }
};

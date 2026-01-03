import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const revolut: BrokerAdapter = {
  id: 'revolut',
  detect: (sample) => /(^|\n)(Date|Stock|Ticker|Action|Type|Quantity|Price|Price per share|Revolut)/i.test(sample),
  parse: async (file, locale='en-GB') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    for (const r of rows) {
      try {
        // Handle both Action and Type columns, strip suffixes like "BUY - MARKET" -> "BUY"
        let action = (r['Action'] || r['Type'] || '').toUpperCase();
        if (!action) continue;
        
        // Extract base action from suffixes (e.g., "BUY - MARKET" -> "BUY")
        action = action.split(/\s*-\s*/)[0].trim();
        
        // Skip non-trade rows
        if (action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER') || 
            action.includes('CASH TOP-UP') || action.includes('CASH WITHDRAWAL') || action.includes('TOP-UP') || 
            action.includes('WITHDRAWAL') || !action) {
          continue;
        }
        
        // Skip rows without ticker/stock
        const tickerValue = r['Stock'] ?? r['Ticker'] ?? r['Symbol'] ?? '';
        if (!tickerValue || tickerValue.trim() === '') continue;
        
        const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
        
        // Handle both "Price" and "Price per share" columns, strip currency prefix
        let priceValue = r['Price'] ?? r['Price per share'] ?? r['Trade Price'] ?? r['Execution Price'] ?? '0';
        // Strip currency prefix (e.g., "USD 111.97" -> "111.97")
        priceValue = priceValue.replace(/^[A-Z]{3}\s+/i, '').trim();
        
        const out: NormalizedTrade = {
          date: toISO(r['Date'] ?? r['Trade Date'] ?? r['Transaction Date'] ?? '', locale),
          ticker: toTicker(tickerValue),
          type,
          qty: toNumber(r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0', locale),
          price: toNumber(priceValue, locale),
          currency: r['Currency'] ?? inferCurrency(r, 'GBP'),
          fees: r['Commission'] ? toNumber(r['Commission'], locale) : 0,
          source: 'revolut',
          rawHash: hashRow(r),
        };
        if (!(out.qty > 0) || !(out.price > 0)) throw new Error('Non-positive qty/price');
        trades.push(out);
      } catch (e:any) {
        warnings.push(`row ${JSON.stringify(r).slice(0,120)}… → ${e.message}`);
      }
    }

    const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now()-t0), version: '1.0.0' };
    return { broker: 'revolut', trades, warnings, meta };
  }
};







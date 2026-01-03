import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const trading212: BrokerAdapter = {
  id: 'trading212',
  detect: (sample) => {
    // Trading212 has very specific column names
    const hasAction = /\bAction\b/i.test(sample);
    const hasTime = /\bTime\b/i.test(sample);
    const hasISIN = /\bISIN\b/i.test(sample);
    const hasNoOfShares = /\bNo\. of shares\b/i.test(sample);
    const hasPricePerShare = /\bPrice \/ share\b/i.test(sample);
    
    // Must have at least 3 of these specific Trading212 columns
    const matchCount = [hasAction, hasTime, hasISIN, hasNoOfShares, hasPricePerShare].filter(Boolean).length;
    return matchCount >= 3;
  },
  parse: async (file, locale='en-GB') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    for (const r of rows) {
      try {
        let action = (r['Action'] || r['Type'] || '').toUpperCase();
        if (!action) continue;
        
        // Extract base action from suffixes (e.g., "Dividend (Ordinary)" -> skip, "Market buy" -> "BUY")
        if (action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('DEPOSIT') || action.includes('WITHDRAWAL')) {
          continue; // Skip non-trade rows
        }
        
        // Handle "Market buy", "Market sell" -> extract "BUY" or "SELL"
        if (action.includes('MARKET BUY') || action.includes('BUY')) {
          action = 'BUY';
        } else if (action.includes('MARKET SELL') || action.includes('SELL')) {
          action = 'SELL';
        }
        
        const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
        const out: NormalizedTrade = {
          date: toISO(r['Time'] ?? r['Date'] ?? r['Timestamp'] ?? '', locale),
          ticker: toTicker(r['Ticker'] ?? r['Instrument'] ?? r['Asset'] ?? ''),
          type,
          qty: toNumber(r['No. of shares'] ?? r['Quantity'] ?? r['Units'] ?? r['Amount'] ?? '0', locale),
          price: toNumber(r['Price / share'] ?? r['Price'] ?? r['OpenRate'] ?? r['Share Price'] ?? '0', locale),
          currency: r['Currency (Price / share)'] ?? r['Currency'] ?? inferCurrency(r, 'GBP'),
          fees: r['Charge amount (USD)'] ? toNumber(r['Charge amount (USD)'], locale) : 0,
          source: 'trading212',
          rawHash: hashRow(r),
        };
        if (!(out.qty > 0) || !(out.price > 0)) throw new Error('Non-positive qty/price');
        trades.push(out);
      } catch (e:any) {
        warnings.push(`row ${JSON.stringify(r).slice(0,120)}… → ${e.message}`);
      }
    }

    const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now()-t0), version: '1.0.0' };
    return { broker: 'trading212', trades, warnings, meta };
  }
};

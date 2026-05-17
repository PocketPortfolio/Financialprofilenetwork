import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const ibkrFlex: BrokerAdapter = {
  id: 'ibkr_flex',
  detect: (sample) => {
    // IBKR Flex has specific pattern: T.Price and Proceeds
    const hasTPrice = /T\.Price/i.test(sample);
    const hasProceeds = /Proceeds/i.test(sample);
    const hasIBKR = /IBKR/i.test(sample);
    return (hasTPrice && hasProceeds) || hasIBKR;
  },
  parse: async (file, locale = 'en-US') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    for (const r of rows) {
      try {
        // IBKR Flex may not have Action column - infer from quantity sign or proceeds
        let action = (r['Action'] || r['Type'] || '').toUpperCase();
        let qty = toNumber(r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0', locale);
        const proceeds = toNumber(r['Proceeds'] ?? '0', locale);

        // If no Action column, infer from quantity sign (negative = sell) or proceeds sign
        if (!action) {
          if (qty < 0) {
            action = 'SELL';
            qty = Math.abs(qty); // Make positive
          } else if (proceeds < 0) {
            action = 'BUY'; // Negative proceeds = buy (money out)
            qty = Math.abs(qty);
          } else if (proceeds > 0 && qty > 0) {
            action = 'SELL'; // Positive proceeds = sell (money in)
          } else {
            action = 'BUY'; // Default
          }
        }

        if (action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER')) {
          continue; // Skip non-trade rows
        }

        const type = /SELL/i.test(action) ? 'SELL' : 'BUY';

        // Ensure quantity is positive
        if (qty < 0) qty = Math.abs(qty);

        const date = toISO(r['Date'] ?? r['Trade Date'] ?? r['Transaction Date'] ?? '', locale);
        const ticker = toTicker(r['Symbol'] ?? r['Ticker'] ?? r['Security'] ?? '');
        const price = toNumber(r['T.Price'] ?? r['Price'] ?? r['Trade Price'] ?? '0', locale);

        const out: NormalizedTrade = {
          date,
          ticker,
          type,
          qty,
          price,
          currency: r['Currency'] ?? inferCurrency(r, 'USD'),
          fees: r['Commission'] ? toNumber(r['Commission'], locale) : 0,
          source: 'ibkr_flex',
          rawHash: hashRow(r),
        };
        if (!(out.qty > 0) || !(out.price > 0)) throw new Error('Non-positive qty/price');
        trades.push(out);
      } catch (e: any) {
        warnings.push(`row ${JSON.stringify(r).slice(0, 120)}… → ${e.message}`);
      }
    }

    const meta = {
      rows: rows.length,
      invalid: warnings.length,
      durationMs: Math.round(performance.now() - t0),
      version: '1.0.0',
    };
    return { broker: 'ibkr_flex', trades, warnings, meta };
  },
};

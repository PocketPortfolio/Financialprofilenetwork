import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const saxo: BrokerAdapter = {
  id: 'saxo',
  detect: (sample) => /(^|\n)(Trade Date|Instrument|Action|Quantity|Price|Saxo)/i.test(sample),
  parse: async (file, locale='en-GB') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    for (const r of rows) {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'adapters/saxo.ts:parse:row',message:'Processing row',data:{row:r,hasTradeDate:!!r['Trade Date'],hasInstrument:!!r['Instrument'],hasAction:!!r['Action'],hasQuantity:!!r['Quantity'],hasPrice:!!r['Price']},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const action = (r['Action'] || r['Type'] || '').toUpperCase();
        if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER')) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'adapters/saxo.ts:parse:skip',message:'Skipping non-trade row',data:{action},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          continue; // Skip non-trade rows
        }
        
        const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
        const rawDate = r['Trade Date'] ?? r['Date'] ?? r['Transaction Date'] ?? '';
        const rawInstrument = r['Instrument'] ?? r['Symbol'] ?? r['Ticker'] ?? '';
        const rawQuantity = r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0';
        const rawPrice = r['Price'] ?? r['Trade Price'] ?? r['Execution Price'] ?? '0';
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'adapters/saxo.ts:parse:before-normalize',message:'Before normalization',data:{rawDate,rawInstrument,rawQuantity,rawPrice,action,type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        const normalizedDate = toISO(rawDate, locale);
        const normalizedTicker = toTicker(rawInstrument);
        const normalizedQty = toNumber(rawQuantity, locale);
        const normalizedPrice = toNumber(rawPrice, locale);
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'adapters/saxo.ts:parse:after-normalize',message:'After normalization',data:{normalizedDate,normalizedTicker,normalizedQty,normalizedPrice,rawInstrument},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        const out: NormalizedTrade = {
          date: normalizedDate,
          ticker: normalizedTicker,
          type,
          qty: normalizedQty,
          price: normalizedPrice,
          currency: r['Currency'] ?? inferCurrency(r, 'GBP'),
          fees: r['Commission'] ? toNumber(r['Commission'], locale) : 0,
          source: 'saxo',
          rawHash: hashRow(r),
        };
        if (!(out.qty > 0) || !(out.price > 0)) throw new Error('Non-positive qty/price');
        trades.push(out);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'adapters/saxo.ts:parse:success',message:'Trade created successfully',data:{ticker:out.ticker,type:out.type,qty:out.qty,price:out.price,date:out.date},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      } catch (e:any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'adapters/saxo.ts:parse:error',message:'Row parsing error',data:{row:r,error:e.message,stack:e.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        warnings.push(`row ${JSON.stringify(r).slice(0,120)}… → ${e.message}`);
      }
    }

    const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now()-t0), version: '1.0.0' };
    return { broker: 'saxo', trades, warnings, meta };
  }
};








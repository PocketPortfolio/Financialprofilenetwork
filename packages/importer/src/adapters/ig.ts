import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const ig: BrokerAdapter = {
  id: 'ig',
  detect: (sample) => /(^|\n)(Date|Instrument|Action|Quantity|Price|IG)/i.test(sample),
  parse: async (file, locale='en-GB') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ig.ts:parse:entry',message:'IG parse started',data:{rowsCount:rows.length,firstRow:rows[0] ? Object.keys(rows[0]) : [],sampleRow:rows[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ig.ts:parse:row',message:'Processing row',data:{rowIndex:i,rowKeys:Object.keys(r),rowData:r,hasAction:!!r['Action'],hasInstrument:!!r['Instrument'],hasDate:!!r['Date'],hasQuantity:!!r['Quantity'],hasPrice:!!r['Price']},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        
        const action = (r['Action'] || r['Type'] || '').toUpperCase();
        if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('TRANSFER')) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ig.ts:parse:skip',message:'Skipping non-trade row',data:{rowIndex:i,action},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
          // #endregion
          continue; // Skip non-trade rows
        }
        
        const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
        const dateStr = r['Date'] ?? r['Trade Date'] ?? r['Transaction Date'] ?? '';
        const instrument = r['Instrument'] ?? r['Symbol'] ?? r['Ticker'] ?? '';
        const qtyStr = r['Quantity'] ?? r['Qty'] ?? r['Shares'] ?? '0';
        const priceStr = r['Price'] ?? r['Trade Price'] ?? r['Execution Price'] ?? '0';
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ig.ts:parse:before-normalize',message:'Before normalization',data:{rowIndex:i,dateStr,instrument,qtyStr,priceStr,action,type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        
        const date = toISO(dateStr, locale);
        const ticker = toTicker(instrument);
        const qty = toNumber(qtyStr, locale);
        const price = toNumber(priceStr, locale);
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ig.ts:parse:after-normalize',message:'After normalization',data:{rowIndex:i,date,ticker,qty,price,type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        
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
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ig.ts:parse:validation-fail',message:'Validation failed',data:{rowIndex:i,qty:out.qty,price:out.price},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
          // #endregion
          throw new Error('Non-positive qty/price');
        }
        trades.push(out);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ig.ts:parse:trade-added',message:'Trade added',data:{rowIndex:i,tradesCount:trades.length,ticker,type,qty,price},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
      } catch (e:any) {
        warnings.push(`row ${JSON.stringify(r).slice(0,120)}… → ${e.message}`);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ig.ts:parse:error',message:'Row parsing error',data:{rowIndex:i,error:e.message,row:r,warningsCount:warnings.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
      }
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ig.ts:parse:exit',message:'IG parse completed',data:{tradesCount:trades.length,warningsCount:warnings.length,rowsCount:rows.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion

    const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now()-t0), version: '1.0.0' };
    return { broker: 'ig', trades, warnings, meta };
  }
};








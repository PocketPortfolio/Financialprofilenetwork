import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const freetrade: BrokerAdapter = {
  id: 'freetrade',
  detect: (sample) => {
    // Match both formats:
    // 1. Full format: "Date,Time,Type,Symbol,Security,Quantity,Price (native)..." or contains "Freetrade"
    // 2. Simple format: "Date,Stock,Action,Quantity,Price" (unique combination)
    const hasFullFormat = /(^|\n)(Date,Time,Type,Symbol,Security,Quantity,Price \(native\),Currency \(native\),FX rate \(to GBP\),Consideration \(GBP\),Fee \(GBP\),Stamp Duty \(GBP\),Total \(GBP\),Notes,Order ID,Account|Freetrade)/i.test(sample);
    const hasSimpleFormat = /(^|\n)(Date,Stock,Action,Quantity,Price)/i.test(sample);
    return hasFullFormat || hasSimpleFormat;
  },
  parse: async (file, locale='en-GB') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'freetrade.ts:parse:entry',message:'Freetrade parse started',data:{rowsCount:rows.length,firstRow:rows[0] ? Object.keys(rows[0]) : [],sampleRow:rows[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion

    for (const r of rows) {
      try {
        // Handle both formats
        const action = (r['Action'] || r['Type'] || '').toUpperCase();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'freetrade.ts:parse:row',message:'Processing row',data:{action,rowKeys:Object.keys(r),rowData:r,hasAction:!!r['Action'],hasType:!!r['Type'],hasStock:!!r['Stock'],hasSymbol:!!r['Symbol']},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        if (!action || action.includes('DIVIDEND') || action.includes('INTEREST') || action.includes('CASH TOP UP') || action.includes('CASH WITHDRAWAL') || action.includes('STOCK SPLIT')) {
          continue; // Skip non-trade rows
        }
        
        const tradeType = /SELL/i.test(action) ? 'SELL' : 'BUY';
        const ticker = toTicker(r['Stock'] ?? r['Symbol'] ?? '');
        const qty = toNumber(r['Quantity'] ?? '0', locale);
        const price = toNumber(r['Price'] ?? r['Price (native)'] ?? '0', locale);
        const date = toISO(r['Date'] ?? '', locale);
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'freetrade.ts:parse:values',message:'Extracted values',data:{ticker,qty,price,date,tradeType,rawStock:r['Stock'],rawSymbol:r['Symbol'],rawQuantity:r['Quantity'],rawPrice:r['Price'],rawPriceNative:r['Price (native)'],rawDate:r['Date']},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        
        const out: NormalizedTrade = {
          date,
          ticker,
          type: tradeType,
          qty,
          price,
          currency: r['Currency (native)'] ?? inferCurrency(r, 'GBP'),
          fees: r['Fee (GBP)'] ? toNumber(r['Fee (GBP)'], locale) : 0,
          source: 'freetrade',
          rawHash: hashRow(r),
        };
        if (!(out.qty > 0) || !(out.price > 0)) throw new Error('Non-positive qty/price');
        trades.push(out);
      } catch (e:any) {
        warnings.push(`row ${JSON.stringify(r).slice(0,120)}… → ${e.message}`);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'freetrade.ts:parse:error',message:'Row parsing error',data:{error:e.message,row:r,warningsCount:warnings.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ed1ac4f0-a5ec-4c15-80c2-1ba860d1bcf0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'freetrade.ts:parse:exit',message:'Freetrade parse completed',data:{tradesCount:trades.length,warningsCount:warnings.length,rowsCount:rows.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion

    const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now()-t0), version: '1.0.0' };
    return { broker: 'freetrade', trades, warnings, meta };
  }
};








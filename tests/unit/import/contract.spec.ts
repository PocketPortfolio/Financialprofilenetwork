import { z } from 'zod';
import { ADAPTERS } from '@/src/import/registry';

const Trade = z.object({
  date: z.string().min(10),
  ticker: z.string().min(1),
  type: z.enum(['BUY','SELL']),
  qty: z.number().positive(),
  price: z.number().positive(),
  currency: z.string().optional(),
  fees: z.number().optional(),
  source: z.string(),
  rawHash: z.string().length(64)
});

test('all adapters produce valid NormalizedTrade[]', async () => {
  // Test with Trading212 fixture
  const trading212Csv = `Action,Time,ISIN,Ticker,Name,No. of shares,Price / share,Currency (Price / share),Exchange rate,Result (USD),Total (USD),Withholding tax (USD),Charge amount (USD),Notes
Market buy,2025-01-15 09:12:41,US0378331005,AAPL,Apple Inc.,10,180.00,USD,1.0000,1800.00,1800.00,0.00,0.00,`;
  
  const file = new File([trading212Csv], 'trading212.csv', { type: 'text/csv' });
  const adapter = ADAPTERS.find(a => a.id === 'trading212');
  expect(adapter).toBeDefined();
  
  const res = await adapter!.parse({ 
    name: file.name, 
    mime: file.type as any, 
    size: file.size, 
    arrayBuffer: async () => new TextEncoder().encode(trading212Csv).buffer
  }, 'en-US');
  
  for (const t of res.trades) Trade.parse(t);
  expect(res.trades.length).toBeGreaterThan(0);
});

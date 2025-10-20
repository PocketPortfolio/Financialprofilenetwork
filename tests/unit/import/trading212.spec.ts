import { trading212 } from '@/src/import/adapters/trading212';
import { expect, test } from 'vitest';

test('trading212 adapter detects correctly', () => {
  const sample = `Action,Time,ISIN,Ticker,Name,No. of shares,Price / share
Market buy,2025-01-15 09:12:41,US0378331005,AAPL,Apple Inc.,10,180.00`;
  expect(trading212.detect(sample)).toBe(true);
});

test('trading212 adapter parses correctly', async () => {
  const csvContent = `Action,Time,ISIN,Ticker,Name,No. of shares,Price / share,Currency (Price / share),Exchange rate,Result (USD),Total (USD),Withholding tax (USD),Charge amount (USD),Notes
Market buy,2025-01-15 09:12:41,US0378331005,AAPL,Apple Inc.,10,180.00,USD,1.0000,1800.00,1800.00,0.00,0.00,
Market buy,2025-01-15 09:14:22,US5949181045,MSFT,Microsoft Corporation,4,410.00,USD,1.0000,1640.00,1640.00,0.00,0.00,`;

  const file = new File([csvContent], 'trading212.csv', { type: 'text/csv' });
  const result = await trading212.parse(
    { 
      name: file.name, 
      mime: file.type as any, 
      size: file.size, 
      arrayBuffer: async () => new TextEncoder().encode(csvContent).buffer
    }, 
    'en-GB'
  );

  expect(result.broker).toBe('trading212');
  expect(result.trades.length).toBe(2);
  expect(result.trades[0]).toMatchObject({
    ticker: 'AAPL',
    type: 'BUY',
    qty: 10,
    price: 180.00,
    currency: 'USD',
    source: 'trading212'
  });
  expect(result.trades[1]).toMatchObject({
    ticker: 'MSFT',
    type: 'BUY',
    qty: 4,
    price: 410.00,
    currency: 'USD',
    source: 'trading212'
  });
});

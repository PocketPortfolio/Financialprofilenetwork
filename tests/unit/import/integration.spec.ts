import { ADAPTERS, detectBroker } from '@/src/import/registry';
import { csvFrom } from '@/src/import/io/csvFrom';
import { expect, test } from 'vitest';

test('end-to-end import flow works', async () => {
  // Test Trading212 CSV
  const trading212Csv = `Action,Time,ISIN,Ticker,Name,No. of shares,Price / share,Currency (Price / share),Exchange rate,Result (USD),Total (USD),Withholding tax (USD),Charge amount (USD),Notes
Market buy,2025-01-15 09:12:41,US0378331005,AAPL,Apple Inc.,10,180.00,USD,1.0000,1800.00,1800.00,0.00,0.00,
Market sell,2025-01-15 09:14:22,US5949181045,MSFT,Microsoft Corporation,4,410.00,USD,1.0000,1640.00,1640.00,0.00,0.00,`;

  const file = new File([trading212Csv], 'trading212.csv', { type: 'text/csv' });
  
  // Test detection
  const detectedBroker = detectBroker(trading212Csv);
  expect(detectedBroker).toBe('trading212');
  
  // Test parsing
  const adapter = ADAPTERS.find(a => a.id === detectedBroker);
  expect(adapter).toBeDefined();
  
  const result = await adapter!.parse(
    { 
      name: file.name, 
      mime: file.type as any, 
      size: file.size, 
      arrayBuffer: async () => new TextEncoder().encode(trading212Csv).buffer
    }, 
    'en-GB'
  );

  expect(result.broker).toBe('trading212');
  expect(result.trades.length).toBe(2);
  expect(result.trades[0].type).toBe('BUY');
  expect(result.trades[1].type).toBe('SELL');
  expect(result.meta.rows).toBe(2);
  expect(result.meta.invalid).toBe(0);
});

test('csvFrom handles different file types', async () => {
  const csvContent = 'Date,Symbol,Action,Quantity,Price\n2025-01-15,AAPL,BUY,10,180.00';
  
  // Test CSV
  const csvFile = new File([csvContent], 'test.csv', { type: 'text/csv' });
  const csvResult = await csvFrom({ 
    name: csvFile.name, 
    mime: csvFile.type, 
    size: csvFile.size, 
    arrayBuffer: async () => new TextEncoder().encode(csvContent).buffer
  });
  expect(csvResult).toContain('Date,Symbol,Action,Quantity,Price');
  
  // Test unsupported type
  const unsupportedContent = 'test';
  const unsupportedFile = new File([unsupportedContent], 'test.txt', { type: 'text/plain' });
  await expect(csvFrom({ 
    name: unsupportedFile.name, 
    mime: unsupportedFile.type, 
    size: unsupportedFile.size, 
    arrayBuffer: async () => new TextEncoder().encode(unsupportedContent).buffer
  })).rejects.toThrow('Unsupported mime');
});

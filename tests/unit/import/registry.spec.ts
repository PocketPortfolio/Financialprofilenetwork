import { ADAPTERS, detectBroker } from '@/src/import/registry';
import { expect, test } from 'vitest';

test('registry has all expected adapters', () => {
  const expectedBrokers = [
    'schwab', 'vanguard', 'etrade', 'fidelity',
    'trading212', 'freetrade', 'degiro', 'ig', 'saxo', 'interactive_investor', 'revolut',
    'ibkr_flex', 'kraken', 'binance', 'coinbase'
  ];
  
  const actualBrokers = ADAPTERS.map(a => a.id);
  expect(actualBrokers).toEqual(expect.arrayContaining(expectedBrokers));
  expect(ADAPTERS.length).toBe(15);
});

test('detectBroker identifies Trading212', () => {
  const sample = `Action,Time,ISIN,Ticker,Name,No. of shares,Price / share
Market buy,2025-01-15 09:12:41,US0378331005,AAPL,Apple Inc.,10,180.00`;
  expect(detectBroker(sample)).toBe('trading212');
});

test('detectBroker identifies Schwab', () => {
  const sample = `Date,Action,Symbol,Quantity,Price,Currency,Commission
2025-01-15,BUY,AAPL,10,180.00,USD,0.00`;
  expect(detectBroker(sample)).toBe('schwab');
});

test('detectBroker returns unknown for unrecognized format', () => {
  const sample = `Some,Random,Headers,That,Don't,Match,Any,Broker`;
  expect(detectBroker(sample)).toBe('unknown');
});



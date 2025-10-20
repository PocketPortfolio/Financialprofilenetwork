import { describe, it, expect } from 'vitest';
import { freetrade } from '@/src/import/adapters/freetrade';

describe('freetrade adapter', () => {
  it('detects Freetrade CSV format', () => {
    const sample = `Date,Time,Type,Symbol,Security,Quantity,Price (native),Currency (native),FX rate (to GBP),Consideration (GBP),Fee (GBP),Stamp Duty (GBP),Total (GBP),Notes,Order ID,Account
2025-09-01,09:12:03,Cash top up,,Cash GBP,,,GBP,,,0.00,0.00,2000.00,Bank transfer,TUP-20250901-001,GIA`;
    expect(freetrade.detect(sample)).toBe(true);
  });

  it('parses Freetrade CSV correctly', async () => {
    const csvContent = `Date,Time,Type,Symbol,Security,Quantity,Price (native),Currency (native),FX rate (to GBP),Consideration (GBP),Fee (GBP),Stamp Duty (GBP),Total (GBP),Notes,Order ID,Account
2025-09-02,10:05:44,Buy,VUKE.L,Vanguard FTSE 100 ETF,10,31.25,GBP,1.00,312.50,0.00,0.00,-312.50,UK ETF – no stamp duty,ORD-20250902-001,GIA
2025-09-02,10:12:09,Buy,VOD.L,Vodafone Group PLC,500,0.80,GBP,1.00,400.00,0.00,2.00,-402.00,UK stock – stamp duty 0.5%,ORD-20250902-002,GIA
2025-09-03,15:31:27,Buy,AAPL,Apple Inc.,5,180.00,USD,0.79,711.00,7.04,0.00,-718.04,FX fee 0.99% included in Fee,ORD-20250903-003,GIA
2025-09-15,14:11:52,Sell,VOD.L,Vodafone Group PLC,200,0.95,GBP,1.00,190.00,0.00,0.00,190.00,No PTM levy under £10k,ORD-20250915-004,GIA
2025-09-20,15:49:08,Buy,TSLA,Tesla Inc.,1,250.00,USD,0.78,195.00,1.93,0.00,-196.93,FX fee 0.99% included in Fee,ORD-20250920-005,GIA`;

    const file = new File([csvContent], 'freetrade.csv', { type: 'text/csv' });
    const result = await freetrade.parse(
      { 
        name: file.name, 
        mime: file.type as any, 
        size: file.size, 
        arrayBuffer: async () => new TextEncoder().encode(csvContent).buffer
      }, 
      'en-GB'
    );

    expect(result.broker).toBe('freetrade');
    expect(result.trades.length).toBe(5);
    
    // Test VUKE.L buy
    expect(result.trades[0]).toMatchObject({
      ticker: 'VUKE.L',
      type: 'BUY',
      qty: 10,
      price: 31.25,
      currency: 'GBP',
      fees: 0,
      source: 'freetrade',
    });
    
    // Test VOD.L buy
    expect(result.trades[1]).toMatchObject({
      ticker: 'VOD.L',
      type: 'BUY',
      qty: 500,
      price: 0.80,
      currency: 'GBP',
      fees: 0, // Stamp duty not included in fees
      source: 'freetrade',
    });
    
    // Test AAPL buy (USD)
    expect(result.trades[2]).toMatchObject({
      ticker: 'AAPL',
      type: 'BUY',
      qty: 5,
      price: 180.00,
      currency: 'USD',
      fees: 7.04,
      source: 'freetrade',
    });
    
    // Test VOD.L sell
    expect(result.trades[3]).toMatchObject({
      ticker: 'VOD.L',
      type: 'SELL',
      qty: 200,
      price: 0.95,
      currency: 'GBP',
      fees: 0,
      source: 'freetrade',
    });
    
    // Test TSLA buy (USD)
    expect(result.trades[4]).toMatchObject({
      ticker: 'TSLA',
      type: 'BUY',
      qty: 1,
      price: 250.00,
      currency: 'USD',
      fees: 1.93,
      source: 'freetrade',
    });
  });
});



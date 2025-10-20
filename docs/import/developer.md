# Import Adapters: Developer Guide

## Adding a New Broker Adapter

Follow these steps to add support for a new broker in under 15 minutes:

### 1. Create Adapter File
Create `src/import/adapters/{broker}.ts`:

```typescript
import type { BrokerAdapter, NormalizedTrade } from './types';
import { csvFrom, csvParse } from '../io/csvFrom';
import { toISO, toNumber, toTicker, inferCurrency, hashRow } from '../normalize';

export const {broker}: BrokerAdapter = {
  id: '{broker}',
  detect: (sample) => /(^|\n)(distinctive headers)/i.test(sample),
  parse: async (file, locale='en-US') => {
    const t0 = performance.now();
    const text = await csvFrom(file);
    const rows = csvParse(text);
    const trades: NormalizedTrade[] = [];
    const warnings: string[] = [];

    for (const r of rows) {
      try {
        const action = (r['Action'] || r['Type'] || '').toUpperCase();
        if (!action || action.includes('DEPOSIT') || action.includes('WITHDRAWAL')) {
          continue; // Skip non-trade rows
        }
        
        const type = /SELL/i.test(action) ? 'SELL' : 'BUY';
        const out: NormalizedTrade = {
          date: toISO(r['Date'] ?? r['Trade Date'] ?? '', locale),
          ticker: toTicker(r['Symbol'] ?? r['Ticker'] ?? ''),
          type,
          qty: toNumber(r['Quantity'] ?? r['Qty'] ?? '0', locale),
          price: toNumber(r['Price'] ?? r['Trade Price'] ?? '0', locale),
          currency: r['Currency'] ?? inferCurrency(r, 'USD'),
          fees: r['Commission'] ? toNumber(r['Commission'], locale) : 0,
          source: '{broker}',
          rawHash: hashRow(r),
        };
        if (!(out.qty > 0) || !(out.price > 0)) throw new Error('Non-positive qty/price');
        trades.push(out);
      } catch (e:any) {
        warnings.push(`row ${JSON.stringify(r).slice(0,120)}… → ${e.message}`);
      }
    }

    const meta = { rows: rows.length, invalid: warnings.length, durationMs: Math.round(performance.now()-t0), version: '1.0.0' };
    return { broker: '{broker}', trades, warnings, meta };
  }
};
```

### 2. Register Adapter
Add to `src/import/registry.ts`:
```typescript
import { {broker} } from './adapters/{broker}';
// Add to ADAPTERS array
```

### 3. Add Test Fixture
Create `tests/fixtures/csv/{broker}.csv` with sample data.

### 4. Add Unit Test
Create `tests/unit/import/{broker}.spec.ts`:
```typescript
import { {broker} } from '@/src/import/adapters/{broker}';
import { expect, test } from 'vitest';

test('{broker} adapter', async () => {
  const file = new File([await Bun.file('tests/fixtures/csv/{broker}.csv').arrayBuffer()], '{broker}.csv', { type: 'text/csv' });
  const result = await {broker}.parse({ name: file.name, mime: file.type as any, size: file.size, arrayBuffer: () => file.arrayBuffer() }, 'en-US');
  expect(result.broker).toBe('{broker}');
  expect(result.trades.length).toBeGreaterThan(0);
});
```

### 5. Run Tests
```bash
npm run test:unit
npm run test:e2e
```

## Key Points

- **Detection**: Use distinctive headers that uniquely identify the broker
- **Parsing**: Handle various column names with fallbacks
- **Validation**: Ensure qty > 0 and price > 0
- **Error Handling**: Collect warnings for invalid rows
- **Performance**: Track parsing duration
- **Deduplication**: Use `hashRow()` for raw data hashing



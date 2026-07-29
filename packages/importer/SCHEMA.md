# OpenBrokerCSV Schema (Package SSOT)

Standardized interchange format for portfolio transaction data. All broker CSVs are normalized toward this schema. This file is the **package-level SSOT** for `@pocket-portfolio/importer`; the repo-root `SCHEMA.md` points here.

## OpenBrokerCSV interchange

Used by Smart Mapping / universal import (`StandardField` in `src/universal/types.ts`) and by external docs that describe a portable ledger row.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "format": "date",
      "description": "ISO 8601 date (YYYY-MM-DD)"
    },
    "ticker": {
      "type": "string",
      "description": "Stock symbol (e.g., 'AAPL', 'BTC-USD')"
    },
    "action": {
      "type": "string",
      "enum": ["BUY", "SELL"],
      "description": "Transaction type"
    },
    "quantity": {
      "type": "number",
      "minimum": 0,
      "description": "Number of shares/units"
    },
    "price": {
      "type": "number",
      "minimum": 0,
      "description": "Price per share/unit"
    },
    "currency": {
      "type": "string",
      "pattern": "^[A-Z]{3}$",
      "description": "ISO 4217 currency code (e.g., 'USD', 'GBP', 'EUR')"
    },
    "fees": {
      "type": "number",
      "description": "Optional fees for the row"
    }
  },
  "required": ["date", "ticker", "action", "quantity", "price"]
}
```

### Example (interchange)

```json
[
  {
    "date": "2024-01-15",
    "ticker": "AAPL",
    "action": "BUY",
    "quantity": 10,
    "price": 150.0,
    "currency": "USD"
  }
]
```

## Runtime model: `NormalizedTrade`

Dedicated broker adapters and `genericParse` emit [`NormalizedTrade`](src/adapters/types.ts) — the in-app runtime shape. Field names differ from OpenBrokerCSV interchange for historical reasons; **do not rename without a major version bump**.

```typescript
interface NormalizedTrade {
  date: string;                // ISO 8601
  ticker: string;
  type: 'BUY' | 'SELL';        // ↔ interchange `action`
  qty: number;                 // ↔ interchange `quantity`
  price: number;
  currency?: string;
  fees?: number;
  venue?: string;
  notes?: string;
  source: BrokerId;
  rawHash: string;             // sha256 of normalized row for dedupe
}
```

## Conversion table

| OpenBrokerCSV / Smart Mapping | `NormalizedTrade` | Notes |
|------------------------------|-------------------|--------|
| `date` | `date` | Same |
| `ticker` | `ticker` | Same |
| `action` | `type` | `BUY` \| `SELL` |
| `quantity` | `qty` | Same numeric meaning |
| `price` | `price` | Same |
| `currency` | `currency` | Optional |
| `fees` | `fees` | Optional |
| — | `source` | Adapter / `generic` id |
| — | `rawHash` | Dedupe key |
| — | `venue` / `notes` | Optional runtime only |

**Smart Mapping** uses interchange names (`action`, `quantity`) when proposing column maps. Adapters and the generic parser emit runtime names (`type`, `qty`).

## Implementation

- Types: `src/adapters/types.ts` (`NormalizedTrade`), `src/universal/types.ts` (`StandardField`)
- Registry: `src/registry.ts` (19 dedicated adapters)
- Universal path: `src/universal/` (`parseUniversal`, `inferMapping`, `genericParse`)
- npm: [@pocket-portfolio/importer](https://www.npmjs.com/package/@pocket-portfolio/importer)

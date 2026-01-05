# OpenBrokerCSV Schema

Standardized format for portfolio transaction data. All broker CSVs are normalized to this schema.

## Schema Definition

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
    }
  },
  "required": ["date", "ticker", "action", "quantity", "price"]
}
```

## Example

```json
[
  {
    "date": "2024-01-15",
    "ticker": "AAPL",
    "action": "BUY",
    "quantity": 10,
    "price": 150.00,
    "currency": "USD"
  },
  {
    "date": "2024-01-20",
    "ticker": "BTC-USD",
    "action": "SELL",
    "quantity": 0.5,
    "price": 42000.00,
    "currency": "USD"
  }
]
```

## Implementation

This schema is implemented in `@pocket-portfolio/importer` npm package. All broker-specific CSVs are parsed and normalized to this format.

See: [npmjs.com/package/@pocket-portfolio/importer](https://www.npmjs.com/package/@pocket-portfolio/importer)









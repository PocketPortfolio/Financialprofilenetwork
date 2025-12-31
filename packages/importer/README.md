<div align="center">

# Pocket Portfolio
### The Local-First Investment Tracker

[![Founder's Club](https://img.shields.io/badge/UK%20FOUNDER'S%20CLUB-12%2F50%20Left-red?style=for-the-badge&logo=github&labelColor=black)](https://www.pocketportfolio.app/sponsor?ref=readme_badge)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![NPM Downloads](https://img.shields.io/npm/dw/@pocket-portfolio/importer?style=for-the-badge&color=orange)](https://www.npmjs.com/package/@pocket-portfolio/importer)

<p align="center">
  <b>🚨 LAUNCH SPECIAL:</b> <a href="https://www.pocketportfolio.app/sponsor?ref=readme_text">Join the UK Founder's Club</a> before Batch 1 sells out.
</p>

</div>

---

# How to Parse Robinhood CSVs (and 14+ Other Brokers) in JavaScript

> **⚠️ Disclaimer:** Pocket Portfolio is a developer utility for data normalization. It is not a brokerage, financial advisor, or trading platform. Data stays local to your device.

A universal, privacy-first CSV parser for 19+ brokers and exchanges. Parse any broker's transaction history into a normalized format with zero server dependencies.

## Features

- **19+ Broker Support**: Robinhood, Fidelity, Schwab, eToro, Trading212, Koinly, TurboTax, Ghostfolio, Sharesight, and more
- **Auto-Detection**: Automatically identifies the broker from CSV headers
- **Privacy-First**: All parsing happens client-side - your data never leaves your device
- **TypeScript**: Full TypeScript support with comprehensive types
- **Locale-Aware**: Handles different date/number formats (US, UK, EU)
- **Excel Support**: Parses both CSV and Excel files (.xlsx, .xls)

## Quick Start

```bash
npm install @pocket-portfolio/importer
```

```typescript
import { parseCSV, detectBrokerFromSample } from '@pocket-portfolio/importer';

// Auto-detect broker
const file = // ... File object from input
const result = await parseCSV(file, 'en-US');

console.log(`Detected broker: ${result.broker}`);
console.log(`Parsed ${result.trades.length} trades`);
console.log(`Warnings: ${result.warnings.length}`);

// Or manually specify broker
const result = await parseCSV(file, 'en-US', 'robinhood');
```

## Supported Brokers

### US Brokers
- **Charles Schwab** - Date, Action, Symbol, Quantity, Price
- **Vanguard** - Transaction Date, Symbol, Action, Quantity, Price
- **E*TRADE** - Trade Date, Symbol, Action, Quantity, Price
- **Fidelity** - Run Date, Symbol, Action, Quantity, Price

### UK/EU Brokers
- **Trading212** - Action, Time, Ticker, No. of shares, Price / share
- **Freetrade** - Date, Stock, Action, Quantity, Price
- **DEGIRO** - Date, Product, Action, Quantity, Price
- **IG** - Date, Instrument, Action, Quantity, Price
- **Saxo** - Trade Date, Instrument, Action, Quantity, Price
- **Interactive Investor** - Date, Stock, Action, Quantity, Price
- **Revolut** - Date, Stock, Action, Quantity, Price

### Global/Pro Brokers
- **Interactive Brokers (IBKR Flex)** - Date, Symbol, Quantity, T.Price, Proceeds

### Crypto Exchanges
- **Kraken** - Date, Type, Asset, Amount, Price
- **Binance** - Date, Type, Market, Amount, Price
- **Coinbase** - Timestamp, Transaction Type, Asset, Quantity Transacted, Spot Price

### Portfolio Trackers & Tax Software
- **Koinly** - Koinly Date, Pair, Sent Amount, Received Amount, Fee Amount
- **TurboTax** - Currency Name, Purchase Date, Cost Basis, Date Sold, Proceeds
- **Ghostfolio** - date, symbol, type, quantity, unitPrice, currency
- **Sharesight** - Trade Date, Instrument Code, Quantity, Price in Dollars, Transaction Type

## Broker Comparison

| Broker | Auto-Detect | Locale Support | Excel Support | Notes |
|--------|------------|----------------|---------------|-------|
| Robinhood | ✅ | en-US | ✅ | Most popular US broker |
| Fidelity | ✅ | en-US | ✅ | Large US broker |
| Schwab | ✅ | en-US | ✅ | US broker |
| Vanguard | ✅ | en-US | ✅ | US broker |
| E*TRADE | ✅ | en-US | ✅ | US broker |
| Trading212 | ✅ | en-GB | ✅ | UK broker, specific column names |
| Freetrade | ✅ | en-GB | ✅ | UK broker |
| DEGIRO | ✅ | en-GB, de-DE | ✅ | European broker |
| IG | ✅ | en-GB | ✅ | UK broker |
| Saxo | ✅ | en-GB | ✅ | Global broker |
| Interactive Investor | ✅ | en-GB | ✅ | UK broker |
| Revolut | ✅ | en-GB | ✅ | UK/European broker |
| IBKR Flex | ✅ | en-US | ✅ | Professional broker |
| Kraken | ✅ | en-US | ✅ | Crypto exchange |
| Binance | ✅ | en-US | ✅ | Crypto exchange |
| Coinbase | ✅ | en-US | ✅ | Crypto exchange |
| Koinly | ✅ | en-US | ✅ | Crypto tax software |
| TurboTax | ✅ | en-US | ✅ | Tax preparation software |
| Ghostfolio | ✅ | en-US | ✅ | Open-source portfolio tracker |
| Sharesight | ✅ | en-US | ✅ | Portfolio tracking & tax reporting |

## Examples

### Example 1: Parse Robinhood CSV

```typescript
import { parseCSV } from '@pocket-portfolio/importer';

const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const result = await parseCSV(file, 'en-US');

result.trades.forEach(trade => {
  console.log(`${trade.date}: ${trade.type} ${trade.qty} ${trade.ticker} @ $${trade.price}`);
});
```

### Example 2: Detect Broker First

```typescript
import { detectBrokerFromSample, parseCSV } from '@pocket-portfolio/importer';

// Read first 2KB to detect broker
const file = // ... File object
const sample = await file.slice(0, 2048).arrayBuffer()
  .then(buf => new TextDecoder().decode(buf));

const broker = detectBrokerFromSample(sample);
console.log(`Detected broker: ${broker}`);

// Now parse with detected broker
const result = await parseCSV(file, 'en-US', broker);
```

### Example 3: Handle Warnings

```typescript
const result = await parseCSV(file, 'en-US');

if (result.warnings.length > 0) {
  console.warn(`Found ${result.warnings.length} warnings:`);
  result.warnings.forEach(warning => {
    console.warn(`- ${warning}`);
  });
}

// Filter out invalid trades if needed
const validTrades = result.trades.filter(trade => 
  trade.qty > 0 && trade.price > 0
);
```

### Example 4: UK Locale (Trading212)

```typescript
// Trading212 uses UK date format (dd/mm/yyyy)
const result = await parseCSV(file, 'en-GB');

// Dates will be parsed correctly
result.trades.forEach(trade => {
  console.log(trade.date); // ISO 8601 format
});
```

## API Reference

### `parseCSV(file, locale?, brokerId?)`

Parse a CSV or Excel file and return normalized trades.

**Parameters:**
- `file: RawFile` - File object with `name`, `mime`, `size`, and `arrayBuffer()` method
- `locale?: string` - Locale for date/number parsing (default: 'en-US')
- `brokerId?: BrokerId` - Optional broker ID to skip auto-detection

**Returns:** `Promise<ParseResult>`

**Example:**
```typescript
const result = await parseCSV(file, 'en-US');
// {
//   broker: 'robinhood',
//   trades: [...],
//   warnings: [...],
//   meta: { rows: 100, invalid: 2, durationMs: 45, version: '1.0.0' }
// }
```

### `detectBrokerFromSample(sampleCsvHead)`

Detect the broker from a CSV header sample.

**Parameters:**
- `sampleCsvHead: string` - First few lines of the CSV (header + 1-2 data rows)

**Returns:** `BrokerId | 'unknown'`

**Example:**
```typescript
const sample = "Date,Action,Symbol,Quantity,Price\n2024-01-01,BUY,AAPL,10,150.00";
const broker = detectBrokerFromSample(sample);
// 'robinhood'
```

## Normalized Trade Format

All brokers are parsed into a unified format:

```typescript
interface NormalizedTrade {
  date: string;           // ISO 8601 date
  ticker: string;         // e.g., "AAPL" or "BTC-USD"
  type: 'BUY' | 'SELL';
  qty: number;
  price: number;
  currency?: string;      // e.g., "USD", "GBP", "EUR"
  fees?: number;
  venue?: string;
  notes?: string;
  source: BrokerId;       // Original broker
  rawHash: string;        // SHA256 hash for deduplication
}
```

## Performance

- **Small files (< 1MB)**: < 50ms
- **Medium files (1-10MB)**: 50-200ms
- **Large files (10-50MB)**: 200-1000ms

All parsing happens synchronously in the browser - no server round-trips.

## Locale Support

The parser supports different date and number formats:

- **en-US**: MM/DD/YYYY dates, decimal point (1,234.56)
- **en-GB**: DD/MM/YYYY dates, decimal point (1,234.56)
- **de-DE**: DD.MM.YYYY dates, decimal comma (1.234,56)
- **fr-FR**: DD/MM/YYYY dates, decimal comma (1 234,56)

## Error Handling

The parser is designed to be resilient:

- **Invalid rows**: Skipped and added to `warnings` array
- **Missing columns**: Attempts to infer from alternative column names
- **Date parsing errors**: Throws error with helpful message
- **Number parsing errors**: Throws error with helpful message

Always check `result.warnings` for parsing issues.

## Try It Live

See this library in action at [pocketportfolio.app](https://www.pocketportfolio.app) - a free, open-source portfolio tracker.

Upload your broker CSV and see your portfolio visualized instantly. No signup required.

## Support the Project

This package is **100% free and open-source**. Help us keep the servers running:

**[Support the work → pocketportfolio.app/sponsor](https://www.pocketportfolio.app/sponsor)**

Every contribution helps us maintain and improve this tool for the community.

## Contributing

Found a broker that's not supported? Want to improve detection accuracy?

1. Fork the repository
2. Create a new adapter in `src/adapters/`
3. Add it to the registry
4. Submit a pull request

See [CONTRIBUTING.md](https://github.com/PocketPortfolio/Financialprofilenetwork/blob/main/CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](https://github.com/PocketPortfolio/Financialprofilenetwork/blob/main/LICENSE) for details.

## Star Us on GitHub

If this library helps you, please star us on GitHub: [github.com/PocketPortfolio/Financialprofilenetwork](https://github.com/PocketPortfolio/Financialprofilenetwork)

## Related Projects

- [Pocket Portfolio](https://www.pocketportfolio.app) - Free, open-source portfolio tracker
- [OpenBrokerCSV](https://www.pocketportfolio.app/openbrokercsv) - Standardized CSV format for portfolio data

---

**Built with privacy in mind. Your data never leaves your device.**



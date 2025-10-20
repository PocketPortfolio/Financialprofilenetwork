# Pocket Portfolio Import System

A comprehensive, broker-agnostic CSV import system for Pocket Portfolio that supports 15+ brokers and exchanges.

## Features

- **15 Broker Adapters**: US, UK/EU, and crypto exchanges
- **Auto-Detection**: 95%+ accuracy broker identification
- **Locale Support**: i18n-aware parsing for multiple regions
- **Feature Flag**: Gradual rollout with `NEXT_PUBLIC_IMPORT_ADAPTERS_V1`
- **Privacy-First**: Client-side parsing by default
- **Comprehensive Testing**: Unit, E2E, and contract tests

## Supported Brokers

### US Brokers
- Charles Schwab
- Vanguard  
- E*TRADE
- Fidelity

### UK/EU Brokers
- Trading212
- Freetrade
- DEGIRO
- IG
- Saxo
- Interactive Investor
- Revolut

### Global/Pro Brokers
- Interactive Brokers (IBKR Flex)

### Crypto Exchanges
- Kraken
- Binance
- Coinbase

## Quick Start

1. **Enable Feature Flag**:
   ```bash
   echo "NEXT_PUBLIC_IMPORT_ADAPTERS_V1=true" >> .env.local
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Tests**:
   ```bash
   npm run test:unit
   npm run test:e2e
   ```

4. **Start Development**:
   ```bash
   npm run dev
   ```

## Usage

The import system is automatically available when the feature flag is enabled. Users can:

1. **Upload CSV/Excel files** (max 10MB)
2. **Auto-detect broker** or manually select
3. **Preview parsed trades** with warnings
4. **Confirm import** to add trades to portfolio

## Architecture

```
src/import/
├── adapters/          # Broker-specific parsers
├── io/               # CSV/XLSX file handling
├── normalize.ts      # Data normalization utilities
└── registry.ts       # Adapter registry & detection

app/components/import/
├── Importer.tsx      # Main import wizard
├── DetectBadge.tsx  # Broker detection UI
└── WarningList.tsx  # Validation warnings

app/api/import/
└── parse/route.ts   # Server-side parsing (optional)
```

## Testing

- **Unit Tests**: `npm run test:unit`
- **E2E Tests**: `npm run test:e2e`  
- **Contract Tests**: Validates `NormalizedTrade` schema
- **Fixtures**: Sample CSV files for each broker

## Adding New Brokers

See [Developer Guide](developer.md) for step-by-step instructions.

## Known Limitations

- Maximum file size: 10MB
- CSV and Excel formats only
- Requires JavaScript enabled
- Some brokers may have unique column formats

## Security & Privacy

- Client-side parsing by default
- No PII in telemetry
- File size validation
- MIME type checking
- Input sanitization



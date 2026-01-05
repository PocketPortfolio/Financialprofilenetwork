# Changelog

All notable changes to `@pocket-portfolio/importer` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2025-01-XX

### Fixed
- **Revolut** adapter - Fixed ISO timestamp date parsing, currency prefix stripping (e.g., "USD 111.97" → 111.97), and action suffix handling (e.g., "BUY - MARKET" → "BUY")
- **IBKR Flex** adapter - Fixed action inference from quantity sign (negative quantity implies SELL)
- **Binance** adapter - Improved ticker extraction from Market pairs (e.g., "BTC/USDT" → "BTC")
- **Coinbase** adapter - Enhanced detection specificity to prevent false matches with Degiro
- **Freetrade** adapter - Fixed column variation handling (`Stock`/`Symbol`, `Action`/`Type`, `Price`/`Price (native)`)
- **Ghostfolio** adapter - Fixed lowercase column name handling and dividend row filtering
- **IG** adapter - Fixed ticker extraction from Instrument column (e.g., "Apple Inc (AAPL)" → "AAPL")
- **Kraken** adapter - Improved date parsing for ISO timestamps
- **Saxo** adapter - Fixed ticker normalization for exchange suffixes (e.g., "AAPL:US" → "AAPL")
- **Sharesight** adapter - Added direct parser fallback for edge cases
- **TurboTax** adapter - Added currency name normalization (e.g., "BITCOIN" → "BTC")
- **Koinly** adapter - Improved price calculation for exchange transactions

### Changed
- Removed debug instrumentation from registry and index files
- Improved adapter detection order to prevent false matches (Binance/Coinbase before Degiro)

## [1.0.5] - 2025-01-XX

### Fixed
- Initial bug fixes and improvements for adapter robustness

## [1.0.4] - 2025-01-XX

### Added
- **Koinly** adapter - Support for Koinly crypto tax software CSV exports
  - Handles `Koinly Date`, `Pair`, `Sent Amount`, `Received Amount`, `Fee Amount` columns
  - Extracts ticker from trading pair (e.g., "BTC-USD" → "BTC")
  - Supports BUY/SELL detection from sent/received amounts
  
- **TurboTax** adapter - Support for TurboTax Universal Gains CSV exports
  - Handles `Currency Name`, `Purchase Date`, `Cost Basis`, `Date Sold`, `Proceeds` columns
  - Converts capital gains format to BUY/SELL transaction pairs
  - Creates both purchase and sale transactions from single row
  
- **Ghostfolio** adapter - Support for Ghostfolio portfolio tracker CSV exports
  - Handles lowercase column names: `date`, `symbol`, `type`, `quantity`, `unitPrice`, `currency`
  - Supports fractional shares and crypto transactions
  - Skips dividend and interest rows
  
- **Sharesight** adapter - Support for Sharesight portfolio tracking CSV exports
  - Handles `Trade Date`, `Instrument Code`, `Quantity`, `Price in Dollars`, `Transaction Type` columns
  - Supports stock and crypto transactions
  - Includes brokerage fees in parsing

### Changed
- Updated broker count from 15+ to 19+ brokers
- Enhanced CSV validation to recognize competitor formats
- Improved column detection for portfolio tracker formats

### Fixed
- Fixed validation errors for Koinly, TurboTax, Ghostfolio, and Sharesight CSV formats
- Improved ticker extraction from trading pairs and instrument codes
- Enhanced price calculation for exchange-based transactions

## [1.0.3] - Previous Release

### Added
- Initial release with 15 broker adapters
- Auto-detection system
- Locale-aware parsing
- Excel file support

# Supported Brokers (Phase 1)

## US Brokers
- **Charles Schwab**: Date, Action, Symbol, Quantity, Price
- **Vanguard**: Transaction Date, Symbol, Action, Quantity, Price
- **E*TRADE**: Trade Date, Symbol, Action, Quantity, Price
- **Fidelity**: Run Date, Symbol, Action, Quantity, Price

## UK/EU Brokers
- **Trading212**: Action, Time, Ticker, No. of shares, Price / share
- **Freetrade**: Date, Stock, Action, Quantity, Price
- **DEGIRO**: Date, Product, Action, Quantity, Price
- **IG**: Date, Instrument, Action, Quantity, Price
- **Saxo**: Trade Date, Instrument, Action, Quantity, Price
- **Interactive Investor**: Date, Stock, Action, Quantity, Price
- **Revolut**: Date, Stock, Action, Quantity, Price

## Global/Pro Brokers
- **Interactive Brokers (IBKR Flex)**: Date, Symbol, Quantity, T.Price, Proceeds

## Crypto Exchanges
- **Kraken**: Date, Type, Asset, Amount, Price
- **Binance**: Date, Type, Market, Amount, Price
- **Coinbase**: Timestamp, Transaction Type, Asset, Quantity Transacted, Spot Price at Transaction

## Known Quirks

### IBKR Flex
- Requires merge of trades + cash transactions
- Supports both CSV and XML formats
- XML format maps "TradeConfirmations" + "CashTransactions"

### Decimal Comma Locales
- Use locale selector if numbers are misparsed
- Supports en-US, en-GB, de-DE, fr-FR locales
- Automatic detection of thousands separators

### Currency Inference
- Some exports omit currency column
- We infer sensible defaults: USD (US), GBP (UK), EUR (EU)
- Manual override available in UI

### Column Variations
- Brokers use different column names for same data
- Adapters handle multiple synonyms per field
- Fallback to generic terms if specific not found

## File Size Limits
- Maximum 10MB per file
- Client-side parsing by default
- Server route available for large files
- Supports CSV and Excel formats



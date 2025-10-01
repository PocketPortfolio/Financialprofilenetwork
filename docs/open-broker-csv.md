# OpenBrokerCSV v0.1

## Columns (lower_snake_case)
broker, trade_id, timestamp (ISO8601), symbol, side [BUY|SELL|DIV|SPLIT],
quantity (number), price (number), fee (number, optional),
trade_currency (ISO4217), settlement_currency (ISO4217, optional),
fx_rate (number, optional)

## Rules
- Unknown columns preserved (prefixed `extra_` when normalized).
- Missing required → validation error (exported to error CSV).
- UTF-8; headers in row 1.

See `fixtures/csv/*.csv`.

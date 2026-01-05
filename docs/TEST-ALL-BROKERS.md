# Comprehensive Broker CSV Import Test Plan

## Supported Brokers (19 total)

### US Brokers (4)
1. **schwab** - Charles Schwab
2. **vanguard** - Vanguard
3. **etrade** - E*TRADE
4. **fidelity** - Fidelity

### UK/EU Brokers (7)
5. **trading212** - Trading212
6. **freetrade** - Freetrade
7. **degiro** - DEGIRO
8. **ig** - IG
9. **saxo** - Saxo
10. **interactive_investor** - Interactive Investor
11. **revolut** - Revolut

### Crypto Exchanges (3)
12. **kraken** - Kraken
13. **binance** - Binance
14. **coinbase** - Coinbase

### Interactive Brokers (1)
15. **ibkr_flex** - Interactive Brokers Flex Query

### Portfolio Trackers & Tax Software (4)
16. **koinly** - Koinly ✅ (Already fixed)
17. **turbotax** - TurboTax
18. **ghostfolio** - Ghostfolio
19. **sharesight** - Sharesight

## Test Procedure

For each broker CSV file:
1. Upload to dashboard at `http://localhost:3001/dashboard`
2. Verify detection (should show correct broker name)
3. Verify parsing (should show success message with trade count)
4. Verify import (trades should appear in dashboard)
5. Check console for any errors
6. Check debug logs for detection/parsing issues

## Expected Results

- ✅ Detection: Broker should be correctly identified
- ✅ Parsing: CSV should parse without errors
- ✅ Import: Trades should appear in dashboard
- ✅ Validation: Trade data should be correct (ticker, date, type, qty, price)

## Known Issues to Fix

- Koinly: ✅ Fixed with direct parser fallback
- Any other failures will be documented and fixed during testing


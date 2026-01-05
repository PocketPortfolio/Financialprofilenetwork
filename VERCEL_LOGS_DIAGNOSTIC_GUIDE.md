# Vercel Logs Diagnostic Guide - Dividend API

## How to Check Vercel Logs

### Method 1: Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select `pocket-portfolio-app` project
3. Click **Deployments** tab
4. Click on the latest deployment
5. Click **Functions** tab
6. Find `/api/dividend/[ticker]` function
7. Click **View Logs** or **View Function Logs**

### Method 2: Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# View logs for dividend API
vercel logs --follow --filter="api/dividend"

# Or view all logs
vercel logs --follow
```

### Method 3: Check Response Headers (Browser DevTools)
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Navigate to dividend history page
4. Find the request to `/api/dividend/[ticker]`
5. Click on the request
6. Go to **Headers** tab
7. Look for `X-Dividend-*` headers in Response Headers

## What to Look For in Logs

### Critical Log Patterns

**Filter for:** `[DIVIDEND_DEBUG]`

**Expected Log Entries:**
1. `[DIVIDEND_DEBUG] Request received for {TICKER} | EODHD: YES/NO | AlphaVantage: YES/NO`
2. `[DIVIDEND_DEBUG] Source: AlphaVantage | Status: ATTEMPTING | Key_Used: {prefix}...`
3. `[DIVIDEND_DEBUG] Source: AlphaVantage | Status: SUCCESS/FAILED/RATE_LIMITED`
4. `[DIVIDEND_DEBUG] Source: YahooFinance | Status: SUCCESS/FAILED`
5. `[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: SUCCESS/FAILED`
6. `[DIVIDEND_DEBUG] Source: ALL_FAILED | Status: NO_DATA | Diagnostic: {...}`

### Response Headers to Check

**In Browser DevTools → Network → Headers:**
- `X-Dividend-Route`: Should be `called`
- `X-Dividend-Ticker`: Should match the stock symbol
- `X-Dividend-EODHD-Key`: `YES` or `NO`
- `X-Dividend-AlphaVantage-Key`: `YES` or `NO`
- `X-Dividend-Circuit-Breaker`: `ACTIVE` or `INACTIVE`
- `X-Dividend-Diagnostic`: JSON with full diagnostic info

## Common Issues & Solutions

### Issue 1: No Logs Appearing
**Symptom:** Vercel logs show nothing for dividend API

**Possible Causes:**
- Route not being called (check Network tab)
- Logs being filtered out
- Function not deployed

**Solution:**
- Check response headers (they always appear)
- Verify route is in build output
- Check if function is actually being invoked

### Issue 2: All Sources Failing
**Log Pattern:** `[DIVIDEND_DEBUG] Source: ALL_FAILED`

**Check Diagnostic Header:**
```json
{
  "eodhdKeyConfigured": false,
  "alphaVantageKeyConfigured": false,
  "circuitBreakerActive": true,
  ...
}
```

**Solutions:**
- If `alphaVantageKeyConfigured: false` → Add `ALPHA_VANTAGE_API_KEY` to Vercel env vars
- If `circuitBreakerActive: true` → Wait for circuit breaker to expire (24h) or reset
- If all keys configured but still failing → Check rate limits

### Issue 3: Circuit Breaker Active
**Log Pattern:** `[DIVIDEND_DEBUG] Source: AlphaVantage | Status: RATE_LIMITED | Circuit Breaker: ACTIVE`

**Solution:**
- Circuit breaker activates for 24 hours after rate limit hit
- System will automatically use Yahoo Finance fallback
- Wait 24 hours or manually reset (requires code change)

### Issue 4: Yahoo Finance HTML Scraping Failing
**Log Pattern:** `[DIVIDEND_DEBUG] Source: YahooFinanceHTML | Status: ERROR`

**Possible Causes:**
- Yahoo Finance blocking requests
- HTML structure changed
- Network issues

**Solution:**
- Check if Yahoo Finance is accessible
- Verify HTML scraping patterns still work
- Consider premium API as fallback

## Diagnostic Endpoint

**Test the API directly:**
```bash
curl -I https://www.pocketportfolio.app/api/dividend/AAPL
```

**Check response headers:**
```bash
curl -v https://www.pocketportfolio.app/api/dividend/AAPL 2>&1 | grep "X-Dividend"
```

## Quick Diagnostic Checklist

- [ ] Route is deployed (check Vercel Functions tab)
- [ ] `ALPHA_VANTAGE_API_KEY` is set in Vercel environment variables
- [ ] Response headers show `X-Dividend-Route: called`
- [ ] Response headers show `X-Dividend-AlphaVantage-Key: YES`
- [ ] Logs show `[DIVIDEND_DEBUG]` entries
- [ ] No `circuitBreakerActive: true` in diagnostic header
- [ ] At least one data source returns `SUCCESS`

## Next Steps if Issues Persist

1. **Share Response Headers:** Copy all `X-Dividend-*` headers from browser DevTools
2. **Share Vercel Logs:** Export logs from Vercel dashboard (last 1 hour)
3. **Check Environment Variables:** Verify in Vercel Settings → Environment Variables
4. **Test Direct API Call:** Use curl to test the endpoint directly











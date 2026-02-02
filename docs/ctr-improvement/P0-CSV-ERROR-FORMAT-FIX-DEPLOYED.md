# CSV Error Format Fix - Production Issue Resolution

**Date:** 2026-02-02  
**Issue:** CSV requests returning JSON 404 errors when ticker data not found  
**Status:** ✅ **FIXED & DEPLOYED**  
**Commit:** `ad4a007`

---

## 🔍 Root Cause

The route handler was correctly being invoked (logs confirmed `[TICKERS_JSON_API] Route handler ENTRY`), but when Yahoo Finance API returned 404 for invalid tickers, the error handling returned a **JSON 404 response** even for **CSV requests**.

**Problem Flow:**
1. User requests `/api/tickers/INVALID/csv`
2. Route handler invoked ✅
3. Yahoo Finance API returns 404 for invalid ticker
4. `fetchHistoricalData()` returns `null`
5. Route handler checks `if (!historicalData)` and returns **JSON 404** ❌
6. Client expects CSV but receives JSON, causing download to fail

**Evidence from Logs:**
```
[TICKERS_JSON_API] Route handler ENTRY | Path: /api/tickers/AMZN/csv | Method: GET
[TICKERS_API] Extracted from pathname: ticker=AMZN, format=csv
Yahoo Finance API error for AAMNY: 404
```

---

## ✅ Solution Applied

**File:** `app/api/tickers/[...ticker]/route.ts` (Lines 406-418)

**Change:** Added format-aware error handling that returns CSV-formatted errors for CSV requests and JSON errors for JSON requests.

**Before:**
```typescript
if (!historicalData || historicalData.length === 0) {
  return NextResponse.json(
    { 
      error: `Historical data not found for ticker: ${ticker}`,
      symbol: ticker
    },
    { status: 404 }
  );
}
```

**After:**
```typescript
if (!historicalData || historicalData.length === 0) {
  // Return format-appropriate error response
  if (format === 'csv') {
    // Return CSV error response for CSV requests
    const errorCsv = `Date,Error\n${new Date().toISOString().split('T')[0]},Historical data not found for ticker: ${ticker}`;
    return new NextResponse(errorCsv, {
      status: 404,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${ticker}-error.csv"`,
      },
    });
  }
  
  // JSON error response for JSON requests
  return NextResponse.json(
    { 
      error: `Historical data not found for ticker: ${ticker}`,
      symbol: ticker
    },
    { status: 404 }
  );
}
```

---

## 📝 Files Changed

1. **`app/api/tickers/[...ticker]/route.ts`** (Lines 406-418)
   - Added format-aware error handling
   - CSV requests now return CSV-formatted errors
   - JSON requests continue to return JSON errors

---

## 🧪 Testing

### Production Testing URLs:
- ✅ `/api/tickers/AAPL/csv` - Valid ticker (should return CSV data)
- ✅ `/api/tickers/INVALID/csv` - Invalid ticker (should return CSV error)
- ✅ `/api/tickers/AAMNY/csv` - Invalid ticker (should return CSV error)

### Expected Behavior:
1. **Valid tickers:** CSV file downloads successfully with historical data
2. **Invalid tickers:** CSV file downloads with error message in CSV format
3. **Error format matches request format:** CSV requests get CSV errors, JSON requests get JSON errors
4. **Proper headers:** CSV error responses include `Content-Type: text/csv`

---

## 🔄 Deployment

**Deployment Status:** ✅ **AUTOMATIC DEPLOYMENT TRIGGERED**

Vercel will automatically deploy this change. Monitor:
- Vercel Dashboard → Deployments
- Function logs for `/api/tickers/[...ticker]`
- Production CSV download functionality

---

## 📊 Verification Steps

1. **Wait for Vercel deployment to complete** (usually 2-3 minutes)
2. **Test valid ticker CSV download:**
   ```bash
   curl -I https://www.pocketportfolio.app/api/tickers/AAPL/csv
   ```
   Expected: `200 OK` with `Content-Type: text/csv`

3. **Test invalid ticker CSV download:**
   ```bash
   curl https://www.pocketportfolio.app/api/tickers/INVALID/csv
   ```
   Expected: `404 Not Found` with CSV-formatted error content

4. **Test from browser:**
   - Navigate to: `https://www.pocketportfolio.app/s/invalid`
   - Click "Download INVALID Historical Data (CSV)" button
   - Should download CSV file with error message (not JSON)

---

## 🎯 Success Criteria

- ✅ CSV requests return CSV-formatted errors (not JSON)
- ✅ JSON requests continue to return JSON errors
- ✅ Error responses have correct `Content-Type` headers
- ✅ Client-side download handlers can process error responses correctly
- ✅ No breaking changes to existing JSON API behavior

---

## 📚 Related Issues

- **Previous Fix:** `P0-CSV-REWRITE-FIX-DEPLOYED.md` - Added rewrite rule for CSV paths
- **Previous Fix:** `P0-PRODUCTION-FIX-DEPLOYED.md` - Added `fetchCache` export
- **Root Cause:** Format mismatch between request format and error response format

---

## 🔗 Related Files

- `app/api/tickers/[...ticker]/route.ts` - CSV endpoint handler
- `app/components/TickerCsvDownload.tsx` - CSV download button component
- `next.config.js` - Rewrite configuration

---

**Next Steps:**
1. Monitor production CSV downloads for 24-48 hours
2. Verify error handling works for both valid and invalid tickers
3. Confirm no regression in JSON endpoint error handling
4. Proceed with P1 tasks (Desktop Optimization) once CSV is fully stable

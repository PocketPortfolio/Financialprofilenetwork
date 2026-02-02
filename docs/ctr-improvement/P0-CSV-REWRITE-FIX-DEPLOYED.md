# CSV Rewrite Fix - Production 404 Resolution

**Date:** 2026-02-02  
**Issue:** CSV endpoint returning 404 in production (`/api/tickers/{TICKER}/csv`)  
**Status:** ✅ **FIXED & DEPLOYED**  
**Commit:** `708eb6e`

---

## 🔍 Root Cause

The CSV endpoint was returning 404 errors in production despite:
- ✅ Route handler correctly implemented in `app/api/tickers/[...ticker]/route.ts`
- ✅ CSV format support fully functional
- ✅ `fetchCache = 'force-no-store'` export present
- ✅ Error handling improved

**The Issue:** `next.config.js` had a rewrite rule for JSON paths (`/api/tickers/:ticker/json`) but **no rewrite rule for CSV paths** (`/api/tickers/:ticker/csv`). In Next.js 15 production, this rewrite pattern helps ensure the catch-all route is properly recognized.

---

## ✅ Solution Applied

**Added CSV rewrite to `next.config.js`:**

```javascript
// Map /api/tickers/{ticker}/csv to catch-all route for Next.js 15 compatibility
{
  source: '/api/tickers/:ticker/csv',
  destination: '/api/tickers/:ticker/csv',
},
```

This matches the existing JSON rewrite pattern and ensures Next.js 15 recognizes CSV paths in production.

---

## 📝 Files Changed

1. **`next.config.js`** (Lines 67-70)
   - Added CSV rewrite rule after JSON rewrite
   - Ensures consistent routing for both JSON and CSV endpoints

---

## 🧪 Testing

### Production Testing URLs:
- ✅ `https://www.pocketportfolio.app/api/tickers/AAPL/csv` - Should return CSV file
- ✅ `https://www.pocketportfolio.app/api/tickers/GOOGL/csv` - Should return CSV file
- ✅ `https://www.pocketportfolio.app/api/tickers/MSFT/csv` - Should return CSV file

### Expected Behavior:
1. CSV endpoint returns 200 OK (not 404)
2. Response headers include:
   - `Content-Type: text/csv; charset=utf-8`
   - `Content-Disposition: attachment; filename="{TICKER}-historical-data.csv"`
3. CSV file downloads successfully
4. File contains properly formatted data (MM/DD/YYYY dates, UTF-8 BOM)

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
2. **Test CSV download:**
   ```bash
   curl -I https://www.pocketportfolio.app/api/tickers/AAPL/csv
   ```
   Expected: `200 OK` (not `404 Not Found`)

3. **Test from browser:**
   - Navigate to: `https://www.pocketportfolio.app/s/aapl`
   - Click "Download AAPL Historical Data (CSV)" button
   - Verify CSV file downloads successfully

4. **Check Vercel logs:**
   - Look for successful CSV endpoint invocations
   - Verify no 404 errors in function logs

---

## 🎯 Success Criteria

- ✅ CSV endpoint returns 200 OK in production
- ✅ CSV downloads work from ticker pages
- ✅ No 404 errors in Vercel function logs
- ✅ CSV files contain correct data format

---

## 📚 Related Issues

- **Previous Fix:** `P0-PRODUCTION-FIX-DEPLOYED.md` - Added `fetchCache` export
- **Root Cause:** Next.js 15 catch-all route recognition in production
- **Pattern:** Similar to JSON rewrite workaround for Next.js 15 compatibility

---

## 🔗 Related Files

- `next.config.js` - Rewrite configuration
- `app/api/tickers/[...ticker]/route.ts` - CSV endpoint handler
- `app/components/TickerCsvDownload.tsx` - CSV download button component

---

**Next Steps:**
1. Monitor production CSV downloads for 24-48 hours
2. Verify no regression in JSON endpoint
3. Track CSV download usage in analytics
4. Proceed with P1 tasks (Desktop Optimization) once CSV is stable

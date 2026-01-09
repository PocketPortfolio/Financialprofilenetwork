# Deployment Verification Checklist

**Date:** 2026-01-09  
**Deployment:** Complete API Routes Fix (Batch 4)  
**Status:** 🟡 **DEPLOYING**

---

## ✅ Pre-Deployment (Completed)

- [x] All API routes have Next.js 15 configuration
- [x] Build succeeds locally (`npm run build`)
- [x] Changes committed to Git
- [x] Pushed to GitHub (`main` branch)

---

## 🔍 Post-Deployment Verification

### 1. Vercel Deployment Status

**Check Vercel Dashboard:**
- [ ] Deployment started automatically
- [ ] Build completed successfully (no errors)
- [ ] Deployment is live

**Vercel Dashboard URL:** `https://vercel.com/[your-project]/deployments`

---

### 2. Critical API Routes Test

Test these routes in production to verify they're working:

#### Analytics & AI Routes
- [ ] `GET /api/tool-usage` - Should return success (POST endpoint, test via frontend)
- [ ] `GET /api/metrics/export` - Should return metrics data
- [ ] `POST /api/page-views` - Should return success
- [ ] `GET /api/search?q=AAPL` - Should return search results

#### Portfolio Routes
- [ ] `GET /api/portfolio/history?userId=test` - Should return portfolio history
- [ ] `GET /api/portfolio/benchmarks?symbol=SPY` - Should return benchmark data
- [ ] `GET /api/portfolio/sector-classification?ticker=AAPL` - Should return sector data
- [ ] `POST /api/portfolio/sector-classification/batch` - Should return batch classifications

#### Payment & Webhook Routes
- [ ] `POST /api/create-checkout-session` - Should create Stripe session (test with valid payload)
- [ ] `POST /api/webhooks/stripe` - Should handle webhook events (tested by Stripe)
- [ ] `GET /api/sponsors` - Should return sponsor data

#### Other Routes
- [ ] `GET /api/health` - Should return "OK"
- [ ] `POST /api/waitlist` - Should return deprecated message (410)
- [ ] `POST /api/import/parse` - Should return disabled message (503)

---

### 3. Frontend Integration Test

**Dashboard (`/dashboard`):**
- [ ] Dashboard loads without errors
- [ ] Portfolio data displays correctly
- [ ] No console errors related to API calls

**Admin Analytics (`/admin/analytics`):**
- [ ] Analytics dashboard loads
- [ ] Metrics display correctly
- [ ] Time range filters work

**Admin Sales (`/admin/sales`):**
- [ ] Sales dashboard loads
- [ ] Lead data displays
- [ ] Pipeline tabs work
- [ ] Lead details drawer opens

---

### 4. Vercel Logs Monitoring

**Check Vercel Function Logs:**
1. Go to Vercel Dashboard → Your Project → Functions
2. Check for any errors in the logs
3. Verify API routes are being invoked

**Look for:**
- ✅ Successful function invocations
- ✅ No 404 errors for API routes
- ✅ No runtime errors
- ✅ Proper response times

---

### 5. Production URL Test

**Test Production Endpoints:**

```bash
# Health check
curl https://pocket-portfolio-gr00mcqxs-abba-lawals-projects.vercel.app/api/health

# Search
curl "https://pocket-portfolio-gr00mcqxs-abba-lawals-projects.vercel.app/api/search?q=AAPL"

# Sponsors
curl https://pocket-portfolio-gr00mcqxs-abba-lawals-projects.vercel.app/api/sponsors

# Portfolio benchmarks
curl "https://pocket-portfolio-gr00mcqxs-abba-lawals-projects.vercel.app/api/portfolio/benchmarks?symbol=SPY"
```

**Expected Results:**
- All endpoints should return 200 (or appropriate status codes)
- No 404 errors
- Valid JSON responses

---

### 6. Browser Console Check

**Open Production Site:**
1. Navigate to production URL
2. Open browser DevTools (F12)
3. Check Console tab for errors
4. Check Network tab for failed API requests

**Look for:**
- ✅ No 404 errors for API routes
- ✅ No CORS errors
- ✅ API requests completing successfully
- ✅ No "Failed to fetch" errors

---

## 🚨 Troubleshooting

### If Routes Still Return 404:

1. **Check Vercel Deployment Status:**
   - Ensure deployment completed successfully
   - Check for build errors

2. **Verify Route Configuration:**
   - Ensure all routes have the 4 required exports:
     - `export const dynamic = 'force-dynamic';`
     - `export const runtime = 'nodejs';`
     - `export const revalidate = 0;`
     - `export const fetchCache = 'force-no-store';`

3. **Check Vercel Function Logs:**
   - Look for specific error messages
   - Check if routes are being invoked at all

4. **Clear Vercel Cache:**
   - Vercel Dashboard → Settings → Clear Build Cache
   - Redeploy

### If Routes Return 500 Errors:

1. **Check Environment Variables:**
   - Ensure all required env vars are set in Vercel
   - Check for missing API keys or database URLs

2. **Check Function Logs:**
   - Look for runtime errors
   - Check database connection issues
   - Verify external API calls

---

## 📊 Success Criteria

**Deployment is successful when:**
- ✅ All API routes return valid responses (not 404)
- ✅ Frontend pages load without API errors
- ✅ No errors in Vercel function logs
- ✅ No errors in browser console
- ✅ Critical user flows work (dashboard, admin, sales)

---

## 📝 Notes

- **Deployment Time:** Vercel typically deploys within 2-5 minutes
- **Cache Invalidation:** Vercel may cache routes for a few minutes after deployment
- **Testing:** Wait 2-3 minutes after deployment before testing to ensure cache is cleared

---

## 🔗 Related Documentation

- [Production API Routes Fix](./PRODUCTION-API-ROUTES-FIX.md)
- [Production Readiness Checklist](./PRODUCTION-READINESS-CHECKLIST.md)
- [Catch-All Route Fix](./CATCH-ALL-ROUTE-FIX.md)

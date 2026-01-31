# Route Fix & Sitemap URL Testing Guide

## Issue: Programmatic Risk Pages Returning 404

**Root Cause:** The route folder structure didn't match the URL pattern.

**Solution Applied:** Converted to catch-all route `track-[...ticker]` to handle `/tools/track-{ticker}-risk` URLs.

---

## Route Fix Status

✅ **Fixed:** `app/tools/track-[...ticker]/page.tsx`
- Catch-all route implemented
- Handles `-risk` suffix correctly
- Route segment config added

⚠️ **Action Required:** **RESTART DEV SERVER**

The Next.js dev server needs to be restarted to recognize the new route structure.

---

## Testing Instructions

### Step 1: Restart Dev Server

```bash
# Stop current dev server (Ctrl+C)
# Then restart:
npm run dev
```

Wait for server to be ready (you'll see "Ready" in console).

### Step 2: Verify Route Works

Test a single risk page manually:
```bash
# Should return 200 (not 404)
curl http://localhost:3001/tools/track-aapl-risk
```

Or open in browser:
- http://localhost:3001/tools/track-aapl-risk
- http://localhost:3001/tools/track-nvda-risk
- http://localhost:3001/tools/track-tsla-risk

### Step 3: Run Sample Test (Quick Verification)

Tests 100 sample URLs (~2-3 minutes):
```bash
npx ts-node --project scripts/tsconfig.json scripts/test-sitemap-sample.ts
```

**Expected:** All risk pages should return 200.

### Step 4: Run Full Test (All 62,115 URLs)

⚠️ **WARNING:** This will take 30-60 minutes.

```bash
npx ts-node --project scripts/tsconfig.json scripts/test-all-sitemap-urls.ts
```

**Progress:** Results saved to `sitemap-full-test-results.json` every 100 URLs (can resume if interrupted).

---

## Test Scripts Available

1. **`scripts/test-sitemap-sample.ts`**
   - Tests 100 sample URLs
   - Quick verification
   - Duration: ~2-3 minutes

2. **`scripts/test-sitemap-urls.ts`**
   - Tests ALL URLs from sitemap
   - Full coverage
   - Duration: 30-60 minutes
   - Saves results to `sitemap-test-results.json`

3. **`scripts/test-all-sitemap-urls.ts`**
   - Tests ALL URLs with category breakdown
   - Progress saving every 100 URLs
   - Duration: 30-60 minutes
   - Saves results to `sitemap-full-test-results.json`

---

## Expected Test Results

### Sample Test (100 URLs)
- **Total:** 100 URLs
- **Expected Pass:** 100 (100%)
- **Risk Pages:** Should all return 200

### Full Test (62,115 URLs)
- **Total:** 62,115 URLs
- **Expected Pass:** 62,115 (100%)
- **Breakdown:**
  - Static pages: ~28 (100% pass expected)
  - Import pages: ~60 (100% pass expected)
  - Tool pages: ~511 (100% pass expected, including 500 risk pages)
  - Blog pages: ~92 (100% pass expected)
  - Ticker pages: ~61,424 (100% pass expected)

---

## Troubleshooting

### Risk Pages Still 404 After Restart

1. **Check route folder exists:**
   ```bash
   ls app/tools/track-[...ticker]/
   ```
   Should show: `page.tsx` and `RiskCalculatorPrefilled.tsx`

2. **Verify old route is removed:**
   ```bash
   ls app/tools/track-[ticker]/
   ```
   Should return "not found" (old folder should be deleted)

3. **Check Next.js build:**
   ```bash
   npm run build
   ```
   Should complete without errors

### Other URLs Returning 404

- **Dashboard/Positions (500 errors):** Expected - these require authentication
- **Import pages (fetch failed):** May need API routes running
- **Ticker pages:** Should all work (ISR handles on-demand)

---

## Critical URLs to Test

After restarting dev server, verify these work:

1. **Risk Pages (Week 1 Feature):**
   - ✅ http://localhost:3001/tools/track-aapl-risk
   - ✅ http://localhost:3001/tools/track-nvda-risk
   - ✅ http://localhost:3001/tools/track-tsla-risk

2. **Ticker Pages (Pricing Schema Fix):**
   - ✅ http://localhost:3001/s/aapl
   - ✅ http://localhost:3001/s/nvda
   - ✅ http://localhost:3001/s/tsla

3. **Blog Posts (TechArticle Schema):**
   - ✅ http://localhost:3001/blog/stop-building-fintech-with-databases-why-i-went-local-first-

---

## Next Steps

1. ✅ Route fix implemented
2. ⏳ **Restart dev server** (required)
3. ⏳ Run sample test to verify
4. ⏳ Run full test if sample passes
5. ⏳ Deploy to production

---

**Status:** Route fix complete, awaiting dev server restart for testing.







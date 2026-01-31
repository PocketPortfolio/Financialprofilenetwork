# Sitemap URL Testing Instructions

## Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```
   Wait for the server to be ready (you'll see "Ready" in the console)

2. **Build sitemaps (if not already built):**
   ```bash
   npm run build:sitemaps
   ```

## Test Options

### Option 1: Quick Sample Test (Recommended First)
Tests 100 sample URLs to verify routes work:
```bash
npx ts-node --project scripts/tsconfig.json scripts/test-sitemap-sample.ts
```

### Option 2: Full Sitemap Test
Tests ALL 62,115 URLs (will take 30-60 minutes):
```bash
npx ts-node --project scripts/tsconfig.json scripts/test-sitemap-urls.ts
```

## Expected Results

### Sample Test
- **Total URLs**: ~100
- **Expected Pass Rate**: 100% (all should return 200)
- **Duration**: ~2-3 minutes

### Full Test
- **Total URLs**: 62,115
- **Expected Pass Rate**: 100% (all should return 200)
- **Duration**: 30-60 minutes (depending on server performance)

## Common Issues

### "fetch failed" errors
- **Cause**: Dev server not running
- **Fix**: Start dev server with `npm run dev`

### 500 errors on dashboard/positions pages
- **Cause**: These pages require authentication/session
- **Note**: These are expected in test environment, not production issues

### 404 errors on risk pages
- **Cause**: Route folder structure issue
- **Fix**: Ensure `app/tools/track-[...ticker]/` exists (catch-all route)
- **Verify**: Check that old `app/tools/track-[ticker]/` folder is removed

## Test Results

Results are saved to:
- **Sample test**: Console output only
- **Full test**: `sitemap-test-results.json` (detailed JSON with all results)

## Critical URLs to Verify

After running tests, manually verify these critical URLs:

1. **Risk Pages** (Week 1 feature):
   - http://localhost:3001/tools/track-aapl-risk
   - http://localhost:3001/tools/track-nvda-risk
   - http://localhost:3001/tools/track-tsla-risk

2. **Ticker Pages** (Pricing schema fix):
   - http://localhost:3001/s/aapl
   - http://localhost:3001/s/nvda
   - http://localhost:3001/s/tsla

3. **Blog Posts** (TechArticle schema):
   - http://localhost:3001/blog/stop-building-fintech-with-databases-why-i-went-local-first-

## Next Steps After Testing

1. If all tests pass: ✅ Ready for deployment
2. If risk pages fail: Check route folder structure
3. If ticker pages fail: Verify pricing schema implementation
4. If blog posts fail: Check TechArticle schema logic







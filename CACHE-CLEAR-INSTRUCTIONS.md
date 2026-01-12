# Cache Clearing Instructions for OG Image Fix

## ✅ Diagnosis Results

**Good News:** All technical tests pass!
- ✅ robots.txt correctly allows `/api/og`
- ✅ OG image endpoint returns valid PNG images (75KB, proper signature)
- ✅ All crawlers (Facebook, Twitter, LinkedIn) receive valid images
- ✅ Meta tags are correctly configured

**The Issue:** Facebook and Twitter have **cached** the old responses from before the fix.

## 🔧 Solution: Force Cache Refresh

### Step 1: Deploy Updated Cache-Busting Parameter

The cache-busting parameter has been updated from `v=2` to `v=3` in all files. This forces platforms to fetch a fresh image.

**Files Updated:**
- `app/layout.tsx`
- `app/lib/seo/meta.ts`
- `app/components/SEOHead.tsx`
- `app/join/page.tsx`
- `app/openbrokercsv/page.tsx`
- `app/static/csv-etoro-to-openbrokercsv/page.tsx`

### Step 2: Clear Platform Caches

After deployment, you **MUST** manually clear caches on each platform:

#### Facebook/Meta Sharing Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter: `https://www.pocketportfolio.app`
3. Click **"Scrape Again"** (do this 2-3 times)
4. Wait for it to complete
5. Check that the preview shows the image correctly

**Important:** Facebook caches aggressively. You may need to:
- Click "Scrape Again" multiple times
- Wait 5-10 minutes between attempts
- Use the "Fetch new information" button if available

#### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter: `https://www.pocketportfolio.app`
3. Click **"Preview card"**
4. Check the log - the robots.txt warning should be gone
5. The preview should show the image

**Note:** Twitter may take a few minutes to re-crawl after robots.txt is updated.

#### LinkedIn Post Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter: `https://www.pocketportfolio.app`
3. Click **"Inspect"**
4. Verify the image appears

### Step 3: Verify the Fix

After clearing caches, verify:

1. **Facebook:** No "Corrupted Image" warning, image displays
2. **Twitter:** No robots.txt warning in log, card preview shows image
3. **LinkedIn:** Image appears in preview

## 🐛 If Issues Persist

### Facebook Still Shows "Corrupted Image"

1. **Check the actual image URL:**
   ```
   https://www.pocketportfolio.app/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing&v=3
   ```
   - Should return a PNG image
   - Should be ~75KB in size
   - Should display in browser

2. **Verify robots.txt:**
   ```
   https://www.pocketportfolio.app/robots.txt
   ```
   - Should show `Allow: /api/og` at the top

3. **Try a different cache-busting parameter:**
   - Update `v=3` to `v=4` or use a timestamp
   - Deploy and clear caches again

### Twitter Still Shows robots.txt Warning

1. **Wait 10-15 minutes** after robots.txt update
2. **Verify robots.txt** shows `Allow: /api/og` before `Disallow: /api/`
3. **Use Twitter Card Validator** to force a fresh crawl
4. **Check the log** - warning should disappear after re-crawl

## 📊 Test Scripts

Run these to verify everything is working:

```bash
# Test production configuration
node scripts/test-production-og-fix.js

# Test image response (diagnoses corrupted image issues)
node scripts/test-og-image-response.js
```

## ⏱️ Timeline

- **Immediate:** Deploy v=3 update
- **5 minutes:** Clear Facebook cache (may need multiple attempts)
- **10 minutes:** Clear Twitter cache
- **15 minutes:** Clear LinkedIn cache
- **24 hours:** All platform caches should be fully refreshed

## ✅ Success Indicators

- Facebook: Image displays, no "Corrupted Image" warning
- Twitter: Card preview shows image, no robots.txt warning in log
- LinkedIn: Image appears in preview
- All platforms: Preview shows correct title and description

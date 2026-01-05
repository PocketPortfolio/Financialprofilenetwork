# How to Clear Social Media OG Image Cache

## The Problem
Social media platforms (Facebook, Twitter, LinkedIn, WhatsApp) aggressively cache Open Graph images. Even after updating your OG image URL, they may continue showing the old cached image for 24-48 hours.

## Solution: Clear Platform Caches

### 1. Facebook/Meta
**URL:** https://developers.facebook.com/tools/debug/

**Steps:**
1. Go to the Facebook Sharing Debugger
2. Enter your URL: `https://www.pocketportfolio.app`
3. Click "Debug"
4. Click "Scrape Again" button (this forces Facebook to fetch fresh data)
5. Wait for it to complete
6. Verify the new OG image appears in the preview

**Note:** You may need to click "Scrape Again" multiple times if the cache is stubborn.

### 2. Twitter/X
**URL:** https://cards-dev.twitter.com/validator

**Steps:**
1. Go to Twitter Card Validator
2. Enter your URL: `https://www.pocketportfolio.app`
3. Click "Preview card"
4. Verify the new image appears

**Note:** Twitter caches are usually less aggressive than Facebook.

### 3. LinkedIn
**URL:** https://www.linkedin.com/post-inspector/

**Steps:**
1. Go to LinkedIn Post Inspector
2. Enter your URL: `https://www.pocketportfolio.app`
3. Click "Inspect"
4. Verify the new image appears

### 4. WhatsApp
**Method:** Share URL with cache-busting parameter

**Steps:**
1. Share the URL with a query parameter: `https://www.pocketportfolio.app/?t=20250123`
2. Or wait 24-48 hours for cache to expire naturally

### 5. Discord
**Method:** Use a different URL or wait

Discord doesn't have a cache clearing tool, but you can:
- Share URL with query parameter: `https://www.pocketportfolio.app/?t=20250123`
- Wait 24-48 hours for cache to expire

## Verification

After clearing caches, verify the OG image is correct:

1. **Test OG Image Directly:**
   ```
   https://www.pocketportfolio.app/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing&t=20250123
   ```
   Should display the generated image with "Pocket Portfolio" title.

2. **Check HTML Meta Tags:**
   - Visit: `https://www.pocketportfolio.app`
   - View page source (Ctrl+U)
   - Search for `og:image`
   - Should show: `https://www.pocketportfolio.app/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing&t=20250123`

3. **Run Verification Script:**
   ```bash
   node scripts/verify-og-image.js
   ```

## Why This Happens

Social media platforms cache OG images to:
- Reduce server load
- Improve performance
- Prevent abuse

However, this means updates take time to propagate. The cache-busting parameter (`t=20250123`) helps, but you still need to clear platform caches manually for immediate results.

## Current Status

✅ **OG Image Endpoint:** Working (200 status, image/png)
✅ **Meta Tags:** Correct (using timestamp-based cache-busting)
✅ **Code:** All files updated with new cache-busting parameter

**Next Step:** Clear social media platform caches using the tools above.




















# OG Image Fix - Testing Guide

## ✅ Changes Committed and Pushed

**Commit:** `538769b` - "Allow /api/og in robots.txt for social media crawlers"

### Files Changed:
- `app/robots.ts` - Added explicit Allow rule for `/api/og`
- `scripts/test-local-robots.js` - Local testing script
- `scripts/test-production-og-fix.js` - Production testing script

---

## 🧪 Automated Testing

### Local Testing (Before Deployment)
```bash
# Start dev server
npm run dev

# Test robots.txt configuration
node scripts/test-local-robots.js

# Or specify port if not 3000
node scripts/test-local-robots.js 3001
```

### Production Testing (After Deployment)
```bash
# Test production deployment
node scripts/test-production-og-fix.js
```

This script verifies:
- ✅ robots.txt allows `/api/og`
- ✅ OG image endpoint is accessible
- ✅ Meta tags are correctly configured
- ✅ Social media crawlers can access the endpoint

---

## 🔍 Manual Testing Steps

### 1. Verify robots.txt (After Deployment)

Visit: `https://www.pocketportfolio.app/robots.txt`

**Expected Output:**
```
User-Agent: *
Allow: /api/og

User-Agent: *
Allow: /
Disallow: /api/
...
```

**Check:**
- ✅ `Allow: /api/og` appears **before** `Disallow: /api/`
- ✅ The rule is for `User-Agent: *` (all crawlers)

### 2. Test OG Image Endpoint

Visit: `https://www.pocketportfolio.app/api/og?title=Test&description=Test`

**Expected:**
- ✅ Returns HTTP 200
- ✅ Content-Type: `image/png`
- ✅ Displays an image with "Test" title and description

### 3. Facebook Sharing Debugger

**URL:** https://developers.facebook.com/tools/debug/

**Steps:**
1. Enter: `https://www.pocketportfolio.app`
2. Click **"Scrape Again"** to clear cache
3. Check the preview:
   - ✅ Image should display (not corrupted)
   - ✅ Title: "Pocket Portfolio | Google Drive Sync & Sovereign Financial Tracking"
   - ✅ Description should be visible
   - ✅ No warnings about robots.txt blocking the image

**Expected Result:**
- ✅ No "Corrupted Image" warning
- ✅ Preview shows the generated OG image
- ✅ No robots.txt restriction warnings

### 4. Twitter Card Validator

**URL:** https://cards-dev.twitter.com/validator

**Steps:**
1. Enter: `https://www.pocketportfolio.app`
2. Click **"Preview card"**
3. Check the log:
   - ✅ No warning about robots.txt blocking `/api/og`
   - ✅ Card preview shows image
   - ✅ Title and description are correct

**Expected Result:**
- ✅ No robots.txt warning in the log
- ✅ Card preview displays correctly
- ✅ Image URL is accessible

### 5. LinkedIn Post Inspector

**URL:** https://www.linkedin.com/post-inspector/

**Steps:**
1. Enter: `https://www.pocketportfolio.app`
2. Click **"Inspect"**
3. Verify:
   - ✅ OG image is fetched successfully
   - ✅ Preview displays correctly

### 6. Open Graph Checker (Third-party)

**URL:** https://www.opengraph.xyz/url/https%3A%2F%2Fwww.pocketportfolio.app

**Check:**
- ✅ All OG tags are present
- ✅ Image URL points to `/api/og` endpoint
- ✅ Image is accessible

---

## 📊 Test Checklist

### Pre-Deployment (Local)
- [ ] `node scripts/test-local-robots.js` passes
- [ ] robots.txt shows `Allow: /api/og` before `Disallow: /api/`
- [ ] OG image endpoint returns 200 OK with image/png

### Post-Deployment (Production)
- [ ] `node scripts/test-production-og-fix.js` passes
- [ ] Production robots.txt includes `Allow: /api/og`
- [ ] Facebook Sharing Debugger shows no errors
- [ ] Twitter Card Validator shows no robots.txt warnings
- [ ] LinkedIn Post Inspector successfully fetches image
- [ ] Actual sharing on platforms shows correct preview

---

## 🐛 Troubleshooting

### Issue: robots.txt still shows old version
**Solution:** Wait for deployment to complete, then verify again. Vercel deployments typically take 1-3 minutes.

### Issue: Facebook shows "Corrupted Image"
**Solution:**
1. Clear Facebook cache using Sharing Debugger ("Scrape Again")
2. Verify OG image endpoint returns valid PNG: `https://www.pocketportfolio.app/api/og?title=Test&description=Test`
3. Check that image URL in meta tags is absolute (starts with `https://`)

### Issue: Twitter shows robots.txt warning
**Solution:**
1. Verify robots.txt includes `Allow: /api/og` before `Disallow: /api/`
2. Wait a few minutes for Twitter to re-crawl
3. Use Twitter Card Validator to force refresh

### Issue: Image not updating after fix
**Solution:**
1. Clear social media caches (use "Scrape Again" / "Preview card" / "Inspect")
2. Verify cache-busting parameter `v=2` is in the image URL
3. Wait 24 hours for platform caches to expire naturally

---

## 📝 Expected Test Results

### ✅ Success Indicators:
- robots.txt allows `/api/og` ✅
- OG image endpoint accessible (200 OK) ✅
- Meta tags use `/api/og` endpoint ✅
- No robots.txt warnings in validators ✅
- Preview images display correctly ✅
- Social crawlers can access endpoint ✅

### ❌ Failure Indicators:
- robots.txt doesn't include `Allow: /api/og`
- OG image endpoint returns 403/404
- Facebook shows "Corrupted Image"
- Twitter shows robots.txt restriction warning
- Preview shows skeleton/placeholder

---

## 🚀 Deployment Status

**Current Status:** Changes committed and pushed to `main` branch

**Next Steps:**
1. Wait for Vercel deployment (check Vercel dashboard)
2. Run production test: `node scripts/test-production-og-fix.js`
3. Clear social media caches
4. Verify on each platform

---

## 📞 Quick Reference

**Test Scripts:**
- Local: `node scripts/test-local-robots.js [port]`
- Production: `node scripts/test-production-og-fix.js`

**Manual Test URLs:**
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/
- Open Graph: https://www.opengraph.xyz/

**Key URLs:**
- robots.txt: `https://www.pocketportfolio.app/robots.txt`
- OG Image: `https://www.pocketportfolio.app/api/og?title=Test&description=Test`
- Homepage: `https://www.pocketportfolio.app`


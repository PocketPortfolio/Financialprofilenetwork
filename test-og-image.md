# Open Graph Image Testing Guide

## Changes Made
- Updated `app/layout.tsx` to use dynamic OG image API route instead of missing static PNG file
- Changed from: `https://www.pocketportfolio.app/brand/og-base.png`
- Changed to: `https://www.pocketportfolio.app/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing`

## Testing Steps

### 1. Local Testing
After starting the dev server (`npm run dev`), test the OG image endpoint:
```
http://localhost:3000/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing
```

You should see a generated image with:
- Title: "Pocket Portfolio"
- Description: "Evidence-First Investing"
- Background: Light gray gradient
- Size: 1200x630px

### 2. Verify Meta Tags
Check the HTML source of your homepage:
```html
<meta property="og:image" content="https://www.pocketportfolio.app/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:image" content="https://www.pocketportfolio.app/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing" />
```

### 3. Clear Social Media Caches

After deploying to production, clear the caches on these platforms:

**Facebook Debugger:**
https://developers.facebook.com/tools/debug/
- Enter: `https://www.pocketportfolio.app`
- Click "Scrape Again" to clear cache

**Twitter Card Validator:**
https://cards-dev.twitter.com/validator
- Enter: `https://www.pocketportfolio.app`
- Click "Preview card"

**LinkedIn Post Inspector:**
https://www.linkedin.com/post-inspector/
- Enter: `https://www.pocketportfolio.app`
- Click "Inspect"

**WhatsApp:**
- Share URL with query parameter: `?v=2` to force refresh

### 4. Production Testing
Once deployed, verify the OG image is accessible:
```
https://www.pocketportfolio.app/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing
```

## Expected Result
- Social media platforms will show the dynamically generated OG image
- The image will display "Pocket Portfolio" title and "Evidence-First Investing" description
- No more GoDaddy background images in link previews

## Notes
- Social media platforms cache OG images for 24-48 hours
- After clearing cache, new previews should appear immediately
- The dynamic API route generates images on-demand, so they're always up-to-date




















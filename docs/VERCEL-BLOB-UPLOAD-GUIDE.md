# CDN Upload Guide - 4K Dashboard Demo GIF

## Status
✅ Code updated to use CDN URL via environment variable
⏳ **Action Required:** Upload GIF to CDN and set environment variable

## Recommended: Cloudinary (Easiest Setup)

Cloudinary offers a free tier and is easier to set up than Vercel Blob.

### Quick Setup:

1. **Sign up for Cloudinary** (free tier):
   - Go to https://cloudinary.com/users/register/free
   - Create a free account

2. **Get your credentials:**
   - Go to Dashboard → Settings → Product Environment Credentials
   - Copy: Cloud Name, API Key, API Secret

3. **Add credentials to `.env.local`:**
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Upload the GIF:**
   ```bash
   npm run upload-gif-cloudinary
   ```

5. **Copy the returned URL** and add to Vercel Environment Variables:
   - Variable: `NEXT_PUBLIC_DASHBOARD_DEMO_GIF_URL`
   - Value: `https://res.cloudinary.com/.../dashboard-demo-4k.gif`
   - Apply to: Production, Preview, Development

## Quick Steps

### Option 1: Via Vercel Dashboard (Recommended)

1. **Create Blob Store:**
   - Go to https://vercel.com/dashboard
   - Select project: `pocket-portfolio-app`
   - Go to **Storage** → **Blob**
   - Click **Create Blob Store** (if not exists)
   - Name it: `pocket-portfolio-assets`

2. **Get Read-Write Token:**
   - In Blob store settings, copy the **Read-Write Token**

3. **Upload via CLI:**
   ```bash
   BLOB_READ_WRITE_TOKEN=your_token_here npx vercel blob put ./public/dashboard-demo-4k.gif
   ```

4. **Copy the returned URL** (format: `https://public.blob.vercel-storage.com/...`)

5. **Add to Environment Variables:**
   - In Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_DASHBOARD_DEMO_GIF_URL` = `[the URL from step 4]`
   - Apply to: **Production, Preview, Development**

### Option 2: Via Script

1. **Get Blob Token** (from Vercel Dashboard as above)

2. **Run upload script:**
   ```bash
   BLOB_READ_WRITE_TOKEN=your_token_here npm run upload-gif
   ```

3. **Add URL to environment variables** (same as Option 1, step 5)

## Code Changes Made

✅ **Landing page updated** (`app/landing/page.tsx`):
- Now uses: `process.env.NEXT_PUBLIC_DASHBOARD_DEMO_GIF_URL || "/dashboard-demo-4k.gif"`
- Falls back to local path if env var not set (for local dev)

## Verification

After setting the environment variable:
1. Redeploy on Vercel (or wait for next deployment)
2. Visit `/landing` page
3. Verify GIF loads from CDN (check Network tab in DevTools)

## File Size Warning

⚠️ **Performance Note:** The 4K GIF is 286MB and will take 20-40 seconds to load on 4G/5G.

**Future Optimization:** Consider converting to looping MP4/WebM (~20MB, same quality, instant load).


# Cloudinary CDN Setup - Quick Guide

## Why Cloudinary?

- ✅ Free tier (25GB storage, 25GB bandwidth/month)
- ✅ Easy setup (no complex token management)
- ✅ Automatic optimization
- ✅ Global CDN
- ✅ Works immediately

## Setup Steps

### 1. Create Account
- Visit: https://cloudinary.com/users/register/free
- Sign up with email (free tier is sufficient)

### 2. Get Credentials
- After login, go to: **Dashboard** → **Settings** → **Product Environment Credentials**
- You'll see:
  - **Cloud Name** (e.g., `dxyz123abc`)
  - **API Key** (e.g., `123456789012345`)
  - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Add to `.env.local`
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 4. Upload GIF
```bash
npm run upload-gif-cloudinary
```

The script will:
- Upload the 286MB GIF to Cloudinary
- Return a CDN URL like: `https://res.cloudinary.com/your-cloud/image/upload/v1234567890/pocket-portfolio/dashboard-demo-4k.gif`
- Display instructions for next steps

### 5. Add URL to Vercel
1. Go to: https://vercel.com/dashboard → `pocket-portfolio-app` → **Settings** → **Environment Variables**
2. Add new variable:
   - **Name:** `NEXT_PUBLIC_DASHBOARD_DEMO_GIF_URL`
   - **Value:** `[URL from step 4]`
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
3. Save

### 6. Deploy
- Push your code changes
- Vercel will automatically redeploy
- The GIF will load from Cloudinary CDN

## Verification

After deployment:
1. Visit `/landing` page
2. Open DevTools → Network tab
3. Look for the GIF request
4. Should show: `res.cloudinary.com` in the URL
5. Should load successfully (may take 20-40 seconds due to 286MB size)

## Free Tier Limits

- **Storage:** 25GB (your GIF is 286MB, so ~87 uploads)
- **Bandwidth:** 25GB/month
- **Transformations:** Unlimited

For a single 4K GIF, the free tier is more than sufficient.


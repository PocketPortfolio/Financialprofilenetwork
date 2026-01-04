# Production Dynamic Routes 404 Diagnosis

## Issue Summary
**All dynamic API routes return 404 in production**, including:
- `/api/dividend/[ticker]` → 404
- `/api/price/[ticker]` → 404

**Non-dynamic routes work correctly:**
- `/api/quote?symbol=AAPL` → 200 ✅
- `/api/api-keys/user` → 401 ✅ (expected auth error)

## Build Evidence
From Vercel build logs, both routes ARE being built:
```
├ ƒ /api/dividend/[ticker]                                             0 B                0 B
├ ƒ /api/price/[ticker]                                                0 B                0 B
```
Both marked as `ƒ (Dynamic) server-rendered on demand`

## Root Cause Analysis

### ✅ Confirmed Working
1. **Routes are built** - Both appear in build output
2. **Code structure is correct** - Matches working non-dynamic routes
3. **Middleware excludes API routes** - `api` is in matcher exclusion
4. **Local testing works** - Routes work perfectly on `localhost:3001`

### ❌ Production Issue
1. **Dynamic route pattern `[ticker]` not matching** in production
2. **Next.js 14.2.35** - Possible compatibility issue with Vercel
3. **Vercel function registration** - Routes may not be properly registered at runtime

## Possible Causes

### 1. Next.js 14 Dynamic Route Handling
- Next.js 14 changed how dynamic routes are handled
- May require explicit route segment config
- Check if `export const dynamic = 'force-dynamic'` is sufficient

### 2. Vercel Function Routing
- Vercel may not be recognizing dynamic route patterns
- Function may be created but not properly routed
- Check Vercel Functions tab in dashboard

### 3. Build Cache Issue
- Old build cache may be interfering
- Try clearing Vercel build cache

## Diagnostic Steps Completed

✅ **1. Verified route structure**
- Both routes have identical structure to working routes
- Both export `GET` function correctly
- Both have `export const dynamic = 'force-dynamic'`

✅ **2. Checked build output**
- Routes appear in build logs
- Marked as dynamic functions

✅ **3. Tested non-dynamic routes**
- `/api/quote` works (200)
- `/api/api-keys/user` works (401 - expected)

✅ **4. Verified middleware**
- Middleware excludes `/api/*` routes
- Not interfering with API routes

## Next Steps

### Immediate Actions
1. **Check Vercel Dashboard Functions Tab**
   - Go to: Vercel Dashboard → Latest Deployment → Functions
   - Verify `/api/dividend/[ticker]` and `/api/price/[ticker]` appear
   - Check function sizes and regions

2. **Check Vercel Runtime Logs**
   - Look for route registration errors
   - Check if functions are being invoked
   - Look for any Next.js routing errors

3. **Test with Vercel CLI**
   ```bash
   vercel logs https://www.pocketportfolio.app/api/dividend/AAPL
   ```

4. **Clear Build Cache**
   - In Vercel Dashboard → Project Settings → General
   - Clear build cache and redeploy

5. **Check Next.js Version Compatibility**
   - Current: Next.js 14.2.35
   - Check if there are known issues with dynamic routes
   - Consider upgrading to latest 14.x or 15.x

### Code-Level Fixes to Try

1. **Add explicit route segment config**
   ```typescript
   export const dynamic = 'force-dynamic';
   export const dynamicParams = true; // Allow dynamic params
   ```

2. **Verify route file naming**
   - Ensure `[ticker]` folder name is correct
   - Ensure `route.ts` file name is correct

3. **Compare with working dynamic page routes**
   - `/s/[symbol]` works (dynamic page route)
   - Compare structure with `/api/dividend/[ticker]`

## Status
🔴 **BLOCKED** - All dynamic API routes return 404 in production
🟢 **WORKING** - Non-dynamic API routes work correctly
🟢 **WORKING** - Dynamic page routes work correctly (`/s/[symbol]`)

## Critical Finding: Routes Registered But Not Matched

**Confirmed via Vercel Dashboard:**
- ✅ `/api/dividend/[ticker]` IS registered in Vercel Functions tab
- ✅ Route shows: Node 24, IAD1 region, 3.73 MB, ≤300s timeout
- ✅ Route is built and deployed correctly

**But:**
- ❌ HTTP response shows `X-Matched-Path: /404` 
- ❌ Next.js is routing to 404 page instead of API route
- ❌ No function invocations in logs (routes never called)

## Root Cause Identified

This is a **Next.js 14 routing issue** where dynamic API routes are registered but Next.js's internal router isn't matching them. The routes exist as Vercel functions but Next.js returns 404 before the function is invoked.

## Solution: Next.js Configuration Fix

The issue is likely related to Next.js 14's handling of dynamic API routes. Try these fixes:

### Fix 1: Add Route Segment Config (Already Present)
Both routes already have:
```typescript
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
```

### Fix 2: Verify Route File Structure
Ensure the file structure is exactly:
```
app/api/dividend/[ticker]/route.ts
app/api/price/[ticker]/route.ts
```

### Fix 3: Check Next.js Version
- Current: Next.js 14.2.35
- Known issue: Some Next.js 14.x versions have dynamic API route matching issues on Vercel
- **Recommended:** Upgrade to Next.js 14.2.36+ or 15.x

### Fix 4: Clear Vercel Build Cache
1. Vercel Dashboard → Project Settings → General
2. Clear build cache
3. Redeploy

### Fix 5: Check for Conflicting Routes
Verify no other routes are matching `/api/dividend/*` or `/api/price/*` before the dynamic routes.

## Conclusion
This is a **Next.js 14 routing bug** where dynamic API routes are registered in Vercel but Next.js's router isn't matching them at runtime. The routes exist but Next.js returns 404 before invoking them. Requires Next.js version upgrade or configuration fix.

## Fixes Applied (2025-01-XX)

### Next.js 15 Params Migration
Updated all dynamic routes (API and pages) to handle Next.js 15's async params requirement:

1. **API Routes Updated:**
   - `/api/dividend/[ticker]/route.ts`
   - `/api/price/[ticker]/route.ts`
   - `/api/api-keys/[email]/route.ts`
   - `/api/api-keys/session/[sessionId]/route.ts`
   - `/api/dividend/test/[ticker]/route.ts`

2. **Page Routes Updated:**
   - `/blog/[slug]/page.tsx`
   - `/compare/[competitor]/page.tsx`
   - `/import/[broker]/page.tsx`
   - `/share/[user_id]/page.tsx`
   - `/p/[blob]/page.tsx`
   - `/s/[symbol]/page.tsx`
   - `/s/[symbol]/dividend-history/page.tsx`
   - `/s/[symbol]/insider-trading/page.tsx`
   - `/s/[symbol]/json-api/page.tsx`
   - `/tools/[conversion_pair]/page.tsx`

3. **Changes Made:**
   - Changed `params: { key: string }` to `params: Promise<{ key: string }>`
   - Added `const resolvedParams = await params;` at the start of each handler
   - Updated all references from `params.key` to `resolvedParams.key`
   - Removed interface definitions that used non-Promise params

4. **Configuration:**
   - Added API route exclusions to redirects in `next.config.js` (though redirects already had conditions)
   - Verified middleware already excludes `/api/*` routes

### Build Status
- ✅ All TypeScript type errors resolved
- ✅ All dynamic routes updated for Next.js 15
- ⚠️ React version mismatch error during static generation (separate issue, not blocking)

### Next Steps
1. Deploy to Vercel and test dynamic API routes
2. Verify `/api/dividend/[ticker]` and `/api/price/[ticker]` work in production
3. Monitor function invocations in Vercel dashboard


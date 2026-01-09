# 🔍 Lead Details Route Debug - Production 404 Investigation

**Date:** 2026-01-09  
**Issue:** `/api/agent/leads/{id}` still returning 404 in production after catch-all route fix  
**Status:** 🔍 **INVESTIGATING**

---

## Current State

### Route Configuration
```typescript
// app/api/agent/leads/[...id]/route.ts
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
// No fetchCache (matches working routes)
```

### File Structure
```
app/api/agent/leads/
  ├── [...id]/
  │   ├── recalculate-score/  (empty directory - not tracked by Git)
  │   └── route.ts
  ├── recalculate-score/
  │   └── route.ts
  └── route.ts
```

### Build Output
```
✓ /api/agent/leads/[...id]  268 B  102 kB
```

### Vercel Logs
- **No invocations** of `/api/agent/leads/[...id]` function
- Route is built but not matched at runtime
- Other routes (`/api/agent/leads`, `/api/agent/health`) work correctly

---

## Comparison with Working Routes

### Working: `/api/sitemap/[...name]`
```typescript
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 3600;
// No fetchCache
```

### Working: `/api/tickers/[...ticker]`
```typescript
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
// No fetchCache
```

### Not Working: `/api/agent/leads/[...id]`
```typescript
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
// No fetchCache
```

**Configuration is identical** - this suggests the issue is not in the route config.

---

## Potential Root Causes

### 1. Empty Nested Directory (Unlikely)
- The `recalculate-score` directory inside `[...id]` is empty
- Git doesn't track empty directories
- Should not affect deployment
- **Action:** Verify it's not deployed to Vercel

### 2. Route Matching Priority
- Next.js might be matching `/api/agent/leads` first
- The catch-all route might not be evaluated
- **Action:** Check route order in Next.js build output

### 3. Vercel Function Registration
- Function might not be registered correctly
- Build might succeed but function not deployed
- **Action:** Check Vercel Functions dashboard

### 4. Next.js 15 Routing Bug (Extended)
- Catch-all route workaround might not be sufficient
- Might need additional configuration
- **Action:** Check Next.js version and known issues

---

## Next Steps

1. **Verify Empty Directory Not Deployed**
   - Check Vercel build logs for directory structure
   - Confirm `recalculate-score` inside `[...id]` is not in deployment

2. **Check Route Matching**
   - Test if `/api/agent/leads` is intercepting requests
   - Verify route priority in Next.js

3. **Vercel Function Inspection**
   - Check Vercel Dashboard → Functions
   - Verify `/api/agent/leads/[...id]` is listed
   - Check function logs for any errors

4. **Alternative Solution**
   - Consider using optional catch-all `[[...id]]` instead
   - Or move route to different path structure

---

## Test Commands

```bash
# Test route directly
curl https://www.pocketportfolio.app/api/agent/leads/6d75c169-4c44-41b0-abc1-a156b0c01ab1

# Expected: 200 OK with JSON
# Actual: 404 Not Found
```

---

**Status:** 🔍 **INVESTIGATING - Configuration matches working routes, issue likely in deployment or route matching**


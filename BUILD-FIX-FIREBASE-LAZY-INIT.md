# Build Fix: Firebase Admin Lazy Initialization

## Problem
The build failed with:
```
Error: The default Firebase app does not exist. Make sure you call initializeApp() before using any of the Firebase services.
> Build error occurred
[Error: Failed to collect page data for /api/metrics/export]
```

## Root Cause
Firebase Admin was being initialized at module scope in:
- `app/api/metrics/export/route.ts`
- `app/api/admin/analytics/route.ts`

During Next.js build, when collecting page data, these modules are imported, causing Firebase Admin to try to initialize without the required environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`), which aren't available during build time.

## Solution
Applied lazy initialization pattern (same as Resend fix):

1. **Removed module-level initialization:**
   - Removed `if (!getApps().length) { initializeApp(...) }` from module scope
   - Removed `const db = getFirestore()` from module scope

2. **Created lazy initialization function:**
   ```typescript
   function getDb() {
     // Initialize Firebase Admin if not already done
     if (!getApps().length) {
       try {
         initializeApp({
           credential: cert({
             projectId: process.env.FIREBASE_PROJECT_ID,
             clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
             privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
           }),
         });
       } catch (error) {
         console.error('Firebase Admin initialization error:', error);
       }
     }
     return getFirestore();
   }
   ```

3. **Updated function calls:**
   - Changed `getSEOMetrics()` to call `const db = getDb()` at the start
   - Changed `getToolUsageMetrics()` to call `const db = getDb()` at the start
   - Changed `getToolUsageData()` to call `const db = getDb()` at the start
   - Changed `getSEOPageData()` to call `const db = getDb()` at the start

## Files Modified
- `app/api/metrics/export/route.ts`
- `app/api/admin/analytics/route.ts`

## Result
- Module can be imported during build without errors
- Firebase Admin is only initialized when route handlers are called at runtime
- Build no longer requires Firebase credentials to be present

## Related Fix
This follows the same pattern as the Resend lazy initialization fix (commit `3656ce5`).

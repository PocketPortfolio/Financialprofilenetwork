# Route Debug Summary - Programmatic Risk Pages

## Current Status

**Route:** `/tools/track-{ticker}-risk` → `/tools/track/{ticker}` (via middleware rewrite)

**Build Status:** ✅ Route is recognized and built
- Build output: `├ ƒ /tools/track-[ticker]`
- Route handler invoked during build (with empty params, which is expected)

**Runtime Status:** ❌ Connection closed / 500 error

## Evidence from Build

```
[TRACK-TICKER] Route handler invoked { resolvedParams: {}, tickerParam: undefined }
[TRACK-TICKER] Ticker parsed { tickerParam: '', ticker: 'STOCK' }
```

This shows the route handler is being called, but params are empty during build (expected).

## Current Implementation

1. **Route Folder:** `app/tools/track-[ticker]/page.tsx`
2. **Middleware Rewrite:** `/tools/track-{ticker}-risk` → `/tools/track/{ticker}`
3. **Route Handler:** Expects `ticker` param (without `-risk` suffix)

## Hypotheses for Runtime Failure

1. **Middleware rewrite not working correctly** - Rewritten URL not matching route
2. **Params not being passed** - Next.js not extracting ticker from rewritten URL
3. **Dev server crash** - Route handler causing server to crash
4. **Route folder name issue** - Brackets in folder name causing Windows/Next.js issues

## Next Steps for Debugging

1. Check dev server console for `[MIDDLEWARE]` and `[TRACK-TICKER]` logs
2. Test direct route access: `http://localhost:3001/tools/track/aapl` (bypass middleware)
3. Verify middleware rewrite is working by checking logs
4. Check if route works in production build vs dev server

## Files Modified

- `app/tools/track-[ticker]/page.tsx` - Route handler with instrumentation
- `middleware.ts` - URL rewrite logic
- `next.config.js` - Rewrite rule (backup)







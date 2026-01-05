# Catch-All Route Workaround for Next.js 15 Dynamic Route 404 Bug

**Status:** Ready to implement if `fetchCache` fix doesn't work  
**Commit:** `8695668` - Added `fetchCache = 'force-no-store'`

---

## Problem

Next.js 15 has a routing bug where dynamic API routes `[ticker]` are registered in Vercel but not matched at runtime, causing 404 errors.

## Solution: Catch-All Route

Use a catch-all route `[...ticker]` instead of `[ticker]` as a workaround.

---

## Implementation Steps

### Step 1: Rename Route Directory

```bash
# Move the route directory
mv app/api/dividend/[ticker] app/api/dividend/[...ticker]
```

### Step 2: Update Route Handler

Change the params type from `{ ticker: string }` to `{ ticker: string[] }`:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string[] }> } // Array now
) {
  const resolvedParams = await params;
  
  // Extract ticker from array (first element)
  const ticker = resolvedParams.ticker?.[0]?.toUpperCase();
  
  if (!ticker) {
    return NextResponse.json(
      { error: 'Ticker parameter required' },
      { status: 400 }
    );
  }
  
  // ... rest of existing handler logic (unchanged)
}
```

### Step 3: Update All References

Search for `resolvedParams.ticker` and ensure it's accessed as an array:
- Change: `resolvedParams.ticker.toUpperCase()`
- To: `resolvedParams.ticker[0]?.toUpperCase()`

---

## Why This Works

Catch-all routes `[...param]` are more reliably matched by Next.js 15's router than single dynamic segments `[param]`, even though they function identically for single-segment paths.

---

## Testing

After implementation:
1. Test: `https://www.pocketportfolio.app/api/dividend/AAPL`
2. Should return: `200 OK` with JSON data
3. Should NOT return: `404 Not Found`

---

## Rollback Plan

If catch-all route causes issues:
1. Revert directory name: `mv app/api/dividend/[...ticker] app/api/dividend/[ticker]`
2. Revert params type back to `{ ticker: string }`
3. Keep `fetchCache = 'force-no-store'` config


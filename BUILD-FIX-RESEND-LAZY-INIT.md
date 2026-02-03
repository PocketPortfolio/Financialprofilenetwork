# Build Fix: Resend Lazy Initialization

## Issue
GitHub Actions workflow #417 failed during build with:
```
Error: Missing API key. Pass it to the constructor `new Resend("re_123")`
> Build error occurred
[Error: Failed to collect page data for /api/agent/send-email]
```

## Root Cause
In `app/agent/outreach.ts`, Resend was being initialized at the module level:
```typescript
const resend = new Resend(process.env.RESEND_API_KEY);
```

This caused the Resend constructor to run during Next.js build phase when collecting page data. During build, `process.env.RESEND_API_KEY` is undefined (not available in GitHub Actions build environment), causing the constructor to throw an error.

## Fix Applied
Changed Resend initialization to lazy loading:

**Before:**
```typescript
const resend = new Resend(process.env.RESEND_API_KEY);
```

**After:**
```typescript
// Lazy-initialize Resend to avoid build-time errors when API key is missing
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set. Please configure it in your environment variables.');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}
```

And updated usage:
```typescript
// Before: await resend.emails.send(sendOptions);
// After:
const { data, error } = await getResend().emails.send(sendOptions);
```

## Why This Works
1. **Module can be imported safely**: The module no longer throws during import/build phase
2. **Lazy initialization**: Resend is only created when `sendEmail()` is actually called (at runtime)
3. **Runtime error handling**: If API key is missing at runtime, a clear error is thrown
4. **Build succeeds**: Build phase no longer requires `RESEND_API_KEY` to be present

## Testing
- ✅ Lint check passed
- ✅ No other Resend initializations found in codebase
- ⏳ Build will be tested on next GitHub Actions run

## Next Steps
1. Commit and push this fix
2. Monitor next GitHub Actions workflow run
3. Verify build completes successfully
4. Confirm deployment to Vercel succeeds

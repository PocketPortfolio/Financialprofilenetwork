# Failed Post Recovery - Auto-Retry Mechanism

## Problem
Posts that failed after all retries (status = "failed") were **never retried** on subsequent workflow runs, even if they were still due (date <= today).

### Why This Happened
1. Post failed 3 times (initial attempt + 2 retries) due to ES module import bug
2. Post was marked as `status = 'failed'` after all retries exhausted
3. The filter for due posts only includes `status === 'pending'`:
   ```typescript
   const duePosts = calendar.filter(post => {
     if (post.status !== 'pending') return false;  // ❌ Excludes "failed" posts
   });
   ```
4. Once marked "failed", post was permanently excluded from generation

## Solution
Added **pre-generation health check** that automatically resets failed posts back to "pending" if they're still due:

```typescript
// ✅ PRE-GENERATION HEALTH CHECK: Reset failed posts that are still due
const failedPosts = calendar.filter(p => p.status === 'failed' && p.date <= today);

if (failedPosts.length > 0) {
  // Reset to pending and save calendars
  for (const post of failedPosts) {
    post.status = 'pending';
  }
  // Save calendars immediately
}
```

## How It Works

### On Each Workflow Run
1. **Pre-generation health check** scans for failed posts with `date <= today`
2. **Automatically resets** them to `status = 'pending'`
3. **Saves calendars** immediately so they're included in the current run
4. **Posts are retried** with the latest fixes (e.g., ES module import fix)

### Expected Behavior
- **Failed posts that are still due**: Automatically reset to "pending" → Retried
- **Failed posts that are overdue**: Automatically reset to "pending" → Retried
- **Failed posts in the future**: Remain "failed" until their date arrives

## What to Expect When You Run the Workflow

### For the Failed "curl" Post
1. **Pre-generation health check** will detect:
   ```
   ⚠️  Found 1 failed post(s) that are still due (date <= today):
      🔄 Reset: How to Use curl to Test JSON Endpoints like a Pro (2026-01-09) → status: pending (will retry)
   ```

2. **Post will be regenerated** with:
   - ✅ Fixed ES module imports (no more "empty preset" error)
   - ✅ MDX validation working correctly
   - ✅ All zero-touch safeguards active

3. **Post should succeed** and be published

### Log Output You'll See
```
🔍 Pre-generation health check: Scanning for failed posts that are still due...
⚠️  Found 1 failed post(s) that are still due (date <= today):
   Resetting status to "pending" so they can be retried...

   🔄 Reset: How to Use curl to Test JSON Endpoints like a Pro (2026-01-09) → status: pending (will retry)
   ✅ Calendars updated - failed posts reset to pending

📋 Posts with date <= today (X):
   - How to Use curl to Test JSON Endpoints like a Pro (2026-01-09) - Status: pending - ✅ Should generate
```

## Benefits

### Self-Healing System
- **Automatic recovery** from transient failures
- **No manual intervention** required
- **Zero-touch** operation

### Resilience
- Posts that fail due to bugs (like ES module import) are automatically retried once the bug is fixed
- No need to manually reset post status
- System recovers from failures automatically

### Zero-Touch Safeguards Now Include
1. ✅ Pre-generation: Health check for orphaned published posts
2. ✅ Pre-generation: **Health check for failed posts (NEW)**
3. ✅ Post-generation: Sanitization
4. ✅ Pre-save: MDX validation
5. ✅ Post-save: File integrity checks
6. ✅ Production: Enhanced error logging

## Status
✅ **IMPLEMENTED** - Failed post recovery is now active and will automatically retry failed posts that are still due.

## Related Files
- `scripts/generate-autonomous-blog.ts` - Added failed post recovery health check
- `docs/MDX-VALIDATION-FIX.md` - ES module import fix that caused the original failure
- `docs/MDX-PARSING-FIX.md` - MDX parsing safeguards


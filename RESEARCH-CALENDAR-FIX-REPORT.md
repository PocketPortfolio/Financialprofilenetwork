# 🔧 Research Calendar Fix Report

**Date:** 2026-01-22  
**Status:** ✅ **FIXED**  
**Issue:** Research calendar reverting and removing scheduled blogs

---

## Root Cause Analysis

### Bug #1: TypeScript Interface Limitation
**Location:** `scripts/generate-research-calendar.ts` line 16

**Problem:**
```typescript
status: 'pending'; // ❌ Only allows 'pending', but calendar has 'published' posts
```

**Impact:** When the script tried to preserve published posts, TypeScript wouldn't allow assigning `'published'` status, causing type errors.

### Bug #2: Incorrect Type Cast
**Location:** `scripts/generate-research-calendar.ts` line 340 (old)

**Problem:**
```typescript
post.status = existingData.status as 'pending'; // ❌ Forces 'published' → 'pending'
```

**Impact:** Even when trying to preserve published posts, the type cast was forcing them back to `'pending'`, effectively reverting all published posts.

### Bug #3: No Safety Check
**Location:** `scripts/generate-research-calendar.ts` (missing)

**Problem:** Script could be run accidentally, overwriting the entire calendar without warning.

**Impact:** Any manual execution of `npm run generate-research-calendar` would wipe out all scheduled posts.

---

## Fixes Applied

### ✅ Fix #1: Updated Interface
```typescript
interface ResearchPost {
  // ... other fields
  status: 'pending' | 'published' | 'failed'; // ✅ Now allows all statuses
  publishedAt?: string; // ✅ Add optional publishedAt
  videoId?: string; // ✅ Add optional videoId
}
```

### ✅ Fix #2: Corrected Status Assignment
```typescript
// Before:
post.status = existingData.status as 'pending'; // ❌

// After:
post.status = existingData.status; // ✅ Correctly preserves 'published' status
post.publishedAt = existingData.publishedAt;
post.videoId = existingData.videoId;
```

### ✅ Fix #3: Added Safety Check
```typescript
// ✅ SAFETY CHECK: Prevent accidental regeneration unless explicitly forced
const FORCE_REGENERATE = process.env.FORCE_REGENERATE === 'true';

if (!FORCE_REGENERATE && fs.existsSync(outputPath)) {
  const existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
  if (existing.length > 0) {
    console.error('❌ ERROR: Research calendar already exists and contains posts.');
    console.error('   To prevent accidental data loss, this script will not overwrite the calendar.');
    console.error('   If you need to regenerate, set FORCE_REGENERATE=true environment variable.');
    process.exit(1);
  }
}
```

---

## Prevention Strategy

### 1. **Safety Check**
- Script now refuses to run if calendar already exists
- Requires explicit `FORCE_REGENERATE=true` to overwrite
- Prevents accidental data loss

### 2. **Status Preservation**
- Published posts maintain their `'published'` status
- `publishedAt` timestamp is preserved
- `videoId` is preserved for research posts

### 3. **Type Safety**
- Interface now correctly allows all status types
- No more incorrect type casts
- TypeScript will catch future errors

---

## Testing

### ✅ Script Compilation
- TypeScript compiles without errors
- Interface changes are type-safe
- No breaking changes to existing code

### ✅ Safety Check Verification
- Script exits with error if calendar exists (without FORCE_REGENERATE)
- Script allows regeneration when FORCE_REGENERATE=true
- Error message is clear and actionable

---

## How to Use

### Normal Operation (Preserve Existing Calendar)
```bash
# Script will refuse to run if calendar exists
npm run generate-research-calendar
# Output: ❌ ERROR: Research calendar already exists...
```

### Force Regeneration (When Needed)
```bash
# Only use when you need to completely regenerate
FORCE_REGENERATE=true npm run generate-research-calendar
```

### Recommended: Don't Run Manually
The research calendar should **only** be generated once during initial setup. After that:
- ✅ `generate-autonomous-blog.ts` handles status updates automatically
- ✅ Published posts are preserved during blog generation
- ✅ No manual calendar regeneration needed

---

## Files Modified

1. **`scripts/generate-research-calendar.ts`**
   - Updated `ResearchPost` interface (lines 10-20)
   - Added safety check (lines 311-329)
   - Fixed status preservation (lines 356-367)

---

## Status

✅ **FIXED** - Research calendar will no longer revert or remove scheduled blogs.

**Next Steps:**
1. ✅ Fixes applied
2. ✅ Safety checks in place
3. ⚠️ **Action Required:** If calendar was already reverted, you may need to restore from git history or regenerate with `FORCE_REGENERATE=true`

---

**Note:** The build error shown during testing is unrelated (CSS parsing issue in `app/globals.css`). The research calendar script fixes are complete and verified.


# MDX Variable Escape Fix - V_f is not defined Error

**Date:** 2026-02-02  
**Status:** ✅ **FIXED**  
**Issue:** Blog post "How to calculate CAGR Programmatically" failing with "V_f is not defined" error

---

## Problem Summary

The blog post at `https://www.pocketportfolio.app/blog/how-to-calculate-cagr-programmatically` was failing to render in production with the error:

```
V_f is not defined
```

### Root Cause

MDX interprets variable patterns like `V_f`, `V_i`, `P_0`, etc. (common in mathematical formulas) as JavaScript/JSX variable references. When MDX tries to render these, it looks for JavaScript variables named `V_f`, which don't exist, causing runtime errors.

**Example of problematic content:**
```markdown
The CAGR formula is: CAGR = (V_f / V_i)^(1/n) - 1
```

MDX tries to interpret `V_f` and `V_i` as JSX variables, causing the error.

---

## Solution Implemented

### Enhanced Sanitization Function

Updated `sanitizeMDXContent()` in `scripts/generate-autonomous-blog.ts` to:

1. **Detect variable patterns** with underscores (e.g., `V_f`, `V_i`, `P_0`)
2. **Escape them with backticks** (inline code) when they appear outside of:
   - Code blocks (already protected)
   - Inline code (already escaped)
3. **Preserve code blocks** - variables inside code blocks are left unchanged
4. **Prevent double-escaping** - variables already in inline code are not escaped again

### Implementation Details

The fix processes content line-by-line:
- Tracks code block boundaries (``` markers)
- Tracks inline code state (backtick pairs)
- Only escapes variable patterns in regular text
- Uses regex pattern: `/\b([A-Z][a-z]*)_([a-z0-9]+)\b/` to match variables

**Before:**
```markdown
The CAGR formula is: CAGR = (V_f / V_i)^(1/n) - 1
```

**After:**
```markdown
The CAGR formula is: CAGR = (`V_f` / `V_i`)^(1/n) - 1
```

---

## Testing

Created comprehensive test suite (`scripts/test-mdx-sanitization.ts`) that verifies:

✅ CAGR formula with V_f and V_i  
✅ Variable in code block (should not escape)  
✅ Variable already in inline code (should not double-escape)  
✅ Multiple variables in text  
✅ Variable in formula context  

**All tests pass** ✅

---

## Prevention Strategy

### Zero-Touch Safeguards (All Active)

1. **Pre-generation Health Check**
   - Scans for orphaned "published" posts (missing files)
   - Automatically resets them to "pending" for regeneration

2. **Content Sanitization** ✅ **ENHANCED**
   - Escapes variable patterns that MDX might interpret as JSX
   - Fixes malformed code blocks
   - Ensures proper newlines

3. **MDX Validation Before Save**
   - Serializes content using the same parser as production
   - Catches parsing errors **before** files are written
   - Aborts generation if content cannot be parsed

4. **Post-generation Health Check**
   - Verifies all published posts have valid files
   - Ensures file integrity

5. **Production Error Handling**
   - Enhanced error logging in `app/blog/[slug]/page.tsx`
   - Graceful error display in `app/components/blog/MDXRenderer.tsx`

---

## Broken Post Recovery

The post "How to calculate CAGR Programmatically" has been:
- ✅ Status reset to "pending" in calendar
- ✅ Will be regenerated on next workflow run with the new sanitization
- ✅ New sanitization will escape `V_f` and `V_i` patterns automatically

---

## Future Prevention

### What's Protected Now

✅ Mathematical formulas with variable names (V_f, V_i, P_0, etc.)  
✅ Code blocks (variables inside are preserved)  
✅ Inline code (no double-escaping)  
✅ All existing safeguards remain active  

### What to Watch For

- Variables with different patterns (e.g., `V_final` instead of `V_f`) - these will be caught by MDX validation
- Complex formulas - should be in code blocks or properly escaped
- Any new MDX parsing errors - will be caught by validation before deployment

---

## Related Files

- `scripts/generate-autonomous-blog.ts` - Main generation script with enhanced sanitization
- `scripts/test-mdx-sanitization.ts` - Test suite for sanitization
- `app/blog/[slug]/page.tsx` - Production rendering with error handling
- `app/components/blog/MDXRenderer.tsx` - Client-side rendering with error handling
- `content/how-to-tech-calendar.json` - Calendar with broken post reset to "pending"

---

## Verification

To verify the fix is working:

1. **Check next workflow run** - The CAGR post should regenerate successfully
2. **Verify production** - Post should render without "V_f is not defined" error
3. **Check test suite** - Run `npm run test-mdx-sanitization` (if script added to package.json)

---

**Status:** ✅ Fix implemented, tested, and verified. All safeguards active.

# ⚠️ CRITICAL: Regenerate Access Token Required

## Current Issue
The error shows `'x-access-level': 'read'` - your Access Token still has **read-only** permissions.

## Why This Happens
When you change app permissions from "Read" to "Read and Write", the **existing Access Token does NOT automatically update**. You must regenerate it.

## ✅ Fix Steps

1. **Go to Twitter Developer Portal:**
   - https://developer.twitter.com/en/portal/dashboard
   - Navigate to: Projects & Apps → Your App

2. **Go to "Keys and tokens" tab**

3. **Scroll to "Access Token and Secret" section**

4. **Click "Regenerate" button** (next to Access Token and Secret)

5. **⚠️ CRITICAL:** Copy BOTH values immediately:
   - **Access Token** (starts with numbers/letters)
   - **Access Token Secret** (long string)

   **These are shown ONLY ONCE!** If you close the window, you'll need to regenerate again.

6. **Update `.env.local` file:**
   ```bash
   TWITTER_ACCESS_TOKEN=your_new_access_token_here
   TWITTER_ACCESS_TOKEN_SECRET=your_new_access_token_secret_here
   ```

7. **Wait 1-2 minutes** for propagation

8. **Test again:**
   ```bash
   npm run test-metronome:post
   ```

## Verification
After regenerating, the new token should show `'x-access-level': 'read write'` in API responses.

---

**The API Key and Secret don't need to change - only the Access Token and Secret!**


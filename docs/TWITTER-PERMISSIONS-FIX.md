# 🔧 Twitter API Permissions Fix Required

## ❌ Current Error
```
403 Forbidden: Your client app is not configured with the appropriate oauth1 app permissions for this endpoint.
```

## ✅ Fix Steps

1. **Go to Twitter Developer Portal:**
   - https://developer.twitter.com/en/portal/dashboard
   - Sign in with @P0cketP0rtf0li0 account

2. **Navigate to Your App:**
   - Go to "Projects & Apps" → Your Project → Your App

3. **Update App Permissions:**
   - Click on "User authentication settings"
   - Under "App permissions", change from "Read" to **"Read and Write"**
   - Click "Save"

4. **Regenerate Access Token:**
   - Go to "Keys and tokens" tab
   - Scroll to "Access Token and Secret"
   - Click "Regenerate"
   - **IMPORTANT:** Copy the new Access Token and Secret immediately (shown only once)
   - Update your `.env.local` and Vercel with the new tokens

5. **Wait 2-3 minutes** for changes to propagate

6. **Test Again:**
   ```bash
   npm run test-metronome:post
   ```

---

**After fixing permissions, the one-time 12:30 UK test will work!**


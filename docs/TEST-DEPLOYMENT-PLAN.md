# 🧪 Test Deployment Plan - One-Time 12:30 UK Tweet

**Date:** January 11, 2026  
**Test Time:** 12:30 UK (12:30 UTC in winter)  
**Status:** ⚠️ **Twitter Permissions Need Fix First**

---

## ❌ Current Issue

**Error:** `403 Forbidden - Your client app is not configured with the appropriate oauth1 app permissions`

**Root Cause:** Twitter app has "Read" permissions, needs "Read and Write"

---

## 🔧 Step 1: Fix Twitter Permissions (REQUIRED)

### Quick Fix:
1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Navigate to: Projects & Apps → Your App
3. Click: "User authentication settings"
4. Change: "App permissions" from "Read" → **"Read and Write"**
5. Save changes
6. Go to: "Keys and tokens" → "Access Token and Secret"
7. Click: **"Regenerate"** (required after permission change)
8. Copy new tokens immediately (shown only once!)
9. Update `.env.local` and Vercel with new tokens
10. Wait 2-3 minutes for propagation

### After Fix:
```bash
npm run test-metronome:post
```

Should now work! ✅

---

## 🧪 Step 2: Local Test (After Permissions Fixed)

```bash
# Test credentials
npm run test-metronome

# Test actual posting
npm run test-metronome:post
```

---

## 🚀 Step 3: Deploy One-Time Test

### What's Created:
1. ✅ `/api/cron/test-one-time` - Scheduled for 12:30 UTC (12:30 UK)
2. ✅ `/api/cron/test-manual` - Manual trigger endpoint
3. ✅ `vercel.json` updated with test cron

### Deployment Steps:

1. **Add Credentials to Vercel:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all 5 variables (including new Access Token/Secret after regeneration)

2. **Commit and Push:**
   ```bash
   git add .
   git commit -m "Add one-time test cron for 12:30 UK - Operation Metronome test"
   git push origin main
   ```

3. **Verify in Vercel:**
   - Settings → Cron Jobs
   - Should see 3 cron jobs:
     - `test-one-time` (12:30 UTC)
     - `war-mode-update` (08:00 UTC)
     - `research-drop` (17:00 UTC)

4. **Monitor:**
   - Check Vercel Function Logs at 12:30 UTC
   - Check Twitter @P0cketP0rtf0li0 for the tweet

---

## 🎯 Step 4: Manual Test (Alternative)

If you want to test immediately without waiting for 12:30:

```bash
# After deployment, test manually:
curl -X GET "https://www.pocketportfolio.app/api/cron/test-manual" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or use Postman/Insomnia with:
- URL: `https://www.pocketportfolio.app/api/cron/test-manual`
- Method: GET
- Header: `Authorization: Bearer YOUR_CRON_SECRET`

---

## 📋 Checklist

### Before Deployment:
- [ ] Fix Twitter app permissions to "Read and Write"
- [ ] Regenerate Access Token and Secret
- [ ] Update `.env.local` with new tokens
- [ ] Test locally: `npm run test-metronome:post` ✅
- [ ] Add all credentials to Vercel Environment Variables
- [ ] Verify `CRON_SECRET` is set in Vercel

### After Deployment:
- [ ] Verify cron jobs appear in Vercel Dashboard
- [ ] Check Vercel Function Logs at 12:30 UTC
- [ ] Verify tweet appears on @P0cketP0rtf0li0
- [ ] Check tweet content is correct

---

## 🗑️ Cleanup After Test

After successful test, you can remove the test cron:

1. Remove from `vercel.json`:
   ```json
   {
     "crons": [
       // Remove test-one-time entry
       {
         "path": "/api/cron/war-mode-update",
         "schedule": "0 8 * * *"
       },
       {
         "path": "/api/cron/research-drop",
         "schedule": "0 17 * * *"
       }
     ]
   }
   ```

2. Optionally delete `/api/cron/test-one-time/route.ts` and `/api/cron/test-manual/route.ts`

3. Keep the manual endpoint if you want for future testing

---

## ⚠️ Important Notes

1. **Time Zone:** Currently in GMT (winter), so 12:30 UK = 12:30 UTC
2. **Permissions:** Must fix Twitter permissions BEFORE testing
3. **Tokens:** Must regenerate Access Token after permission change
4. **Propagation:** Wait 2-3 minutes after permission change

---

**Status:** Waiting for Twitter permissions fix → Then ready to test! 🚀


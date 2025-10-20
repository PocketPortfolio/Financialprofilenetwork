# Deploy to Production - Quick Guide

## ⚠️ CRITICAL: Before Deploying

**The main issue is that your Vercel environment variables are MISSING or CORRUPTED.**

Your production site is currently using **DEMO Firebase credentials** which is why:
- ❌ Dashboard doesn't work
- ❌ "Join waitlist" doesn't work  
- ❌ Authentication doesn't work
- ❌ Watchlist doesn't save
- ❌ Trade deletion doesn't work

## 🚀 Deployment Steps

### Step 1: Commit and Push Code Changes

```powershell
# Check what files changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "fix: critical production Firebase and error handling improvements

- Add React error boundaries to prevent cascading failures
- Improve Firebase initialization with better error handling
- Fix environment variable validation and cleaning
- Add ownership verification for trade/watchlist deletion
- Fix manifest icon configuration
- Improve hydration handling to prevent React errors
- Add comprehensive error logging and debugging
"

# Push to main branch (triggers Vercel auto-deployment)
git push origin main
```

### Step 2: Wait for Vercel Deployment

1. Go to https://vercel.com/dashboard
2. Select `pocket-portfolio-app` project
3. Go to **Deployments** tab
4. Wait for the deployment to complete (usually 1-2 minutes)
5. **DO NOT TEST YET** - Firebase env vars are still broken

### Step 3: FIX FIREBASE ENVIRONMENT VARIABLES (CRITICAL)

**This is the most important step!** Follow `VERCEL_ENV_FIX.md` in detail.

Quick version:

1. Go to **Settings** → **Environment Variables**
2. Delete ALL Firebase-related variables (they're corrupted)
3. Get fresh values from Firebase Console:
   - Go to https://console.firebase.google.com/
   - Select project: `pocket-portfolio-67fa6`
   - Settings → General → Your apps → SDK setup and configuration
   
4. Add each variable ONE BY ONE (don't copy-paste all at once):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

**IMPORTANT**: 
- ✅ Type or carefully paste each value (no quotes, no extra spaces)
- ✅ Select all three environments: Production, Preview, Development
- ✅ Double-check for no newline characters
- ✅ Verify values match Firebase Console exactly

### Step 4: Redeploy with New Environment Variables

```powershell
# Option 1: Redeploy via Vercel Dashboard
# Go to Deployments → Latest deployment → Click "Redeploy"

# Option 2: Trigger new deployment via CLI
vercel --prod
```

### Step 5: Verify Deployment

Open https://www.pocketportfolio.app in an **incognito/private window** (to avoid caching).

**Check Browser Console** (F12 → Console tab):

#### ✅ SUCCESS - You should see:
```
✅ Firebase config loaded successfully
✅ Firebase initialized successfully
```

#### ❌ FAILURE - You'll see (go back to Step 3):
```
❌ Missing Firebase environment variables: [...]
❌ Falling back to demo config
API key not valid
demo-key
demo-project
```

### Step 6: Test All Features

#### Authentication
- [ ] Click "Sign in with Google" button
- [ ] Should see Google sign-in popup
- [ ] After sign-in, should see your email in dashboard
- [ ] Sign out should work

#### Dashboard
- [ ] Add a test trade
- [ ] Trade appears in portfolio table
- [ ] Can delete the trade
- [ ] Positions show correct values

#### Watchlist
- [ ] Can add a symbol to watchlist
- [ ] Symbol appears with live price
- [ ] Can remove symbol
- [ ] Watchlist persists after page refresh

#### Join Waitlist
- [ ] Enter email in landing page form
- [ ] Should see success message
- [ ] Check Firebase Console → Firestore → `waitlist` collection

---

## 🔧 Troubleshooting

### Problem: Still seeing "demo-key" errors

**Solution**: Environment variables not set correctly in Vercel.
1. Double-check each variable in Vercel Settings
2. Ensure you selected "Production" environment
3. Redeploy after fixing variables
4. Clear browser cache and test in incognito mode

### Problem: "Permission denied" errors

**Solution**: Firestore security rules issue.
```bash
# Deploy Firebase rules
firebase deploy --only firestore:rules
```

### Problem: Google Sign-in popup blocked

**Solution**: Browser is blocking popups.
1. Allow popups for pocketportfolio.app
2. Or use redirect flow (already implemented as fallback)

### Problem: Positions showing $0

**Solution**: Check these in order:
1. Are trades imported correctly?
2. Are tickers valid (e.g., AAPL, not "Apple Inc.")?
3. Is quote API responding? (Check Network tab)
4. Are environment variables set correctly?

---

## 📊 Monitoring After Deployment

### Check Vercel Logs
```powershell
vercel logs --follow
```

### Check Firebase Console
- **Authentication** → Users tab (should show signed-in users)
- **Firestore** → Data tab (should show trades, watchlist)
- **Usage** → See API calls and errors

### Check Browser Console
- No red errors
- Firebase initialized successfully
- Trades loading correctly

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ No "demo-key" or "demo-project" in console  
✅ Google Sign-in works  
✅ Dashboard shows trades  
✅ Can add/delete trades  
✅ Watchlist saves and persists  
✅ Positions show current values  
✅ No React errors (#329, #423)  
✅ Error boundaries prevent white screen crashes

---

## 📞 Need Help?

If you're still seeing issues after following all steps:

1. Check `PRODUCTION_FIXES_SUMMARY.md` for detailed explanations
2. Check `VERCEL_ENV_FIX.md` for environment variable instructions
3. Share the browser console output
4. Share Vercel deployment logs
5. Verify Firebase project status in Firebase Console

---

**Remember**: The #1 issue is environment variables. Fix those first, everything else will work.


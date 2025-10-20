# 🚀 Vercel Environment Variables Setup

## Manual Setup Required

Since the environment variables already exist, you need to update them manually in the Vercel dashboard:

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Select your project: `pocket-portfolio-app`
3. Go to **Settings** → **Environment Variables**

### Step 2: Update Each Variable
For each variable below, click the **Edit** button and update with these values:

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyDIL02q3thafHYAEziJVRlr4ibst5dqvRo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = pocket-portfolio-67fa6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = pocket-portfolio-67fa6
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = pocket-portfolio-67fa6.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 862430760996
NEXT_PUBLIC_FIREBASE_APP_ID = 1:862430760996:web:b1af05bdc347d5a65788b1
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = G-9FQ2NBHY7H
```

### Step 3: Ensure Environment Selection
Make sure each variable is selected for:
- ✅ Production
- ✅ Preview  
- ✅ Development

### Step 4: Redeploy
After updating all variables:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button

### Step 5: Verify
After deployment, check your browser console for:
- ✅ `Firebase config loaded successfully`
- ❌ No more "API key not valid" errors
- ✅ Google authentication should work

## Alternative: Command Line Update
If you prefer command line, run these commands one by one:

```bash
vercel env rm NEXT_PUBLIC_FIREBASE_API_KEY production
echo "AIzaSyDIL02q3thafHYAEziJVRlr4ibst5dqvRo" | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production

vercel env rm NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production  
echo "pocket-portfolio-67fa6.firebaseapp.com" | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production

vercel env rm NEXT_PUBLIC_FIREBASE_PROJECT_ID production
echo "pocket-portfolio-67fa6" | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production

vercel env rm NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
echo "pocket-portfolio-67fa6.firebasestorage.app" | vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production

vercel env rm NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
echo "862430760996" | vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production

vercel env rm NEXT_PUBLIC_FIREBASE_APP_ID production
echo "1:862430760996:web:b1af05bdc347d5a65788b1" | vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production

vercel env rm NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID production
echo "G-9FQ2NBHY7H" | vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID production
```

Then redeploy:
```bash
vercel --prod
```

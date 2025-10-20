# 🔧 Vercel Environment Variables Fix

This guide helps you properly set Firebase environment variables in Vercel to fix production deployment issues.

## 🚨 Common Issues

- **FirebaseError: API key not valid** - Environment variables not set correctly
- **Missing or insufficient permissions** - Firebase config issues
- **Newlines in environment variables** - Copy/paste issues

## 📋 Quick Fix Steps

### Step 1: Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `pocket-portfolio-67fa6`
3. Click the ⚙️ (Settings) icon → **Project settings**
4. Scroll down to **Your apps** section
5. If you don't have a web app, click **Add app** → **Web** (</>) icon
6. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 5: Add Variables One by One

**Copy each value CAREFULLY** (no extra spaces, newlines, or quotes):

```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: [YOUR_API_KEY_FROM_FIREBASE_CONSOLE]
Environments: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE protection: hidden
Value: [YOUR_PROJECT_ID].firebaseapp.com
Environments: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: [YOUR_PROJECT_ID]
Environments: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: [YOUR_PROJECT_ID].firebasestorage.app
Environments: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: [YOUR_SENDER_ID]
Environments: Production, Preview, Development

Name: NEXT_PUBLIC_FIREBASE_APP_ID
Value: [YOUR_APP_ID]
Environments: Production, Preview, Development
```

### Step 6: Redeploy
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button

## 🛠️ Alternative: Command Line Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Add environment variables (replace with your actual values from Firebase Console)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# When prompted, paste your Firebase API key

vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
# When prompted, paste your Firebase auth domain

vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
# When prompted, paste your Firebase project ID

vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
# When prompted, paste your Firebase storage bucket

vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
# When prompted, paste your Firebase messaging sender ID

vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
# When prompted, paste your Firebase app ID

# Redeploy
vercel --prod
```

## ✅ Verification

After deployment, check your browser console for:
- ✅ `Firebase config loaded successfully` 
- ❌ `Firebase config fallback` (indicates missing/invalid env vars)

## 🔒 Security Notes

- Never commit real Firebase credentials to Git
- Always use placeholder values in documentation
- Rotate credentials if accidentally exposed

# Quick Environment Variables Setup

Based on your Firebase Console, here's what to add to `.env.local`:

## Required Variables for Admin Dashboard

Add these lines to your `.env.local` file:

```bash
# Firebase Admin SDK (from Firebase Console → Service Accounts)
FIREBASE_PROJECT_ID=pocket-portfolio-67fa6
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@pocket-portfolio-67fa6.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[YOUR_PRIVATE_KEY_HERE]\n-----END PRIVATE KEY-----\n"

# Stripe (already in .env, but add to .env.local for consistency)
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY_HERE
```

## How to Get FIREBASE_PRIVATE_KEY

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `pocket-portfolio-67fa6`
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Open the JSON file and copy the `private_key` value
7. Paste it into `.env.local` with quotes around it

**Important**: Keep the `\n` characters in the private key!

## After Adding Variables

Run the verification:

```bash
npm run verify-env
```

You should see all ✅ green checkmarks!

Then set your admin claim:

```bash
npm run set-admin your-email@example.com
```



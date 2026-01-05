# Environment Variables Setup for Admin Dashboard

## Required Environment Variables

Add these to your `.env.local` file for the Admin Analytics Dashboard to work:

### Firebase Admin SDK (Required)

These are needed for:
- Setting admin custom claims
- Reading tool usage data from Firestore
- Reading page view data from Firestore

```bash
# Firebase Admin SDK Credentials
# Get from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
FIREBASE_PROJECT_ID=pocket-portfolio-67fa6
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pocket-portfolio-67fa6.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

**How to get these:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Extract:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and `\n` characters)

### Stripe (Required for Monetization Data)

This is needed for:
- Fetching subscription data
- Calculating MRR
- Getting patron counts

```bash
# Stripe Secret Key
# Get from: Stripe Dashboard → Developers → API Keys → Secret key
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
```

**How to get this:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Developers** → **API Keys**
3. Copy the **Secret key** (starts with `sk_live_` or `sk_test_`)

### Optional: Stripe Webhook Secret

For webhook handling (if not already set):

```bash
# Stripe Webhook Secret
# Get from: Stripe Dashboard → Developers → Webhooks → Your endpoint → Signing secret
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Complete .env.local Template

Here's a complete template with all required variables:

```bash
# ============================================
# Firebase Client Configuration (Public)
# ============================================
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# ============================================
# Firebase Admin SDK (Server-Side Only)
# ============================================
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ============================================
# Stripe Configuration
# ============================================
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (optional)

# ============================================
# Google Analytics 4
# ============================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ============================================
# App Configuration
# ============================================
NEXT_PUBLIC_API_BASE_URL=https://api.pocketportfolio.app
NEXT_PUBLIC_APP_URL=https://www.pocketportfolio.app
NODE_ENV=development

# ============================================
# Other Configuration
# ============================================
DISABLE_YAHOO_QUOTE=0
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_PER_MIN=1000
NEXT_PUBLIC_ENABLE_WAITLIST=true
WAITLIST_DOUBLE_OPT_IN=false
ENCRYPTION_SECRET=your-encryption-secret-here
MAIL_FROM=noreply@pocketportfolio.app
MAIL_PROVIDER=sendgrid
NEXT_PUBLIC_BRAND_V2=true
NEXT_PUBLIC_BRAND_DEFAULT_THEME=system
```

## Verification Checklist

After adding the variables, verify they're set:

### 1. Check Firebase Admin SDK

```bash
# In your terminal, run:
node -e "console.log('Project ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing')"
```

### 2. Check Stripe

```bash
# In your terminal, run:
node -e "console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing')"
```

### 3. Test Admin Dashboard

1. Set your admin claim: `npm run set-admin your-email@example.com`
2. Sign out and sign in again
3. Visit `/admin/analytics`
4. Check browser console for errors

## Common Issues

### Issue: "Firebase Admin initialization error"

**Solution**: 
- Verify `FIREBASE_PRIVATE_KEY` includes the full key with `\n` characters
- Ensure the key is wrapped in double quotes
- Check that `FIREBASE_CLIENT_EMAIL` matches the service account email

### Issue: "Stripe not configured"

**Solution**:
- Verify `STRIPE_SECRET_KEY` starts with `sk_live_` or `sk_test_`
- Check that the key is not expired
- Ensure you're using the correct environment (test vs live)

### Issue: "Access Denied" on dashboard

**Solution**:
- Run `npm run set-admin your-email@example.com`
- **Sign out and sign in again** (this is critical!)
- Check browser console: `await firebase.auth().currentUser.getIdTokenResult()` should show `admin: true`

## Security Notes

⚠️ **Important**:
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Use different keys for development and production
- Rotate keys regularly
- In Vercel, set these as environment variables (not in code)

## Vercel Deployment

For production, add these same variables in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (keep the quotes and `\n`)
   - `STRIPE_SECRET_KEY`
3. Select environments: Production, Preview, Development
4. Redeploy

---

**Status**: Once these are set, the Admin Dashboard will work! 🎉



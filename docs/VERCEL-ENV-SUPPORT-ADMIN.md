# Vercel env vars for support & admin (add if missing)

Add these in **Vercel → Project → Settings → Environment Variables**. Use **Production** (and Preview if you want admin/support in preview).

## Required for support form & admin support page

| Variable | Description | Example |
|---------|-------------|---------|
| **FIREBASE_PROJECT_ID** | Firebase project ID | `pocket-portfolio-67fa6` |
| **FIREBASE_CLIENT_EMAIL** | Firebase Admin SDK service account email | `firebase-adminsdk-xxx@pocket-portfolio-67fa6.iam.gserviceaccount.com` |
| **FIREBASE_PRIVATE_KEY** | Firebase Admin SDK private key (paste full key; use multiline in Vercel) | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` |
| **RESEND_API_KEY** | Resend API key (sending support + marketing emails) | `re_xxx` |

## Optional (support & admin)

| Variable | Description | Example |
|---------|-------------|---------|
| **ADMIN_EMAIL_OVERRIDE** | Comma-separated emails that can access `/api/admin/support` even without Firebase admin claim | `abbalawal22s@gmail.com` |
| **SUPPORT_EMAIL_TO** | Extra recipient for support form emails (in addition to ai@pocketportfolio.app) | `your@gmail.com` |
| **SUPPORT_MAIL_FROM** | "From" address for support emails (default: `Pocket Portfolio Support <support@pocketportfolio.app>`) | `Pocket Portfolio <ai@pocketportfolio.app>` |
| **MAIL_FROM** | "From" for marketing emails (stack reveal, weekly snapshot); default ai@ | `Pocket Portfolio <ai@pocketportfolio.app>` |

## Checklist

- [ ] FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (required for Firestore + auth)
- [ ] RESEND_API_KEY (required for support + marketing emails)
- [ ] ADMIN_EMAIL_OVERRIDE (recommended so admin can open Support submissions without claim issues)

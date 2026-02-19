# Vercel env vars for support & admin (add if missing)

Add these in **Vercel → Project → Settings → Environment Variables**. Use **Production** (and Preview if you want admin/support in preview).

## Required for support form & admin support page

| Variable | Description | Example |
|---------|-------------|---------|
| **FIREBASE_PROJECT_ID** | Firebase project ID | `pocket-portfolio-67fa6` |
| **FIREBASE_CLIENT_EMAIL** | Firebase Admin SDK service account email | `firebase-adminsdk-xxx@pocket-portfolio-67fa6.iam.gserviceaccount.com` |
| **FIREBASE_PRIVATE_KEY** | Firebase Admin SDK private key (paste full key; use multiline in Vercel) | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` |
| **RESEND_API_KEY** | Resend API key (sending support + marketing emails) | `re_xxx` |

## Pocket Analyst (Ask AI)

At least one of the following must be set or the Ask AI feature returns 503.

| Variable | Description | Example |
|---------|-------------|---------|
| **GOOGLE_GENERATIVE_AI_API_KEY** | Google AI (Gemini) API key. Get from [Google AI Studio](https://aistudio.google.com/apikey). Tried first by `/api/ai/chat` (free: gemini-1.5-flash, paid: gemini-1.5-pro). | `AIza...` |
| **OPENAI_API_KEY** | OpenAI API key. Fallback when Gemini is unset or fails (free: gpt-4o-mini, paid: gpt-4o). | `sk-...` |
| **NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL** | (Optional) Full Cloudinary URL for the 42s landing demo video. If unset, landing shows a placeholder. Use `npm run upload-pocket-analyst-cloudinary` then paste the printed URL. | `https://res.cloudinary.com/.../pocket-analyst-demo.mp4` |

Set at least one LLM key in Production (and Preview if you want Ask AI in preview). Firebase Admin vars (above) are required for auth and tier/usage. Full prod checklist: `docs/POCKET-ANALYST-PROD.md`.

## Optional (support & admin)

| Variable | Description | Example |
|---------|-------------|---------|
| **CRON_SECRET** | Auth for Vercel Cron (e.g. `/api/cron/ai-usage-reset`, stack-reveal, weekly-snapshot). Set if using crons. | (random string) |
| **ADMIN_EMAIL_OVERRIDE** | Comma-separated emails that can access `/api/admin/support` even without Firebase admin claim | `abbalawal22s@gmail.com` |
| **SUPPORT_EMAIL_TO** | Extra recipient for support form emails (in addition to ai@pocketportfolio.app) | `your@gmail.com` |
| **SUPPORT_MAIL_FROM** | "From" address for support emails (default: `Pocket Portfolio Support <support@pocketportfolio.app>`) | `Pocket Portfolio <ai@pocketportfolio.app>` |
| **MAIL_FROM** | "From" for marketing emails (stack reveal, weekly snapshot); default ai@ | `Pocket Portfolio <ai@pocketportfolio.app>` |

## Checklist

- [ ] FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (required for Firestore + auth)
- [ ] RESEND_API_KEY (required for support + marketing emails)
- [ ] **ADMIN_EMAIL_OVERRIDE** (required in prod so admin can view Support submissions; use the admin’s login email, e.g. `abbalawal22s@gmail.com`)

## Admin can’t view support in production?

1. In **Vercel → Settings → Environment Variables**, add **ADMIN_EMAIL_OVERRIDE** = `abbalawal22s@gmail.com` (or your admin email). Apply to **Production**.
2. Ensure **FIREBASE_PROJECT_ID**, **FIREBASE_CLIENT_EMAIL**, **FIREBASE_PRIVATE_KEY** are set for Production (needed for `/api/admin/support`).
3. **Redeploy** the project (e.g. trigger a new deployment or push a commit) so the new env is picked up.
4. Open the Support submissions page again while signed in with that email.

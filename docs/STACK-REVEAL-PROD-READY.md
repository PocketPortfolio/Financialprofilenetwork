# Stack Reveal: Ready for Prod — Verification Checklist

Use this to confirm the weekly upsell emails are ready to send to real users.

---

## 1. Code & deploy

| Check | Status / Notes |
|-------|----------------|
| **Cron scheduled** | `vercel.json` has `"/api/cron/stack-reveal"` at **`0 9 * * 1`** = **Mondays 09:00 UTC**. |
| **Latest code on main** | Stack Reveal email (ai@, hosted logo, deliverability) and cron route are on the deployed branch. |
| **Vercel deploy** | Production (e.g. www.pocketportfolio.app) is deployed from that branch so the cron and API routes are live. |

---

## 2. Vercel environment variables (Production)

**Verify from your machine (after deploy):**  
Call the verify-env API with your Production `CRON_SECRET` to see which vars are set (no values returned):

```bash
curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://www.pocketportfolio.app/api/stack-reveal/verify-env
```

Response example: `{ "verified": true, "ready": true, "required": { "CRON_SECRET": true, "RESEND_API_KEY": true, ... }, "recommended": { "MAIL_FROM": true } }`. If `ready` is `false`, fix the missing keys in Vercel.

Set these in **Vercel → Project → Settings → Environment Variables** for **Production**:

| Variable | Required | Purpose |
|----------|----------|---------|
| **CRON_SECRET** | ✅ Yes | Auth for Vercel Cron calling `/api/cron/stack-reveal`. Must be set or cron returns 500. |
| **RESEND_API_KEY** | ✅ Yes | Sending emails via Resend. |
| **MAIL_FROM** | ✅ Recommended | Use `Pocket Portfolio <ai@pocketportfolio.app>` (with quotes). If unset, code defaults to ai@. |
| **FIREBASE_PROJECT_ID** | ✅ Yes | Firebase Admin for Auth (cohort) and Firestore (users). |
| **FIREBASE_CLIENT_EMAIL** | ✅ Yes | Service account email. |
| **FIREBASE_PRIVATE_KEY** | ✅ Yes | Service account private key (full PEM, `\n` for newlines). |
| **ENCRYPTION_SECRET** | ✅ Yes | Used for unsubscribe token signing (or set STACK_REVEAL_UNSUBSCRIBE_SECRET). |

Optional:

- **STACK_REVEAL_TEST_EMAIL** – If set, cron with `?test=1` sends all 4 weeks to this address only (no real cohort).
- **STACK_REVEAL_UNSUBSCRIBE_SECRET** – Override for unsubscribe signing; defaults to ENCRYPTION_SECRET.
- **EMAIL_LOGO_URL** – Logo URL for emails; default is Cloudinary.

---

## 3. Resend & deliverability

| Check | Action |
|-------|--------|
| **Domain verified** | Resend Dashboard → Domains → `pocketportfolio.app` (or your sending domain) **Verified**. |
| **SPF/DKIM** | DNS records from Resend added at your DNS host so “mailed-by” / “signed-by” pass. |
| **From address** | Sending from `ai@pocketportfolio.app` (or MAIL_FROM) is allowed for the verified domain. |

See **docs/STACK-REVEAL-DELIVERABILITY.md** for why mail lands in Spam and how to fix it.

---

## 4. Firebase

| Check | Notes |
|-------|--------|
| **Auth** | Cron uses Firebase Auth `listUsers()` to get the cohort (Google signups on or after COHORT_DATE). |
| **Firestore** | Collection **`users`** is created/updated by the cron (`users/{uid}` with `stackRevealWeek`, `marketingOptIn`, etc.). No manual setup required. |
| **Service account** | The same project as your app; service account has Auth and Firestore access. |

---

## 5. Optional: dry run / test

- **Test without sending to cohort:** In Vercel, set **STACK_REVEAL_TEST_EMAIL** to your email. Then trigger the cron with `?test=1` (see below). All 4 week emails go to that address only.
- **Trigger cron manually:**  
  `GET https://www.pocketportfolio.app/api/cron/stack-reveal`  
  Header: `Authorization: Bearer YOUR_CRON_SECRET`  
  For test mode: `GET https://www.pocketportfolio.app/api/cron/stack-reveal?test=1` (with same header; requires STACK_REVEAL_TEST_EMAIL set).

---

## 6. Go live

1. Ensure **STACK_REVEAL_TEST_EMAIL** is **empty** in Production (so the cron sends to the real cohort, not to a test address).
2. Do **not** add `?test=1` when relying on Vercel’s scheduled run.
3. Cron runs **Mondays at 09:00 UTC**. Each eligible user (Google, signup ≥ COHORT_DATE, marketingOptIn, stackRevealWeek &lt; 4) receives the next week’s email and `stackRevealWeek` is incremented in Firestore.

---

## Summary

- **Cron:** Configured in `vercel.json` (Mondays 09:00 UTC).
- **Env in Vercel:** CRON_SECRET, RESEND_API_KEY, MAIL_FROM (quoted), Firebase vars, ENCRYPTION_SECRET.
- **Resend:** Domain verified, SPF/DKIM in DNS, send from ai@.
- **Firebase:** Auth + Firestore for cohort and state; no extra setup.
- **Ready to send:** After deploy and env check, leave STACK_REVEAL_TEST_EMAIL unset in Production so the next Monday run sends to real users.

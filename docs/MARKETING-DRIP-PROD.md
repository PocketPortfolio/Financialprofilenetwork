# Marketing Drip (Day 2 / Day 4) — Production

**Status:** Drip is fully in-code. Setup-link leads are stored in Firestore `mobileLeads`; cron sends Day 2 (48h) and Day 4 (96h) emails.

---

## 1. What’s implemented

- **`POST /api/setup-link`** — Sends the immediate “setup link” email and writes the lead to Firestore **`mobileLeads`** (one doc per email: `email`, `createdAt`, `day2EmailSent`, `day4EmailSent`). Resend Audience logic removed.
- **`GET /api/cron/marketing-drip`** — Runs daily at **10:00 UTC** (Vercel Cron). Sends Day 2 to leads with `createdAt` ≤ 48h ago and `day2EmailSent === false`; sends Day 4 to leads with `createdAt` ≤ 96h ago and `day4EmailSent === false`. Updates flags after send.
- **Templates:** `lib/marketing-drip/email-templates.ts` — Day 2: “How to export your CSV in 30 seconds”; Day 4: “Why local-first privacy matters”.

---

## 2. Environment (Vercel Production)

| Variable | Required | Notes |
|----------|----------|--------|
| **RESEND_API_KEY** | Yes | Already used for setup-link and other emails. |
| **CRON_SECRET** | Yes | Used by Vercel Cron to call `/api/cron/marketing-drip`. |
| **FIREBASE_PROJECT_ID**, **FIREBASE_CLIENT_EMAIL**, **FIREBASE_PRIVATE_KEY** | Yes | Already set for Auth/Firestore. Needed for setup-link (write to `mobileLeads`) and cron (read/update). |
| **NEXT_PUBLIC_APP_URL** | Optional | Base URL for CTA links in emails (default: https://www.pocketportfolio.app). |

**Optional (testing only):**

- **MARKETING_DRIP_TEST_EMAIL** — If set, calling the cron with `?test=1` sends both Day 2 and Day 4 to this address only (no DB changes). Leave unset in production or use only for manual tests.

---

## 3. Vercel Cron

- **Path:** `/api/cron/marketing-drip`
- **Schedule:** `0 10 * * *` (every day at 10:00 UTC).
- Defined in **`vercel.json`**; no extra config in the dashboard needed. Ensure **CRON_SECRET** is set so the cron invocation is authorized.

---

## 4. Test emails (already sent)

- Test emails were sent to **abbalawal22s@gmail.com** (Day 2 and Day 4) via:
  `node scripts/send-marketing-drip-test.js abbalawal22s@gmail.com`
- To send again (e.g. to another address):
  `node scripts/send-marketing-drip-test.js <email>`
- Or trigger the cron in test mode (with app running):  
  `GET /api/cron/marketing-drip?test=1` with header `Authorization: Bearer <CRON_SECRET>`, and set **MARKETING_DRIP_TEST_EMAIL** in env.

---

## 5. Firestore

- **Collection:** `mobileLeads`
- **Document ID:** email with `/` replaced by `_` (Firestore-safe).
- **Fields:** `email` (string), `createdAt` (Timestamp), `day2EmailSent` (boolean), `day4EmailSent` (boolean).
- Created automatically on first setup-link submission; no manual setup. Server uses Firebase Admin (bypasses client rules).

---

## 6. Summary for prod

1. Ensure **CRON_SECRET**, **RESEND_API_KEY**, and **Firebase Admin** vars are set in Vercel Production.
2. Deploy; the cron in `vercel.json` will run daily at 10:00 UTC.
3. New mobile setup-link submissions will receive the immediate email and be queued for Day 2 and Day 4 automatically.

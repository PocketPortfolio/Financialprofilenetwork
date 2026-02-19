# Pocket Analyst – Production Checklist

Use this checklist to prepare and verify Pocket Analyst (Ask AI) in production.

---

## 1. Environment variables (Vercel)

In **Vercel → Project → Settings → Environment Variables**, set these for **Production** (and Preview if you want Ask AI in preview deploys).

### Required for Pocket Analyst to work

| Variable | Purpose |
|----------|---------|
| **FIREBASE_PROJECT_ID** | Firebase Admin (auth + Firestore tier/usage) |
| **FIREBASE_CLIENT_EMAIL** | Firebase Admin service account |
| **FIREBASE_PRIVATE_KEY** | Firebase Admin private key (full PEM, `\n` for newlines) |
| **GOOGLE_GENERATIVE_AI_API_KEY** and/or **OPENAI_API_KEY** | At least one required; otherwise `/api/ai/chat` returns 503. Gemini tried first, OpenAI fallback. |

### Optional but recommended

| Variable | Purpose |
|----------|---------|
| **CRON_SECRET** | Auth for Vercel Cron; required for `/api/cron/ai-usage-reset` (monthly quota reset). |
| **NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL** | Full Cloudinary URL for the 42s landing demo video. If unset, landing shows a placeholder. |

### Landing video (if you want the demo on landing)

1. Put video at `public/pocketanalyst.mp4`.
2. Run: `npm run upload-pocket-analyst-cloudinary`
3. Add the printed URL to Vercel as `NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL`.

---

## 2. Vercel configuration

- **Cron:** `vercel.json` already includes `"/api/cron/ai-usage-reset"` at `0 0 1 * *` (1st of month 00:00 UTC). No change needed.
- **Function:** `/api/ai/chat` uses `maxDuration = 30` (seconds). Vercel Pro default is sufficient.

---

## 3. Firestore

- **apiKeysByEmail/{email}:** Used for tier (`foundersClub` | `corporateSponsor` = paid). Ensure paid users have this set (e.g. from Stripe or API key flow).
- **aiUsage/{uid}:** Written by `/api/ai/chat` for free-tier quota. No indexes required.
- **toolUsage:** Pocket Analyst events are written with `toolType: 'pocket_analyst'` for `/admin/analytics`. No new collections; same as other tools.

---

## 4. Pre-deploy checklist

- [ ] **Firebase Admin** vars set in Vercel (Production): `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- [ ] **At least one LLM key** in Vercel (Production): `GOOGLE_GENERATIVE_AI_API_KEY` and/or `OPENAI_API_KEY`
- [ ] **CRON_SECRET** set in Vercel if you use crons (recommended for monthly quota reset)
- [ ] **NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL** set in Vercel if you want the landing demo video (optional)
- [ ] `npm run build` completes successfully

---

## 5. Post-deploy verification

### Chat and quota

- [ ] Open dashboard, click Ask AI (FAB), send a message → streamed reply (Gemini or OpenAI).
- [ ] Free user: badge shows “X/20 this month”; after 20 questions (or with a lowered limit in code), next request returns 429 and upgrade modal appears.
- [ ] Paid user (tier in `apiKeysByEmail`): no quota badge; can attach file; unlimited questions.

### Quotes and attachments

- [ ] Ask “What is Apple’s stock price?” or “how much is BTC?” → answer includes numeric price from live quote data.
- [ ] Paid user: attach a CSV, ask “What do you think of this?” → answer references file content.

### Cron (optional)

- [ ] After the 1st of the month, check Vercel dashboard or logs that `/api/cron/ai-usage-reset` ran (requires `CRON_SECRET`).

### Landing and analytics

- [ ] Visit `/landing`, scroll to “Your Personal Quantitative Analyst” → video plays (if `NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL` is set); “Try Ask AI” and “Watch Demo” work.
- [ ] Visit `/admin/analytics` → “Pocket Analyst (Ask AI)” section appears with questions, unique users, errors, quota exceeded, by tier/provider (after at least one event).

---

## 6. Troubleshooting

| Symptom | Check |
|--------|--------|
| 503 “AI service not configured” | At least one of `GOOGLE_GENERATIVE_AI_API_KEY` or `OPENAI_API_KEY` must be set in Vercel for the environment that served the request. Redeploy after adding. |
| 401 on chat | User must be signed in; Firebase ID token sent as `Authorization: Bearer <token>`. |
| 429 “Upgrade to Founder’s Club” | Expected for free users after 20 questions in the rolling 30-day window. Either wait for reset (or cron on 1st) or set user as paid in `apiKeysByEmail`. |
| Video placeholder on landing | Set `NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL` in Vercel and redeploy (build-time env). |
| No Pocket Analyst section on /admin/analytics | Ensure at least one chat request (success or error) has occurred in the selected range; events are written to `toolUsage` with `toolType: 'pocket_analyst'`. |

---

## 7. References

- **Architecture and APIs:** `docs/POCKET-ANALYST-IMPLEMENTATION-REPORT.md`
- **Env vars (support + Pocket Analyst):** `docs/VERCEL-ENV-SUPPORT-ADMIN.md`
- **Deployment overview:** `VERCEL-DEPLOYMENT-REQUIREMENTS.md`

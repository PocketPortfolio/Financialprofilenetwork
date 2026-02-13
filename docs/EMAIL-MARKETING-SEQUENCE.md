# Email Marketing: Sequence & Design

## Overview

New users (Google signups in cohort ≥ Oct 27, 2025) receive a **Welcome (Week 0)** email shortly after signup, then a **4-part Stack Reveal series** (Weeks 1–4) on successive Mondays. One email per user per step; no duplicates.

---

## Sequence (order and timing)

| Step | When | Subject | Purpose |
|------|------|---------|---------|
| **Week 0** | Within ~60s of signup | Welcome to Sovereign Finance (and what comes next) | Confirm identity, set expectation for Monday series, CTA: Import Your First CSV |
| **Week 1** | Next Monday 09:00 UTC | Why your financial data is broken (and how we fixed it) | Universal Import intro, CTA: Get started / Unlock unlimited history |
| **Week 2** | Monday + 1 week | Why we don't want your data | Local-first / privacy, CTA: Explore the portal |
| **Week 3** | Monday + 2 weeks | Stop paying monthly fees | Founder's Club, CTA: Explore Founder's Club |
| **Week 4** | Monday + 3 weeks | Your stack, your rules | Wrap-up, CTA: Open the portal |

- **Cohort:** Google signups with `createdAt >= 2025-10-27`.
- **Eligibility for Weeks 1–4:** `marketingOptIn !== false` and `stackRevealWeek < 4` (tracked in Firestore `users/{uid}`).
- **Idempotency:** Week 0 is sent at most once per UID (`welcomeEmailSentAt`). Weeks 1–4 advance `stackRevealWeek` each Monday.

---

## Design (brand & template)

- **From:** `Pocket Portfolio <ai@pocketportfolio.app>` (or `MAIL_FROM` in env).
- **Template:** Shared header (dark green bar, Pocket Portfolio logo), body (greeting + copy + CTA button), footer (Unsubscribe · Portal · Home, “You're receiving this because you signed up for Pocket Portfolio”).
- **CTA color:** `#D97706` (Pocket Portfolio orange).
- **Links:** UTM params `utm_source=weekly_stack_reveal&utm_medium=email&utm_campaign=stack_reveal`.
- **Logo:** Hosted URL (Cloudinary default or `EMAIL_LOGO_URL`), no data URIs (Gmail-safe).

---

## Triggers & implementation

- **Week 0:** Client (`useAuth`) calls `POST /api/welcome-email` with Firebase ID token when a user first appears. API uses a Firestore transaction to set `welcomeEmailSentAt` before sending so only one request sends; client uses a ref so it only triggers once per session.
- **Weeks 1–4:** Vercel cron `GET /api/cron/stack-reveal` runs **Mondays 09:00 UTC** (`vercel.json`). Fetches cohort from Firebase Auth, reads `users/{uid}` for `marketingOptIn` and `stackRevealWeek`, sends next week’s email, then increments `stackRevealWeek`.

---

## Duplicate prevention (Week 0)

1. **Client:** `welcomeEmailTriggeredRef` is set to `true` synchronously before calling the API, so even if `onAuthStateChanged` fires twice, only one request is sent.
2. **API:** Firestore `runTransaction` “claims” the send by writing `welcomeEmailSentAt` first. A second concurrent request re-reads inside the transaction and sees `welcomeEmailSentAt` set, so it returns `alreadySent` and does not send.

---

## Test commands

- **Welcome (Week 0) to a specific address:**  
  `npm run welcome-email:send-test -- <email>`
- **All 4 Stack Reveal emails (Weeks 1–4):**  
  `npm run stack-reveal:send-test -- <email>`

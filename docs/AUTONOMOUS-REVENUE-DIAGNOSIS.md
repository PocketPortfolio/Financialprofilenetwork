# Autonomous Revenue Sprint — Diagnosis Audit

**Date:** 2025-02-24  
**Scope:** Checkout and upgrade flows for Founder's Club; Pocket Analyst quota → revenue conversion.

---

## Findings

### 1. Current flow (quota hit)

- **API:** `/api/ai/chat` returns **429** when free tier exceeds 20 questions/month (see `app/api/ai/chat/route.ts`).
- **Client:** `AskAIModal.tsx` shows overlay "Monthly limit reached" with CTA linking to **`/sponsor?utm_source=pocket_analyst&utm_medium=quota_modal&utm_campaign=founders_club`**.
- **Friction:** User must land on sponsor page, find Founder's Club, then click again to open Stripe. Extra step and context switch reduce conversion.

### 2. Checkout and Stripe

- **Stripe:** Configured in `app/sponsor/page.tsx` (PRICE_IDS, handleCheckout), `app/api/create-checkout-session/route.ts` (creates session, returns `sessionId` + `url`), `app/api/webhooks/stripe/route.ts` (tier assignment).
- **Founder's Club price ID:** `NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB` (e.g. `price_1Sg3ykD4sftWa1Wtheztc1hR`). One-time payment; webhook sets `tier: 'foundersClub'`.
- **No dead links identified.** Sponsor page and upgrade CTAs point to `/sponsor` or same-page checkout.

### 3. Technical blockers to revenue

| Blocker | Detail |
|--------|--------|
| **Extra click** | Quota modal CTA goes to `/sponsor`, not Stripe. One-click "Upgrade Now" → Stripe would shorten the funnel. |
| **Weak value copy** | Modal says "Upgrade to Founder's Club for unlimited Pocket Analyst questions." No explicit "Unlimited AI Context" or "CSV File Attachments." |
| **No direct checkout** | Modal uses `<a href="/sponsor?...">`. No call to `POST /api/create-checkout-session` with Founder's Club priceId and redirect to `url`. |

### 4. Recommendation

- In `AskAIModal.tsx`, on 429: replace the current CTA with a **high-converting state** that (1) highlights **Unlimited AI Context** and **CSV File Attachments**, (2) uses **"Upgrade Now"** that calls `/api/create-checkout-session` with Founder's Club and redirects to Stripe, (3) follows CLAUDE.md (e.g. `var(--accent-warm)`, glassmorphism).

---

*This audit supports the Autonomous Revenue Execution (Step 2) and is retained for the Command Team.*

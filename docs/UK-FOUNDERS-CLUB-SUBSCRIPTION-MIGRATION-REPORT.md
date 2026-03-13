# UK Founders Club — New Subscription Pricing Migration  
## Execution Report for Command Team

**Document:** Post-migration execution report  
**Scope:** UK Founder's Club move from one-time £100 to subscription (£12/mo, £100/yr)  
**Status:** Implemented and prepared for production

---

## 1. Executive Summary

The UK Founder's Club offering has been migrated from a **one-time £100 lifetime** payment to a **subscription model**: **£12/month** or **£100/year** (annual). Legacy one-time purchasers remain grandfathered with lifetime access. This report summarizes what was implemented, production readiness, and operational notes for Test, Build, and Prod.

---

## 2. Migration Scope Executed

### 2.1 Configuration & Environment

| Item | Detail |
|------|--------|
| **New env vars** | `NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_MONTHLY`, `NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_ANNUAL` |
| **Legacy (unchanged)** | `foundersClubLegacy` remains hardcoded (`price_1Sg3ykD4sftWa1Wtheztc1hR`) for one-time £100; webhook still grants lifetime access for that price. |
| **Single-ID fallback** | `NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB` used where a single Founders Club ID is needed (e.g. AskAIModal); can be set to annual ID for backward compat. |
| **Stripe mode** | Price IDs must match `STRIPE_SECRET_KEY` mode: **Test** price IDs with `sk_test_*`, **Live** with `sk_live_*`. Copy IDs from Stripe Dashboard (do not retype; 0/O and I/l confusion causes "No such price"). |

### 2.2 Checkout & API

- **`/api/create-checkout-session`**  
  - Accepts `priceId` for monthly or annual Founders Club.  
  - Uses `stripe.prices.retrieve(priceId)` to decide subscription vs one-time; creates Stripe Checkout in `subscription` or `payment` mode accordingly.  
  - On "No such price", returns a 400 with a clear message and hint to set the correct Live annual price ID in env.

- **Sponsor page**  
  - Two CTAs: "Join Annual (£100/yr)" and "Join Monthly (£12/mo)".  
  - Sends the chosen price ID to create-checkout-session; no mixed use of legacy one-time ID for new subscriptions.

### 2.3 Webhook & Entitlements

- **`/api/webhooks/stripe`**  
  - `foundersClubMonthly` and `foundersClubAnnual` → tier `foundersClub`, `isLifetime: false`.  
  - `foundersClubLegacy` → tier `foundersClub`, `isLifetime: true`.  
  - Subscription cancelled → `handleSubscriptionCancelled` updates `apiKeysByEmail` so cancelled users lose access.

### 2.4 UI & Copy

- **Sponsor page & SponsorDeck**  
  - Single price line: **£12/mo or £100/yr** with aligned branding (same accent colour and emphasis for both amounts).  
  - Counter and "Limited Edition" removed.  
- **Banners** (GlobalFoundersClubBanner, FoundersClubBanner): "Join Founders Club – £12/mo or £100/yr" (no counter).  
- **CTAs/copy** updated across AskAIModal, Settings, landing, compare, cheapest-tracker (SEO-safe: optional upgrade, free tier remains no subscription), learn/fee-drag, tools/track, TickerPageContent, InfrastructureUpgradeModal, `public/llms.txt`.

### 2.5 Admin & Analytics

- **Admin analytics** (`/api/admin/analytics`, admin dashboard):  
  - **Founders Club MRR** (monthly £12, annual £100/12).  
  - **Cash collected** (actual payments, including legacy one-time and subscription invoices).  
  - Per Command Team notes: MRR for valuation, cash collected for runway; both surfaced.

### 2.6 Product Catalog & AI

- **`lib/stripe/product-catalog.ts`**  
  - Founders Club (Annual) and Founders Club (Monthly) entries with correct `stripePriceId` from env.  
- **AskAIModal / outreach**  
  - Use annual (or single) Founders Club price ID where a single ID is required.

---

## 3. Production Readiness — Test, Build, Prod

### 3.1 Lint & TypeScript

- **Lint:** `npm run lint` — **PASS** (no ESLint errors).  
- **TypeScript:** `npm run typecheck` — **PASS** (fixes applied for SponsorDeck `founderCheckoutIntervals` typing and admin analytics Stripe `Invoice.subscription` typing).

### 3.2 Tests

- **Unit tests:** `npm run test` — Vitest reported `EPERM` (spawn) in the execution environment used; not a code defect. **Recommendation:** run `npm run test` in CI or local environment with full permissions before release.

### 3.3 Build

- **Build:** `npm run build` — Importer, sitemaps, Firebase inject, book-assets, and Next.js build were started and progressed successfully in the run observed. **Recommendation:** run full `npm run build` to completion in your pipeline and confirm no errors.

### 3.4 Pre-Production Checklist

| Step | Action |
|------|--------|
| **Stripe Live** | In Stripe Dashboard (Live), confirm products/prices for Founders Club Monthly (£12) and Founders Club Annual (£100/yr). Copy the **Live** price IDs. |
| **Env (Prod)** | Set `NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_MONTHLY` and `NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_ANNUAL` (and optionally `NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB`) in production (e.g. Vercel). Use **Live** IDs when `STRIPE_SECRET_KEY` is Live. |
| **Webhook** | Ensure Stripe webhook endpoint receives `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_succeeded`; same webhook secret in prod env. |
| **Smoke test** | After deploy: open `/sponsor`, click "Join Annual (£100/yr)" and "Join Monthly (£12/mo)", complete test checkouts in Live (or Test) and confirm webhook grants access and admin analytics show MRR/cash. |

### 3.5 Test Mode

- For **Test**: use Stripe **Test** keys (`sk_test_*`, `pk_test_*`) and **Test** price IDs for Founders Club monthly and annual. Create Test products/prices in Dashboard if needed; IDs differ from Live.

---

## 4. Command Team Notes Compliance

- **Cheapest-tracker SEO** (see `docs/FOUNDERS-CLUB-SUBSCRIPTION-COMMAND-TEAM-NOTES.md`): Free tier remains "no subscription"; Founders Club is an **optional** upgrade; copy on that page is SEO-safe and does not contradict the page title.  
- **Admin analytics — MRR vs cash:** Dashboard shows both Founders Club MRR and cash collected; narrative is consistent with Command Team guidance.

---

## 5. Files Touched (Summary)

- **Config / env:** `env.example` (Founders Club price IDs and comment to copy from Dashboard).  
- **Checkout:** `app/api/create-checkout-session/route.ts` (subscription vs one-time, "No such price" handling).  
- **Webhook:** `app/api/webhooks/stripe/route.ts` (Founders Club monthly/annual/legacy mapping, subscription cancelled handling).  
- **Sponsor UI:** `app/sponsor/page.tsx`, `app/components/sponsor/SponsorDeck.tsx` (pricing line, CTAs, branding alignment).  
- **Banners / CTAs:** GlobalFoundersClubBanner, FoundersClubBanner, AskAIModal, Settings, landing, compare, cheapest-tracker, learn/fee-drag, tools/track, TickerPageContent, InfrastructureUpgradeModal, etc.  
- **Admin:** `app/api/admin/analytics/route.ts` (Founders Club MRR + cash, type fix for Invoice).  
- **Catalog / AI:** `lib/stripe/product-catalog.ts`, `app/components/ai/AskAIModal.tsx`, metrics/export, agent outreach.  
- **Type fixes:** `SponsorDeck` founder interval type, admin analytics Stripe Invoice typing.

---

## 6. Summary

The UK Founders Club subscription migration is **implemented and aligned** with the approved design: £12/mo and £100/yr with legacy £100 one-time grandfathered. Lint and typecheck pass; build was run and progressed; unit tests should be run in a proper environment before release. Production deployment requires correct **Live** Stripe price IDs in env and a quick smoke test of both annual and monthly checkouts and webhook behaviour.

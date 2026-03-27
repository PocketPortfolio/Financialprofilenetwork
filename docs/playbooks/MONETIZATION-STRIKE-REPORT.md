# Monetization Strike — Baseline Report (V1)

**Status:** Accepted baseline for the revenue engine. Explicit gap documentation is intentional so future engineers know where telemetry lives and why admin metrics are **proxies** until Q3+ hardening (statistical rigor, anonymous intent indexing, strict cohort analysis).

---

## 1. Executive summary

| Area | Intent | Status |
|------|--------|--------|
| **Free vs paid UI** | Stop showing Founders-only analytics/insights to free users | **Addressed** (tier source-of-truth, UI gates, Firestore intent alignment) |
| **Intent & checkout telemetry** | GA + Stripe metadata for funnel analysis | **In place** (events, metadata; extended with A/B + Firestore funnel) |
| **Ticket C — Cart abandonment email** | Email users who showed intent but did not convert | **Implemented** (daily cron + Resend + idempotency field) |
| **Ticket D — Sponsor A/B** | Split headline + default billing; attribute in Stripe | **Implemented** (sessionStorage variant + Stripe `metadata`) |
| **Ticket E — Admin funnel** | CEO-visible funnel metrics | **Implemented** (minimal board on `/admin/analytics`) |

Remaining work is mostly **product/analytics maturity** (stricter funnel definitions, collision rules with other emails, statistical rigor on A/B), not missing code paths for the above.

---

## 2. Prior monetization & instrumentation (pre–Phase 2)

**Implemented (from earlier shipped work):**

- **Intent-style paywalls** with GA events such as `paywall_impression`, `paywall_cta_click`, and checkout funnel events (`checkout_start`, etc.) via `app/lib/analytics/events.ts`.
- **Stripe Checkout `metadata`**: UTM fields, `trigger_source`, `billing_interval`, etc., on `app/api/create-checkout-session/route.ts`.
- **Post-import / dashboard flows**: e.g. CSV import success → paywall impression on dashboard when appropriate (`app/dashboard/page.tsx`, `CSVImporter`, etc.).
- **Sponsor success** and related paths wired for attribution.

**Gap (partial):** Lifecycle automation beyond the **new** abandoned-cart cron (e.g. full drip sequences, segment-specific copy) was **not** part of the minimal Ticket C spec.

---

## 3. Paid-tier & “false premium” gaps (dashboard)

**Problem:** Free users could still see premium surfaces because of **stale React tier state**, **incomplete `premium` flags** on metrics, and **un-gated** Insights content.

**Implemented:**

| Item | Implementation |
|------|------------------|
| **Single paid definition** | `app/lib/tier.ts` — `isPaidTier` = `foundersClub` \| `corporateSponsor` only. |
| **Analytics grid** | `AnalyticsPanel`: advanced metrics (annualized, volatility, Sharpe, beta, max drawdown) marked premium; free users see **`—`** (values not relied on in DOM for locked cells). |
| **Insights** | `AnalyticsDashboard` only renders charts when `isPaidTier(tier)`; `AllocationRecommendations` only when paid on dashboard. |
| **Tier hydration** | `usePremiumTheme`: no trusting cache-only path for signed-in users before API; API “no tier” clears **`setTier(null)`**; non-OK responses clear tier for signed-in users where applicable. |
| **Loading** | Dashboard passes `tierLoading` into `AnalyticsPanel` so tier is not flashed wrong. |
| **Ask AI** | `PocketAnalystProvider` uses `isPaidTier(tier)` for `isPaid` (quota vs unlimited). **Note:** Ask AI FAB can still show for any logged-in user; gating is in modal/quota, not hiding the FAB (product choice). |

**Documented:** `docs/audits/TIER-GATING-DASHBOARD.md`.

**Remaining gaps:**

- **`codeSupporter` / `featureVoter`**: Treated as **not** paid for **Founders-style** dashboard analytics; if product should treat them as paid for some surfaces, `isPaidTier` or per-surface rules must change.
- **Server-side** monetization remains **authoritative** for AI (`/api/ai/chat`, usage, exports); client gating must stay aligned with Firestore `apiKeysByEmail` / Stripe webhooks.

---

## 4. Ticket C — Lifecycle revenue automation (cart abandonment)

**Objective:** Email users who showed intent but did not pay, after a delay, once.

**Implemented:**

| Piece | Detail |
|-------|--------|
| **Route** | `GET app/api/cron/lifecycle-monetization/route.ts` |
| **Schedule** | `0 14 * * *` (14:00 UTC) in `vercel.json` |
| **Auth** | Same pattern as other crons: `CRON_SECRET` / `x-vercel-cron` |
| **Audience** | `admin.auth().listUsers()` paginated; per user read `users/{uid}` |
| **Opt-out** | Skip if `marketingOptIn === false` |
| **Intent signal** | `lastPaywallImpressionAt` and/or `lastCheckoutStartAt` on `users/{uid}`; use **max** of the two; must be **≥ 24h old** vs `ABANDON_AFTER_MS` |
| **Paid skip** | `apiKeysByEmail/{email}.tier` in `foundersClub` or `corporateSponsor` → skip |
| **Idempotency** | `abandonedCartEmailSentAt` set **after** successful Resend send |
| **Email** | `lib/lifecycle-monetization/email-templates.ts` — subject *“Your Pocket Portfolio analysis is waiting…”*; CTA to sponsor with `utm_campaign=abandoned_cart_24h` |
| **Population of intent** | `POST /api/user/monetization-intent` (Bearer) from `trackPaywallImpression` / `trackCheckoutStart` when user is logged in; `POST /api/create-checkout-session` merges `lastCheckoutStartAt` when email matches a Firebase user |

**Operational / product gaps:**

- **Anonymous checkout:** If checkout uses an email **with no Firebase user**, `users/{uid}` is not updated from checkout alone; cron only iterates **Auth users**, so **true anonymous** intent is only captured if they later sign up with the same pattern or you add a separate collection keyed by email.
- **Collision with other campaigns** (e.g. sovereign / weekly): **No** shared suppression window like `sovereign-campaign`’s 48h collision; could stack emails the same week.
- **Limits:** `LIFECYCLE_MONETIZATION_MAX_EVALUATED` (default 400), `LIFECYCLE_MONETIZATION_MAX_SENDS` (default 40) cap blast radius.
- **Resend template:** Inline HTML, not a named Resend “template ID” in their dashboard.

---

## 5. Ticket D — Sponsor A/B test harness

**Objective:** 50/50 test of framing + default Founders billing; attribute revenue in Stripe.

**Implemented:**

| Piece | Detail |
|-------|--------|
| **Assignment** | `sessionStorage` key `pp_sponsor_ab_variant_v1`; on first visit, `Math.random() < 0.5` → `A` or `B` |
| **Variant A** | Hero + founder card title *“Join the Founders Club”*; default billing interval for FC checkout **`monthly`** when none chosen |
| **Variant B** | Hero + founder card *“Unlock the AI + Risk Terminal”*; default FC billing **`annual`** |
| **UI** | `app/sponsor/page.tsx` + `app/components/sponsor/SponsorDeck.tsx` |
| **Stripe** | `POST` body includes `ab_test_variant`; `metadata.ab_test_variant` = `A` \| `B` \| `none` |

**Gaps:**

- **Sticky assignment** is per browser `sessionStorage` only (not user account, not server cookie); clearing storage re-randomizes.
- **No** formal exposure logging to BigQuery/GA for “assigned variant” beyond what you add separately; assignment is client-side.
- **Mobile sponsor grid** (if still duplicated in `page.tsx`) may not mirror deck copy for every breakpoint — worth a quick UI pass if mobile is critical.
- **Statistical testing** (sample size, significance) is **out of scope** of the implementation.

---

## 6. Ticket E — Attribution command board (admin)

**Objective:** Single place for traffic → intent → checkout → paid.

**Implemented:**

| Piece | Detail |
|-------|--------|
| **Event sink** | `POST /api/analytics/monetization-event` writes **`monetizationFunnelEvents`** with `eventType`, `trigger_source`, `page_path`, `session_id`, `timestamp` |
| **Client hooks** | `trackPaywallImpression` / `trackCheckoutStart` call the above (in addition to GA) |
| **Admin API** | `getMonetizationFunnelBoardData` in `app/api/admin/analytics/route.ts` |
| **Metrics** | Organic traffic = existing **SEO unique page views** in range; paywall & checkout counts from Firestore in range; **Founders active** = count of `apiKeysByEmail` where `tier == foundersClub` (aggregate count with fallback) |
| **UI** | `app/admin/analytics/page.tsx` — “Command funnel” section with paywall→checkout % and a **proxy** checkout→paid drop-off % |

**Gaps (explicitly called out in UI copy):**

- **Founders count** is **all-time active** in Firestore, **not** cohort-matched to the selected date range — so “checkout → paid drop-off” is **directional / proxy**, not a clean cohort conversion rate.
- **Organic traffic** is **deduplicated page views** from existing SEO pipeline, not “sessions” or “marketing-only” traffic.
- **Paywall impressions** depend on clients actually firing events (and dedupe logic in `trackPaywallImpression` reduces duplicates per session/path).
- **No** built-in export or CEO PDF; raw numbers on screen only.

---

## 7. Cross-cutting gaps & recommendations

1. **Unify “variant” reporting:** Consider sending `ab_test_variant` on **all** relevant GA events or a single `experiment_exposure` event for cleaner analysis alongside Stripe metadata.
2. **Intent for non-auth users:** If abandoned-cart must include **email-only** Stripe attempts, add `emailIntent/{emailHash}` or write to `apiKeysByEmail` with non-destructive fields.
3. **Cron safety:** Add optional **collision** with `lastStackRevealSentAt` / other sends like sovereign campaign.
4. **Indexes:** After deploy, watch Firestore console for index prompts on `monetizationFunnelEvents` and `apiKeysByEmail` count queries.
5. **E2E tests:** No automated tests were added for cron, A/B, or admin funnel — recommend smoke scripts for production.

---

## 8. Quick reference — key files

| Concern | Primary files |
|--------|----------------|
| Paid tier | `app/lib/tier.ts`, `app/hooks/usePremiumTheme.ts`, `app/dashboard/page.tsx`, `AnalyticsPanel`, `AnalyticsDashboard` |
| Events + Firestore funnel | `app/lib/analytics/events.ts`, `app/api/analytics/monetization-event/route.ts`, `app/api/user/monetization-intent/route.ts` |
| Checkout + A/B metadata | `app/api/create-checkout-session/route.ts`, `app/sponsor/page.tsx` |
| Abandoned cart cron | `app/api/cron/lifecycle-monetization/route.ts`, `lib/lifecycle-monetization/email-templates.ts`, `vercel.json` |
| Admin funnel | `app/api/admin/analytics/route.ts`, `app/admin/analytics/page.tsx` |
| Tier gating audit | `docs/audits/TIER-GATING-DASHBOARD.md` |

---

## 9. Accepted deferrals (Command Team)

- **Q3+:** Statistical rigor on A/B, anonymous email indexing for intent, strict cohort-matching in admin funnel.

This document is the **single baseline** for “where the telemetry bodies are buried” and why the admin dashboard is a **proxy** until those items are addressed.

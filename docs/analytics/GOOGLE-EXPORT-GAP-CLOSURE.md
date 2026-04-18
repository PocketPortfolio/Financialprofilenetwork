# Google export gap closure — implementation playbook

This document operationalizes the **GA4 / GSC gap closure** plan: measurement, attribution, SEO triage, funnels, geo interpretation, and referral hygiene. Event names match [`app/lib/analytics/events.ts`](../../app/lib/analytics/events.ts).

**Related:** Fill the before/after table in [`CONVERSION-SPRINT-GA4-BASELINE.md`](./CONVERSION-SPRINT-GA4-BASELINE.md) after each post-deploy window.

---

## 0. Baseline archive (repeatable checklist)

Before changing GA4 Admin or drawing conclusions from a new window:

1. **Export** (same dimensions as your Apr 1–18 run):
   - GA4: Reports snapshot, Landing page, Traffic acquisition (session primary channel), User acquisition, Purchase journey (if used), Demographics by country/city if needed.
   - GSC: Performance → **Pages**, **Queries**, **Countries**, **Devices**, **Search appearance** (optional).
2. **Store** CSVs in a dated folder (Drive or repo `docs/analytics/exports/` only if non-sensitive — avoid PII).
3. **Record** in [`CONVERSION-SPRINT-GA4-BASELINE.md`](./CONVERSION-SPRINT-GA4-BASELINE.md) Artifact table: deploy date, **git SHA**, canonical hostname (`https://www.pocketportfolio.app`).

---

## 1. GA4 Admin — key events and revenue visibility

**Symptom:** Key events and revenue columns show **0** while traffic exists.

### 1.1 Mark key events (Admin → Data display → Key events)

Toggle **on** for events that already fire from the app (verify spelling in DevTools Network or GA4 **Realtime**):

| Event name | Suggested use |
|------------|----------------|
| `purchase` | If you send GA4 ecommerce `purchase`; else use checkout success below |
| `checkout_success_page_view` | Stripe return / success page |
| `checkout_redirected` | Funnel mid-step |
| `csv_import_success` | Primary import success |
| `csv_import_error` | Diagnostic (optional as key event) |
| `paywall_cta_click` | Monetization intent |
| `paywall_impression` | Surface volume (optional key event) |
| `bridge_to_terminal_cta_click` | JSON-api → dashboard bridge |
| `dashboard_demo_shown` | Cold-start (optional) |
| `dashboard_demo_dismissed` | Cold-start dismiss (optional) |
| `ai_attachment_button_click` | Paperclip attempts |
| `csv_import_header_autofix` | Header normalization (optional diagnostic) |

**Ecommerce:** The app fires GA4 **`purchase`** (`transaction_id`, `value`, `currency`, `items`) from [`/sponsor/success`](../../app/sponsor/success/page.tsx) after [`GET /api/stripe/checkout-session/[sessionId]`](../../app/api/stripe/checkout-session/[sessionId]/route.ts) confirms `payment_status === 'paid'`. Mark **`purchase`** as a **Key event** in GA4 Admin. **Stripe** remains the financial source of truth.

### 1.2 Custom dimensions (Admin → Custom definitions)

Create **event-scoped** dimensions for parameters already sent by `trackEvent` / `gtag`:

| Dimension name | Event parameter (examples) |
|----------------|----------------------------|
| `trigger_source` | `paywall_impression`, `paywall_cta_click`, `checkout_start` |
| `cta_id` | `bridge_to_terminal_cta_click`, `paywall_cta_click` |
| `context_id` | `bridge_to_terminal_cta_click` |
| `utm_content` | Any event passing `utm_content` |
| `is_paid` | `ai_attachment_button_click` |

Registration can take **24–48 hours** before dimensions appear in explorations.

### 1.3 Validation (DebugView + Realtime)

1. GA4 **Admin → DebugView** — enable debug mode for your device (Chrome extension or `?debug_mode=true` if configured).
2. Manually run: **CSV import success** → **open `/s/aapl/json-api`** → **primary bridge CTA** → **Ask AI paperclip** (free tier) → **sponsor checkout start** (cancel at Stripe).
3. Confirm each step fires and **key event counts** increment after marking key events.

**Artifact:** Screenshot of key events list + one Realtime row.

---

## 2. Saved exploration — channel × landing × engagement

**Path:** Explore → Blank → **Free form**.

**Dimensions:**

- Session primary channel group (Default Channel Group)
- Landing page
- Country (optional)
- City (optional — for Singapore breakdown)

**Metrics:**

- Sessions
- Engaged sessions
- Engagement rate
- Average engagement time per session
- Key events (after Phase 1)

**Filter (optional):** Landing page contains `/s/` or `/json-api` for pSEO slice.

**Export:** Top 20 rows to CSV for Growth Hub.

---

## 3. GSC — join Pages and Queries

1. **Performance → Pages** — sort by **Clicks** or **Impressions** (depending on goal).
2. For each top URL, open **Queries** filtered to that page (or use API / Looker connector).
3. **Prioritize:**
   - High impressions, **low CTR** → title + meta + H1 alignment.
   - High impressions, **avg position greater than 10** → content depth + internal links + CWV.
4. **json-api template:** Edit [`app/s/[symbol]/json-api/page.tsx`](../../app/s/[symbol]/json-api/page.tsx) metadata / body copy; keep **no hard modal** gate (see [`docs/seo/JSON-API-SEO-VERIFICATION.md`](../seo/JSON-API-SEO-VERIFICATION.md)).

**CWV:** GSC **Experience** (or PageSpeed) on representative URLs; file perf tasks separately from analytics.

---

## 4. UTM discipline (reduce false “Direct”)

**Repo audit (completed in code where gaps existed):**

- Home **Launch App** uses [`DashboardLaunchLink`](../../app/components/nav/DashboardLaunchLink.tsx): when the user has no `ref=REF-*` invite, pathname **`/`** now adds default `utm_source=landing&utm_medium=launch_app&utm_campaign=signup`.
- Landing **Founders** links that pointed to bare `/sponsor` now include `utm_source=landing` and distinct `utm_medium` values.
- **JsonApiLivePreview** “Start Free” dashboard link includes `utm_source=json_api` and related params.

**Ongoing:** When adding new marketing links to `/dashboard` or `/sponsor`, always append `utm_*` (see existing patterns in [`app/landing/page.tsx`](../../app/landing/page.tsx), json-api page, sponsor page).

---

## 5. Looker Studio / GA4 dashboards — CSV and paywall

Build a **single-page** dashboard (or two tabs):

**Tab A — CSV**

- Event count: `csv_import_start`, `csv_import_success`, `csv_import_error`
- Calculated: success ÷ start (filter same date range)
- Optional: `csv_import_header_autofix` count

**Tab B — Monetization**

- `paywall_impression` → `paywall_cta_click` → `checkout_start` → **`purchase`** (and optional `checkout_success_page_view`)
- Breakdown: **event-scoped** `trigger_source`, `cta_id`

**Tab C — Bridge**

- Sessions with landing page containing `json-api` (exploration)
- Event: `bridge_to_terminal_cta_click` with `cta_id`

### Internal `/admin/analytics` (Firestore + Stripe)

- The page calls [`GET /api/admin/analytics`](../../app/api/admin/analytics/route.ts) with **`cache: 'no-store'`**, a **cache-busting query**, and **`Cache-Control: no-store`** on the JSON response.
- **Auto-refresh every 45 seconds** plus a **Refresh now** control for near–real-time operations review (still bounded by Stripe/Firestore API latency).

---

## 6. Singapore — two metrics, one narrative

Do **not** compare GA4 **City = Singapore** (active users, all channels) directly to GSC **Country = Singapore** (organic clicks).

**GA4 Exploration:**

- Dimension: City = `Singapore`
- Dimension: Session primary channel group
- Metrics: Sessions, engaged sessions, key events

Interpret each channel separately. **SEO** for Singapore follows **GSC country** rows only.

**Product decision:** If APAC is not a priority market, treat SG SEO as **long-tail**; if it is, invest in **localized content** and broker/currency copy (content project, not analytics).

---

## 7. Referral spam and data quality

1. **Reports snapshot → Session source / medium** — sort by sessions; flag domains you do not recognize.
2. **Confirm** spam (no legitimate traffic) before **Admin → Data streams → Web → Configure tag settings → List unwanted referrals**.
3. Avoid over-blocking: legitimate AI referrers (`chatgpt.com`, `perplexity.ai`) may appear as referral; that can be **expected**.

**Firebase vs GA4:** Use **GA4** as the primary growth funnel for the web app; align **date range and timezone** when comparing to Firebase “active users” exports.

---

## 8. Optional — static JSON in HTML for crawlers

If **URL Inspection** shows weak primary content for `json-api`:

- The app now includes a **`<noscript><pre>`** indexable sample on the main json-api layout when server data exists (see `page.tsx`).
- Hydrated live preview still receives `initialHistorySample` from the server when the API returns data at request time.

Re-run checks in [`docs/seo/JSON-API-SEO-VERIFICATION.md`](../seo/JSON-API-SEO-VERIFICATION.md) after deploy.

---

## Exit criteria (from plan)

1. Key events and at least one **checkout success** (or documented Stripe-only revenue) appear in standard reports.
2. Bridge and CSV ratios use **stable denominators** (document which denominator you use).
3. GSC **Pages** show improved position or CTR on a **named list** of URLs after iterations.
4. Singapore story is documented with **channel breakdown**, not a single blended number.

---

## Cadence

| Week | Focus |
|------|--------|
| 0 | Sections 0–1 complete; DebugView validated |
| 1 | Sections 2–3 explorations + top URL list |
| 2–4 | Sections 3–5 iterations; update baseline before/after table |
| 4+ | Sections 6–7 as needed |

**Out of scope here:** GTM migration, BigQuery export, apex vs `www` DNS — treat as separate projects.

# Feature Lockdown Handoff — 2026-02-27

**Status:** Final commit before 14-day incubation. Ops and Data handoffs are implemented in code; the following steps must be completed by the respective teams.

---

## 1. Ops / Lead Engineer: Resend audience (drip campaign)

- **Code:** `POST /api/setup-link` now adds the submitted email to a Resend Audience when the env var is set (after sending the transactional “setup link” email).
- **Action:** Configure **`RESEND_SETUP_LINK_AUDIENCE_ID`** in the **production** Vercel environment:
  1. In Resend Dashboard → Audiences, create (or select) an audience for the “Mobile setup link” drip.
  2. Copy the Audience ID.
  3. In Vercel → Project → Settings → Environment Variables, add `RESEND_SETUP_LINK_AUDIENCE_ID` with that value for **Production**.
- **Why:** Marketing can then build the Day 2 and Day 4 email sequence in the Resend UI against this audience, without further code changes.

---

## 2. Data Team: GA4 custom dimension for Lead Magnet

- **Events implemented (GA4 + /admin/analytics):**
  - **`lead_magnet_clicked`** — fired when “Start Free — Local First” is clicked on `/s/[ticker]/json-api` or `/s/[ticker]/dividend-history`; includes **`ticker`** (symbol).
  - **`mobile_setup_requested`** — fired when a mobile user successfully submits the setup-link form on the dashboard.
  - **`quota_upgrade_initiated`** — fired when a user clicks through to Stripe from the 429 quota modal (Pocket Analyst).
- **Backend:** These events are also sent to Firestore and appear in **`/admin/analytics`** under **Conversion Funnel** (Lead Magnet Clicks, Mobile Setup Requested, Quota Upgrade Initiated, plus lead-magnet-by-ticker).
- **Action:** In the GA4 property, register **`ticker`** as a **Custom Dimension** scoped to the **`lead_magnet_clicked`** event so it appears in reports and can be used for Lead Magnet CTR analysis.

### Data team confirmation checklist

Use this to confirm the Data team has addressed the handoff:

- [ ] **GA4:** `ticker` is registered as a Custom Dimension for the `lead_magnet_clicked` event (GA4 Admin → Property → Custom definitions → Custom dimensions).
- [ ] **GA4:** The three events (`lead_magnet_clicked`, `mobile_setup_requested`, `quota_upgrade_initiated`) appear in GA4 reports or DebugView after smoke tests.
- [ ] **Admin:** `/admin/analytics` shows the **Conversion Funnel** section with non-zero counts after at least one smoke-test action (optional; section appears as soon as the API returns `conversionFunnel`).

---

## 3. Smoke test (post-merge)

- Click “Start Free — Local First” on a ticker JSON/dividend page → GA4 debug or Network shows `lead_magnet_clicked` with `ticker`.
- Submit the mobile setup-link form (dashboard, narrow viewport, empty portfolio) → `mobile_setup_requested` fires on success.
- Trigger 429 in Pocket Analyst and click upgrade → `quota_upgrade_initiated` fires before redirect to Stripe.

---

*After this PR is merged and smoke tests pass, feature lockdown is in effect. Marketing runs the drip in Resend; Growth monitors the three metrics in GA4 and/or `/admin/analytics` (Conversion Funnel). Revenue review in 14 days.*

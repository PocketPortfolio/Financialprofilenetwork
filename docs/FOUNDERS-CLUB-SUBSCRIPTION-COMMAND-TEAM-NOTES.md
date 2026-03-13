# Founders Club Subscription Migration — Command Team Operational Notes

**Status:** Execution plan approved. These notes are mandatory reading for the engineering team before and during implementation.

---

## 1. Cheapest Tracker SEO Nuance (Phase 5)

**File:** `app/cheapest-portfolio-tracker-no-subscription/page.tsx`

**Risk:** The page title and URL explicitly say "no-subscription". Blindly replacing "lifetime" with "£12/mo subscription" or similar would make the page content contradict the title and trigger a **Google Quality Rater penalty for deceptive page titles**.

**Actionable guidance:**

- Follow the **SEO-Safe Copy Updates** provided by the Command Team (see separate doc or prior comms). Do not simply swap "lifetime" for "subscription" on this page.
- Options that preserve intent and avoid deception:
  - Emphasize that the **free tier** remains "no subscription" and that Founders Club is an **optional** upgrade (e.g. "Free forever, or optional Founders Club from £12/mo").
  - Keep the value prop that users can avoid subscriptions by using the free tier; present Founders Club as an optional paid tier with clear subscription wording elsewhere (e.g. on `/sponsor`), without making this page title/content misleading.
- Ensure the engineering team explicitly reads the SEO-Safe Copy Updates before changing any copy on this page.

---

## 2. Admin Analytics — MRR vs Cash Flow (Phase 6)

**Context:** For Founders Club subscriptions, MRR is calculated as £12 for monthly and £100/12 ≈ £8.33 for annual. That is correct for **valuation and recurring revenue metrics**. However, **cash flow** is different: annual plan pays £100 upfront.

**Actionable guidance:**

- The admin dashboard should display **both**:
  - **MRR (Monthly Recurring Revenue)** — for valuation and recurring run rate (amortize annual as £100/12).
  - **Total Cash Collected** (or equivalent) — for runway and actual money in the bank (e.g. £100 in month 1 for an annual signup).
- Ensure the CEO and stakeholders understand that the "cash flow" view will look different from the "MRR" view; both are correct for their respective purposes.

---

*Document generated from Command Team review. Architecture, webhook routing, and grandfathering logic are approved; execution may proceed with these notes applied.*

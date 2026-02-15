# Principal Growth Hacker — Implementation Report & Projections

**Product:** Pocket Portfolio  
**Scope:** Mode 2 (Referral & Viral) — Weekly Snapshot email, referral tracking, admin analytics.  
**Status:** Implemented, ready for production.  
**Date:** February 2026

---

## Executive summary

We implemented the **Trojan Horse** referral loop and full **referral analytics** so growth can be measured and optimized without promising unrewarded incentives. The system is production-ready: Weekly Snapshot runs Fridays at 21:00 UTC (no overlap with Monday Stack Reveal), invite copy no longer promises “Earn Rewards,” and referral events are stored in Firestore and visible in `/admin/analytics`.

**Outcome:** A value-first weekly email that carries a referral CTA, plus instrumentation to track link clicks and signup conversions by source. This sets the base for lowering CAC through organic sharing and for future incentivized referral programs once rewards are implemented.

---

## 1. What was implemented

### 1.1 Weekly Snapshot email (Trojan Horse)

| Component | Detail |
|-----------|--------|
| **Cadence** | Friday 21:00 UTC (market close). No collision with Monday 09:00 UTC Stack Reveal. |
| **Eligibility** | All users with `weekly_snapshot_enabled !== false` (default on). One email per user per week (`lastWeeklySnapshotSentAt`). |
| **Content** | With portfolio data: one hero number (% change), optional top gainer, “Share Snapshot” CTA. Without data: “Markets this week” + same CTA. Dynamic footer (green / red / neutral) and referral link in body and footer. |
| **Unsubscribe** | `type=weekly_snapshot` → sets `weekly_snapshot_enabled: false` only (Stack Reveal unaffected). |
| **Infra** | `GET /api/cron/weekly-snapshot`, Resend tag `weekly_snapshot`, template in `lib/weekly-snapshot/email-templates.ts`. |

### 1.2 User controls and touchpoints

- **Settings → Email:** Toggle “Weekly portfolio snapshot (every Sunday)” — actually sends Friday; copy can be updated later.
- **Invite page:** `/invite` (auth required), “Invite Friends” (no “Earn Rewards”).
- **User menu:** “Invite” link to `/invite`.
- **Dashboard empty state:** “Invite a friend to try Pocket Portfolio” → `/invite`.

### 1.3 Referral event pipeline

- **Client:** `trackViralReferral({ action: 'click' | 'conversion', referralCode, source })` → gtag + `POST /api/referral-event`.
- **API:** `POST /api/referral-event` writes to Firestore `referralEvents` (action, referralCode, source, timestamp).
- **Admin:** `GET /api/admin/analytics` includes `referral`: clicks, conversions, last 7d, and by source. `/admin/analytics` shows a **Referrals** section with these metrics.

### 1.4 Production safeguards

- **Schedule:** Friday 21:00 UTC avoids two emails in 24h (no Sunday + Monday spike).
- **Copy:** No reward promise in UI; “Invite Friends” only.
- **Firestore:** Rule for `referralEvents`: read for admins only; writes only via server (Admin SDK).

---

## 2. Growth model (AARRR) — where this fits

| Stage | Lever | How Weekly Snapshot + referral helps |
|-------|--------|--------------------------------------|
| **Acquisition** | SEO, book, LinkedIn | Referral links in emails and on /invite drive new visits with `ref` and source. |
| **Activation** | First CSV import | Unchanged; email CTAs point to app/import. |
| **Retention** | Stack Reveal + Weekly Snapshot | Friday snapshot adds a second weekly touch (value + share CTA). |
| **Revenue** | Founder’s Club, Corporate | Snapshot and invite can include soft CTAs to /sponsor when we add them. |
| **Referral** | Invite page, share CTA in email | **Implemented.** Clicks and conversions tracked; no phantom reward. |

---

## 3. Metrics and tracking

| Metric | Where | Notes |
|--------|--------|--------|
| Referral link clicks | `/admin/analytics` → Referrals | From `referralEvents` with `action: 'click'`. |
| Referral signups (conversions) | Same | `action: 'conversion'` when new user signs up with ref in session. |
| Clicks/conversions last 7d | Same | Time-windowed counts. |
| By source | Same | e.g. `user_menu`, `dashboard`, `weekly_snapshot`, `landing`. |
| Weekly Snapshot sends | Resend dashboard | Tag `weekly_snapshot`. |
| Unsubscribe (weekly only) | Firestore `users/{uid}.weekly_snapshot_enabled` | Unsubscribe link sets to false. |

GA4 continues to receive the same viral_referral events; Firestore + admin analytics add a first-party view for reporting and optimization.

---

## 4. Projections

Assumptions: current Google signups and engagement stay similar; no paid acquisition change; Weekly Snapshot goes to all eligible users; referral links are present in email and on /invite.

### 4.1 Referral funnel (conservative)

| Funnel step | Assumption | 90-day projection (example) |
|-------------|------------|-----------------------------|
| Weekly Snapshot emails sent | ~same as active users, 1/week | Scale with cohort (e.g. 500–2,000/week as base grows). |
| Email open rate | 25–35% | — |
| Share CTA click (openers) | 2–5% | 10–50 clicks/week at 500 recipients. |
| Referral link clicks (all sources) | /invite + email + menu | 20–80 clicks/week combined (conservative). |
| Click → signup (conversion) | 5–15% | 1–12 new signups/week from referral. |
| **Referral-originated signups (90d)** | — | **~40–150** (conservative). |

These are illustrative; actuals depend on list size, engagement, and share behavior.

### 4.2 Upside (if engagement is strong)

- If 5% of Weekly Snapshot openers click “Share Snapshot” and 10% of those clicks convert: **~2.5 signups per 1,000 emails sent** from the email alone.
- If /invite and menu drive another 20–50 clicks/week and 10% convert: **+2–5 signups/week** from in-app referral.
- **90-day upside:** **~80–250** referral signups if both email and in-app referral are used consistently.

### 4.3 CAC and efficiency

- **Incremental cost:** Near zero for referral traffic (no paid spend; only email and engineering already built).
- **Effect:** Every referral signup that would have been acquired via paid or other channels reduces blended CAC. At 50 referral signups in 90 days and a hypothetical £20 CAC elsewhere, that’s **~£1,000 in avoided acquisition cost** (illustrative).

### 4.4 What we do not project yet

- Founder’s Club or Corporate conversion from referral traffic (no reward in place; attribution by source can be added later).
- Exact open/click rates (depends on subject lines and list quality; to be measured in Resend and GA4).

---

## 5. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Spam fatigue | Friday-only cadence; 4+ days from Monday Stack Reveal; value-first copy; one CTA per email. |
| Broken promise | “Earn Rewards” removed; only “Invite Friends” in UI. |
| Low referral conversion | Track by source in admin; double down on best sources (e.g. weekly_snapshot vs user_menu). |
| Cron or Resend failure | Same CRON_SECRET and Resend setup as Stack Reveal; monitor Vercel cron and Resend dashboard. |

---

## 6. Next steps (recommended)

1. **Ship to production** using [PROD-READINESS-WEEKLY-SNAPSHOT-REFERRAL.md](./PROD-READINESS-WEEKLY-SNAPSHOT-REFERRAL.md).
2. **Monitor for 2–4 weeks:** Referrals section in `/admin/analytics`, Resend delivery and opens, unsubscribe rate for Weekly Snapshot.
3. **Optimize:** If email referral clicks are low, A/B test subject line or CTA copy; if a source (e.g. `weekly_snapshot`) converts best, emphasize that channel.
4. **Optional later:** Add “Give 1 month, Get 1 month” (or similar) once reward logic exists; keep tracking in same `referralEvents` + admin Referrals section.

---

## 7. Summary table

| Deliverable | Status | Owner |
|-------------|--------|--------|
| Weekly Snapshot cron (Friday 21:00 UTC) | Done | Eng |
| Weekly Snapshot template + unsubscribe | Done | Eng |
| Settings toggle (weekly_snapshot_enabled) | Done | Eng |
| Invite page + “Invite Friends” (no reward copy) | Done | Eng |
| Referral events → Firestore + admin Referrals | Done | Eng |
| Firestore rule for referralEvents | Done | Eng |
| Prod checklist and deploy verification | Done | Growth / Eng |
| 90-day referral projection (conservative / upside) | Documented above | Growth |

---

**Report author:** Principal Growth Hacker (implementation and projections).  
**References:** [WEEKLY-SNAPSHOT-EMAIL.md](./WEEKLY-SNAPSHOT-EMAIL.md), [EMAIL-MARKETING-SEQUENCE.md](../EMAIL-MARKETING-SEQUENCE.md), [PROD-READINESS-WEEKLY-SNAPSHOT-REFERRAL.md](./PROD-READINESS-WEEKLY-SNAPSHOT-REFERRAL.md).

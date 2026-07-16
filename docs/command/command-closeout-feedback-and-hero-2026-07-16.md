---
id: PP-COMMAND-CLOSEOUT-FEEDBACK-AND-HERO-2026-07-16
title: Command Closeout — Internal Feedback System + Open Hero Scan Fix
status: PUSHED · PRODUCTION LIVE
last_updated: 2026-07-16
roles: [CEO, CPO, Head of Product Engineering, Head of AI & Community Ops]
---

# Command Team Closeout Report — Context Window Deliverables

**Date:** 2026-07-16  
**Scope of this window:** Internal Feedback System (end-to-end) + production hotfix + Open hero amber-scan freeze  
**Operational email lock:** `ai@pocketportfolio.app` only

---

## 1. Verdict

| Workstream | Status |
|------------|--------|
| Internal Feedback System (Phase 1) | **Shipped to production** |
| Admin CMS Firebase init hotfix | **Shipped to production** |
| Open Portfolio hero moving yellow highlight | **Frozen / removed from motion path — this push** |
| Surgical commits only (no seed/marketing noise) | **Held** |

---

## 2. What was built and pushed (Feedback Substrate)

### Capability
Power-user dashboard capture → dual-store vault/events → P0 write-path alerts → admin CMS curation → Pocket/Open “Verified receipts.”

### Spec
- Locked annex: `docs/command/feedback-substrate-spec-2026-06-16.md` (`34ae50c3` / cherry-picked as `fedf0938`)
- Implementation report: `docs/command/internal-feedback-system-report-2026-07-16.md`
- Prod readiness brief: `docs/command/feedback-substrate-prod-readiness-2026-07-16.md`

### Primary commits / PRs
| Ref | Description |
|-----|-------------|
| PR [#87](https://github.com/PocketPortfolio/Financialprofilenetwork/pull/87) → `fdc69bf3` | Feat: internal feedback system (Spec: 34ae50c3) |
| PR [#88](https://github.com/PocketPortfolio/Financialprofilenetwork/pull/88) → `879731b6` | Fix: init Firebase Admin before `getAuth()` in feedback routes |
| This push | Fix: stop Open hero amber scan / Ken Burns drift |

### Surfaces live
- Dashboard modal (`>5` visits / 7d; `?showFeedbackModal=true`)
- APIs: `/api/feedback/submit`, `/api/feedback/featured`, admin submissions/alerts/curate
- Admin: `/admin/analytics` → Feedback Substrate
- Landings: Pocket `/` + `/landing`; Open `/` (Verified receipts)
- Firestore rules deployed for feedback collections

### Production smoke (earlier this window)
- Featured APIs 200; unauth submit 401; auth frictionless + P0 submit 200
- P0 email delivery **ok** to `ai@pocketportfolio.app` (Resend)
- Public receipts rendered on Pocket home/landing and Open home
- Admin CMS verified after hotfix (4 submissions loaded)

---

## 3. Why admin looked “blocked” (and fix)

**Cause:** Admin feedback routes called `getAuth()` before `initializeApp()`.  
**Symptom:** Red error *“The default Firebase app does not exist…”* + zeros.  
**Fix:** `getDb()` before `getAuth()` in submissions / alerts / curate / submit (same pattern as main analytics).  
**Data was never missing** — vault already had submissions/alerts.

---

## 4. Open hero yellow line (this closeout fix)

**Cause:** Not a separate GIF asset. Hero uses static plate `web-hero-glass-vault.png` plus client motion:
1. Animated amber SVG scan path in `OpenLandingSovereignGrid`
2. Ken Burns scale on the plate (baked glass highlights appeared to travel)
3. Amber sheen gradient overlay on the hero frame

**Change:**
- Removed the looping amber scan path
- Disabled Ken Burns on hero
- Disabled amber sheen overlay on hero only

**Files:** `OpenLandingSovereignGrid.tsx`, `OpenLandingVisual.tsx`

---

## 5. Environment / ops notes

| Item | Outcome |
|------|---------|
| `FEEDBACK_ENGINEERING_EMAIL` | Code default + ops lock = `ai@pocketportfolio.app` |
| `FEEDBACK_ALERT_FROM` | Default `Pocket Portfolio Alerts <ai@pocketportfolio.app>` |
| `FEEDBACK_ANON_PEPPER` | Prefer distinct prod pepper; falls back to `ENCRYPTION_SECRET` if unset (Vercel CLI auth unavailable this window) |
| `NEXT_PUBLIC_FEEDBACK_DEV_FORCE_EMAILS` | Must stay omitted in Vercel prod (code also no-ops when `NODE_ENV=production`) |
| GitHub Actions “Deploy to Vercel” | **Billing-locked** — production deploys used Vercel deploy hook |
| Firestore rules | Deployed to `pocket-portfolio-67fa6` |

---

## 6. Explicitly not pushed

Seed decks, marketing assets, videos, tmp frames, unrelated dirty tree files, `.env.local`.

---

## 7. Recommended next steps (optional)

1. Set dedicated `FEEDBACK_ANON_PEPPER` in Vercel Production when CLI auth is restored.
2. Resolve GitHub Actions billing so `Deploy to Vercel` workflow is healthy again.
3. Community Ops: replace prod-smoke curated receipts with intentional public quotes; remove test P0 comments from vault when ready.
4. Confirm `ai@pocketportfolio.app` inbox continues to receive P0s (already verified once this window).

---

*End of context-window closeout.*

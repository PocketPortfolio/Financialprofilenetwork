---
id: PP-FEEDBACK-SUBSTRATE-PROD-READINESS-2026-07-16
title: Feedback Substrate — Production Readiness & Command Decision Brief
status: READY_FOR_COLLECTIVE_DECISION
last_updated: 2026-07-16
roles: [CEO, CPO, Head of Product Engineering, Head of AI & Community Ops, DevOps]
spec_ssot: docs/command/feedback-substrate-spec-2026-06-16.md
deploy_gates: docs/command/deploy-production-gates.md
---

# Feedback Substrate — Production Readiness Report

**Verdict:** Implementation is **complete for Phase 1 local scope**. Production build **succeeds**. Ship is a **collective go / hold / staged** decision — not an engineering blocker.

---

## 1. Executive summary

| Item | Status |
|------|--------|
| Phase 0 spec annex | Locked (`34ae50c3`) |
| End-to-end Phase 1 build | Done (local validated) |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` (production) | Pass (exit 0, ~2m) |
| Firestore rules (repo) | Updated for 4 collections |
| Code committed / PR | **Not yet** — uncommitted on `main` |
| Firestore rules deployed to prod | **Pending** (ops action) |
| Prod env vars set on Vercel | **Pending** (ops action) |
| P0 email delivery verified in prod | **Pending** (local test showed email fail — Resend/domain) |

**Bottom line:** Code is build-ready. Production cutover requires commit + deploy + rules + env + one live P0 smoke.

---

## 2. What shipped (capability map)

### 2.1 User path (B2C dashboard)

- Visit counter in `localStorage` (`>5 /dashboard` visits in 7 days)
- Modal precedence over onboarding / feature announcement
- UI: 1–5 scale + Frictionless/Broken + 12 adversarial templates + free text
- Client + server PII scrub before persistence
- Dev-only force trigger (`NEXT_PUBLIC_FEEDBACK_DEV_FORCE_EMAILS`) — **hard-disabled when `NODE_ENV === 'production'`**

### 2.2 Write path & dual store

| Collection | Role |
|------------|------|
| `feedbackSubmissions` | Admin vault (scrubbed text, triage, CMS source) |
| `feedbackEvents` | Analytics metadata only (no free text) |
| `featuredReceipts` | Public CMS index (`surface = pocket \| open`) |
| `feedbackAlertDeliveries` | P0 delivery log (email + webhook) |

- `anonUserHash = HMAC(uid, FEEDBACK_ANON_PEPPER \| ENCRYPTION_SECRET)`
- P0 severity router on `POST /api/feedback/submit` (not analytics poll)
- KV 24h dedup for P0 alerts

### 2.3 Admin CMS (`/admin/analytics` → Feedback Substrate)

- Submissions queue split: **Awaiting curation** vs **Curated — vault copy retained**
- Promote → Pocket / Open (copy to public index; vault retained by design)
- Featured badges; promote disabled per surface once linked
- Edit / Remove featured receipts
- P0 alert delivery log + telemetry metric cards

### 2.4 Public landings

- `VerifiedReceiptsSection` on Pocket (`/`, `/landing`) and Open (`/open`)
- Up to 12 receipts; responsive grid (1 centered; 2+ auto-fit columns)
- Empty / error → section hidden (no broken UI)

### 2.5 API surface (present in prod build)

| Route | Auth |
|-------|------|
| `POST /api/feedback/submit` | Authenticated user |
| `GET /api/feedback/featured?surface=` | Public |
| `GET /api/admin/feedback/submissions` | Admin |
| `GET /api/admin/feedback/alerts` | Admin |
| `POST /api/admin/feedback/curate` | Admin |

Public featured responses **do not** expose `sourceSubmissionId` / anon hashes.

---

## 3. Verification evidence (2026-07-16)

```
npm run lint        → pass (0 warnings/errors)
npm run typecheck   → pass (exit 0)
npm run build       → pass (exit 0, ~121s)
```

Build includes all five feedback API routes. Local smoke previously confirmed: modal submit, admin queue, promote → landing render, curation UI status.

---

## 4. Production gates — checklist for go-live

### 4.1 Must do before / with deploy (blockers)

| # | Gate | Owner | Notes |
|---|------|-------|-------|
| G1 | Commit + PR feedback substrate only (narrow diff) | Eng | Large dirty tree on `main`; do **not** bundle seed/marketing noise |
| G2 | Deploy updated `firebase/firestore.rules` | DevOps | Collections: submissions, events, featured, alertDeliveries |
| G3 | Set Vercel prod env | DevOps | See §5 |
| G4 | Confirm Resend can send from alert `from` domain | Ops | Local P0 showed `email: fail` — verify domain + `FEEDBACK_ALERT_FROM` |
| G5 | Post-deploy smoke | Eng + Community | §6 |

### 4.2 Should do (same release train preferred)

| # | Gate | Owner |
|---|------|-------|
| S1 | Optional `FEEDBACK_P0_WEBHOOK_URL` (Slack/Discord) | Ops |
| S2 | Dedicated `FEEDBACK_ANON_PEPPER` (don’t rely only on `ENCRYPTION_SECRET`) | Security |
| S3 | Curate ≥1 Pocket + ≥1 Open receipt with intentional quotes (no mismatched taglines) | Community Ops |
| S4 | Confirm `NEXT_PUBLIC_FEEDBACK_DEV_FORCE_EMAILS` is **unset** in Vercel prod | DevOps |

### 4.3 Explicit non-blockers

- Moving featured store from Firestore → Edge KV (spec preferred; Firestore is acceptable for Phase 1 volume)
- Hiding curated vault rows entirely (current: retained + labeled — correct GRC posture)
- Automated e2e Playwright suite for feedback (manual smoke sufficient for first prod)

---

## 5. Production environment variables

| Variable | Required | Default / fallback | Prod guidance |
|----------|----------|--------------------|---------------|
| `FEEDBACK_ENGINEERING_EMAIL` | Required | **`ai@pocketportfolio.app` only** | Sole operational inbox — no alternate engineering aliases |
| `FEEDBACK_ANON_PEPPER` | Recommended | falls back to `ENCRYPTION_SECRET` | Set distinct pepper in prod |
| `FEEDBACK_P0_WEBHOOK_URL` | Optional | unset → webhook logged as not configured | Add when channel ready |
| `FEEDBACK_ALERT_FROM` | Optional | `Pocket Portfolio Alerts <ai@pocketportfolio.app>` | Same operational domain; must be Resend-verified |
| `NEXT_PUBLIC_FEEDBACK_DEV_FORCE_EMAILS` | **Omit in prod** | — | Dev-only; code also guards on `NODE_ENV` |
| `ENCRYPTION_SECRET` | Already required | — | Pepper fallback |
| `RESEND_API_KEY` | Already required for mail | — | P0 path depends on it |
| Firebase Admin + KV | Already required | — | Dual-write + dedup |

Also ensure existing: `ADMIN_EMAIL_OVERRIDE` / admin claims for CMS operators.

---

## 6. Post-deploy smoke plan (30 minutes)

1. **Submit** — signed-in user on `pocketportfolio.app/dashboard?showFeedbackModal=true` → submit frictionless + broken cases.
2. **Admin** — `/admin/analytics` → Feedback Substrate shows both submissions; metrics non-zero.
3. **P0** — broken/parser-style category → `feedbackAlertDeliveries` shows `email.ok: true` (fix Resend if fail).
4. **Curate** — Promote one quote → Pocket; confirm badge + buttons hide for that surface; vault row moves to Curated section.
5. **Public B2C** — `pocketportfolio.app/` and `/landing` show Verified receipts.
6. **Public B2B** — `openportfolio.co.uk/` shows Open-surface receipts only.
7. **Negative** — unfeatured / expired receipts disappear from public API; section hides when empty.

---

## 7. Known issues & residual risk

| Risk | Severity | Mitigation |
|------|----------|------------|
| P0 email failed in local test | **High for ops** | Fix Resend domain/`FEEDBACK_ALERT_FROM` before trusting pager path |
| Uncommitted mega-workspace | Medium | Narrow PR; exclude videos/tmp/seed artefacts |
| Quote/tagline mismatch on promote | Low | Admin Edit on featured receipt; operators own copy quality |
| Composite Firestore indexes | Low | Featured API already falls back to in-memory filter/sort |
| Client-only visit eligibility | Accepted | Spec non-negotiable; can be gamed — acceptable for Phase 1 |
| Public `featuredReceipts` readable by clients | Accepted | No PII by construction; server writes only |

---

## 8. Decision options for the Command Team

### Option A — **GO (full prod)** this release train

Ship feedback substrate with dual-surface landings + admin CMS + P0 router after G1–G5.

**Recommend if:** Community Ops is ready to curate; Resend alert path is fixed; DevOps can deploy rules same day.

### Option B — **STAGED** (recommended default)

1. Deploy code + rules with **feature live** but **no featured receipts** (landings hide empty section).
2. Soft-launch: internal accounts only for 48–72h; verify P0 email.
3. Curate first public receipts intentionally; then announce.

**Recommend if:** Want ops confidence on alert delivery before public social proof.

### Option C — **HOLD** code behind branch until Resend + pepper + rules confirmed

Merge only after G2–G4 green in a preview environment.

**Recommend if:** Capital/ops attention is on seed/outreach this week and feedback is not on the critical path.

---

## 9. Role-specific asks

| Role | Ask |
|------|-----|
| **CEO** | Choose A / B / C; confirm `ai@pocketportfolio.app` remains P0 inbox |
| **CPO** | Approve public copy posture (“Verified receipts · curated”) and first curated quotes |
| **Head of Product Engineering** | Own narrow PR + post-deploy smoke §6 |
| **Head of AI & Community Ops** | Own curation queue cadence; first Pocket + Open receipts; watch P0 inbox |
| **DevOps** | Vercel env (§5), Firestore rules deploy, confirm Resend from-domain |

---

## 10. Suggested next-step sequence (if Option B)

1. Eng: commit feedback substrate + firestore rules + `.env.example` only → PR → merge.
2. DevOps: set prod env; deploy rules; promote Vercel production.
3. Eng: run smoke §6 on prod; paste results into this doc’s appendix.
4. Community Ops: curate first receipts; remove any test/mismatched quotes.
5. Command: 48h review — keep live, tune trigger threshold, or pause modal via env flag (future) if noise.

---

## Appendix A — Key paths

| Area | Path |
|------|------|
| Spec | `docs/command/feedback-substrate-spec-2026-06-16.md` |
| Client lib | `app/lib/feedback/` |
| Modal | `app/components/feedback/FeedbackModal.tsx` |
| Landing | `app/components/landing/VerifiedReceiptsSection.tsx` |
| Submit | `app/api/feedback/submit/route.ts` |
| Featured public | `app/api/feedback/featured/route.ts` |
| Admin curate | `app/api/admin/feedback/curate/route.ts` |
| Admin UI | `app/admin/analytics/page.tsx` |
| Rules | `firebase/firestore.rules` |

## Appendix B — Build attestation

- Date: **2026-07-16**
- Branch: `main` (uncommitted feedback delta present)
- `npm run lint` → pass
- `npm run typecheck` → pass
- `npm run build` → pass (exit 0)

---

*Prepared for Command Team collective decision. Spec remains PHASE_0_LOCKED; this brief does not reopen locked non-negotiables.*

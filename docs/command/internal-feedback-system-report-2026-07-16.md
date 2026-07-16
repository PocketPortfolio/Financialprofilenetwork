---
id: PP-INTERNAL-FEEDBACK-SYSTEM-REPORT-2026-07-16
title: Internal Feedback System — Implementation Report (Commit Scope)
status: DOCUMENTED — AWAITING COMMIT AUTHORIZATION
last_updated: 2026-07-16
roles: [CEO, CPO, Head of Product Engineering, Head of AI & Community Ops]
spec_ssot: docs/command/feedback-substrate-spec-2026-06-16.md
---

# Internal Feedback System — Implementation Report

**Purpose of this document:** Record exactly what was built, how it works, and **which files are in scope for the forthcoming commit/push**. Nothing outside this system is included.

**Status:** Implementation complete. Lint / typecheck / production build verified. Command authorized surgical commit (2026-07-16). **Operational email lock: `ai@pocketportfolio.app` only.**

---

## 1. What this is

An in-app **Internal Feedback System** (Feedback Substrate) for Pocket Portfolio:

1. High-intent dashboard users are prompted for structured feedback.
2. Scrubbed submissions land in an admin vault.
3. P0 (break) signals alert engineering on the write path.
4. Admins curate excerpts into public “Verified receipts” on B2C and B2B landings.

It implements the locked Phase 0 annex: `docs/command/feedback-substrate-spec-2026-06-16.md` (commit `34ae50c3`).

---

## 2. Product behaviour (end-to-end)

### 2.1 Capture (dashboard)

- **Trigger:** `>5` `/dashboard` visits in a rolling 7-day window (client-side `localStorage` only — no navigation telemetry to servers).
- **Override (local):** `?showFeedbackModal=true`; optional `NEXT_PUBLIC_FEEDBACK_DEV_FORCE_EMAILS` (disabled when `NODE_ENV === 'production'`).
- **UI:** 1–5 integer rating · Frictionless / Broken toggle · 12 adversarial category templates · free-text comment.
- **PII:** Scrubbed client-side before submit; scrub repeated server-side before write.

### 2.2 Persistence (dual store)

| Collection | Contents |
|------------|----------|
| `feedbackSubmissions` | Admin vault — scrubbed text, category, rating, friction, `anonUserHash`, tier band |
| `feedbackEvents` | Analytics metadata only — **no free text** |
| `featuredReceipts` | Public CMS excerpts tagged `surface = pocket \| open` |
| `feedbackAlertDeliveries` | P0 email/webhook delivery log |

Identity on vault/events: `anonUserHash = HMAC(uid, pepper)` — never raw uid/email in analytics collections.

### 2.3 P0 alerts

- Severity classified on `POST /api/feedback/submit` (write path).
- Email to `FEEDBACK_ENGINEERING_EMAIL` — **sole operational inbox: `ai@pocketportfolio.app`** (hard default; no secondary engineering aliases).
- Default Resend From: `Pocket Portfolio Alerts <ai@pocketportfolio.app>` (override only with a verified `pocketportfolio.app` sender via `FEEDBACK_ALERT_FROM`).
- Optional webhook via `FEEDBACK_P0_WEBHOOK_URL`.
- 24h KV dedup per `(anonHash, category)`.

### 2.4 Admin CMS (`/admin/analytics` → Feedback Substrate)

- Submissions queue: **Awaiting curation** vs **Curated — vault copy retained**.
- **Promote → Pocket / Open** copies a curated excerpt into `featuredReceipts` (vault row stays — by design for audit).
- Badges when featured; promote disabled per surface once linked.
- Edit / Remove featured receipts; P0 alert log; metric cards.

### 2.5 Public landings

- Component: `VerifiedReceiptsSection`.
- **Pocket (B2C):** `/` and `/landing`.
- **Open (B2B):** `/open` (host-aware Open surface).
- Empty/error → section hidden.
- Layout: 1 receipt centered; 2+ responsive CSS grid (up to 12).

---

## 3. API surface

| Method | Route | Audience |
|--------|-------|----------|
| `POST` | `/api/feedback/submit` | Authenticated user |
| `GET` | `/api/feedback/featured?surface=pocket\|open` | Public |
| `GET` | `/api/admin/feedback/submissions` | Admin |
| `GET` | `/api/admin/feedback/alerts` | Admin |
| `POST` | `/api/admin/feedback/curate` | Admin (`create` \| `update` \| `unfeature`) |

Public featured responses omit internal IDs / anon hashes / `sourceSubmissionId`.

---

## 4. Commit scope (authoritative file list)

**Only the following paths belong in the commit.** Everything else in the working tree is out of scope.

### 4.1 New (untracked)

```
app/lib/feedback/types.ts
app/lib/feedback/templates.ts
app/lib/feedback/scrub.ts
app/lib/feedback/eligibility.ts
app/lib/feedback/devForce.ts
app/components/feedback/FeedbackModal.tsx
app/components/feedback/SentimentScale.tsx
app/components/landing/VerifiedReceiptsSection.tsx
app/api/feedback/submit/route.ts
app/api/feedback/featured/route.ts
app/api/admin/feedback/submissions/route.ts
app/api/admin/feedback/alerts/route.ts
app/api/admin/feedback/curate/route.ts
docs/command/feedback-substrate-prod-readiness-2026-07-16.md
docs/command/internal-feedback-system-report-2026-07-16.md   # this file
```

### 4.2 Modified (existing)

```
.env.example                                   # document FEEDBACK_* vars only
app/dashboard/page.tsx                         # visit gate + FeedbackModal
app/admin/analytics/page.tsx                   # Feedback Substrate CMS section
app/landing/ControlLandingPage.tsx             # VerifiedReceiptsSection
app/landing/RetailLandingPage.tsx              # VerifiedReceiptsSection
app/open/_components/OpenLandingClient.tsx     # VerifiedReceiptsSection
app/components/landing/RetailTrustSection.tsx  # spacing adjacent to receipts
firebase/firestore.rules                       # four feedback collections
lib/stack-reveal/resend.ts                     # sendFeedbackP0AlertEmail
```

### 4.3 Already committed (do not re-add as “new work”)

```
docs/command/feedback-substrate-spec-2026-06-16.md   # locked at 34ae50c3
```

### 4.4 Explicitly excluded from this commit

- `app/landing/page.tsx`, `app/open/page.tsx` — appear dirty but **no substantive diff** (line-ending noise only)
- Seed / pitch / outreach docs and decks  
- Marketing assets, videos, tmp frames, audit JSON dumps  
- Unrelated `package.json` / plate manifest / `canonical-claims` / other dirty files (not required by feedback)
- Local secrets (`.env.local`, `.env.development.local`) — never commit  
- Prod env configuration, Vercel settings, Firestore rules *deploy* — ops after commit, not this commit

---

## 5. Environment variables (code contract only)

Documented in `.env.example`. **Setting them in Vercel is an ops step after commit — not part of this report’s commit.**

| Variable | Role |
|----------|------|
| `FEEDBACK_ENGINEERING_EMAIL` | **Must be `ai@pocketportfolio.app`** — sole operational P0 inbox |
| `FEEDBACK_ALERT_FROM` | Default From = `ai@pocketportfolio.app`; override only if Resend requires a display-name variant on the same domain |
| `FEEDBACK_ANON_PEPPER` | HMAC pepper; falls back to `ENCRYPTION_SECRET` (prod: set distinct) |
| `FEEDBACK_P0_WEBHOOK_URL` | Optional Slack/Discord |
| `NEXT_PUBLIC_FEEDBACK_DEV_FORCE_EMAILS` | Local/dev only; **OMIT in Vercel production** |

---

## 6. Security & GRC posture (as built)

- Client-only eligibility tracking (no visit stream to servers).
- Dual scrub before network/persistence.
- Dual-store split: vault text vs analytics metadata.
- Server-only Firestore writes (Admin SDK); client rules deny writes.
- `featuredReceipts` public-read of curated excerpts only.
- Promote = **publish excerpt**, not delete vault (audit retained).
- Dev force emails gated off in production.

---

## 7. Verification (engineering)

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` | Pass (exit 0) |
| Local smoke | Modal → submit → admin queue → promote → landing render |

---

## 8. Holding position

| Action | Status |
|--------|--------|
| Implementation | Complete |
| Documentation (this report) | Complete |
| Operational email lock | **`ai@pocketportfolio.app` only** |
| Commit | Authorized by Command — Phase 1 surgical commit |
| Push / PR | Await Eng after commit |
| Prod env / Firestore rules deploy / Resend ops | Phases 2–4 — separate from this commit |

---

*When authorized: commit only §4 paths, then push/PR. Do not include operational configuration or unrelated workspace changes.*

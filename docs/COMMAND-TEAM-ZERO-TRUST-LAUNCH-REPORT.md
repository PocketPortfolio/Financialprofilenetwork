# Command Team Report — Zero-Trust Campaign & Production Readiness

**Date:** March 2026  
**Status:** Code ready for production deploy; environment verification required on Vercel.

---

## Executive summary

Shipped a **public, indexable CTO/engineer funnel** (`/challenge`) aligned with the LinkedIn “data gravity” narrative, **separate from** the **gated internal** Sovereign Strike playbook (`/playbooks/sovereign-strike`). Leads are **validated**, **emailed** (branded templates + internal notify), **persisted to Firestore** for ops, and **visible in `/admin/analytics`**. Lint and TypeScript checks pass locally.

---

## Production URLs (canonical)

| Asset | URL |
|--------|-----|
| **Public Architecture Challenge** | `https://www.pocketportfolio.app/challenge` |
| **Books index (discovery)** | `https://www.pocketportfolio.app/book` |
| **Internal playbook (gated if secret set)** | `https://www.pocketportfolio.app/playbooks/sovereign-strike` |
| **Admin — challenge funnel** | `https://www.pocketportfolio.app/admin/analytics` (section: *Architecture Challenge (CTO funnel)*) |

**LinkedIn post:** Use **`/challenge`** in the body (not the internal playbook).

---

## What was built (engineering)

### Public funnel

- **`/challenge`** — Three-level interactive matrix (ingestion / RAG vs aggregate / stateless execution), copy aligned to real architecture patterns.
- **SEO:** Indexable metadata + sitemap entry (`app/sitemap-static.ts`, `public/sitemap-static-v3.xml`).
- **Discovery:** Card on **`/book`** under *Public architecture challenge*.
- **UX:** Reuses `SovereignStrikeMatrix.module.css`; challenge-specific form styles in `ArchitectureChallengeExtras.module.css`.

### Lead capture & email

- **`POST /api/challenge/lead`** — Validates email (`validateEmail`, MX/disposable checks).
- **Resend:** Internal notification + **branded** user reply (`lib/challenge/challenge-lead-email.ts`): slate header, monogram logo, **amber CTAs** (no generic fintech blue).
- **Persistence:** Each successful validation appends a doc to Firestore **`architecture_challenge_leads`** (`lib/challenge/challenge-leads-firestore.ts`). Used for analytics even if Resend degrades.

### Admin / command visibility

- **`GET /api/admin/analytics`** — New field **`architectureChallengeLeads`**: totals (range-scoped), last-7-days metric, up to **100** recent rows with email + timestamp.
- **`/admin/analytics` UI** — New section above Priority Queue Leads.

### Internal vs public (clear separation)

| | Public challenge | Internal Sovereign Strike |
|--|------------------|---------------------------|
| Route | `/challenge` | `/playbooks/sovereign-strike` |
| Gate | None | Optional `PLAYBOOK_GATE_SECRET` |
| SEO | Indexable | `noindex` |
| Finale | Email + resources | Team training / no lead form |
| Progress key | `pp-architecture-challenge-v1` | `pp-sovereign-strike-v1` |

### Marketing asset (repo)

- LinkedIn hero image (optional): `public/marketing/linkedin-zero-trust-challenge-cover.png`

---

## Vercel / environment checklist (ops)

Set or confirm on **Production**:

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | **Required** for real emails (notify + user reply). |
| `MAIL_FROM` | Verified sender in Resend (if not default). |
| `CHALLENGE_LEAD_TO` | **Optional** — internal inbox for challenge leads (else `SUPPORT_EMAIL_TO`, else `ai@`). |
| `EMAIL_LOGO_URL` | **Optional** — override logo in emails (default: Cloudinary monogram). |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | **Required** for Firestore writes + analytics read (already used elsewhere). |
| `PLAYBOOK_GATE_SECRET` | **Optional** — only for internal playbook; **does not** affect `/challenge`. |

After adding/changing env vars: **redeploy** production.

---

## Firestore note

If analytics shows an **index error** for `architecture_challenge_leads` (`createdAt` range + `orderBy`), create the composite index from the link in the Firebase console error (one-time).

---

## Pre-flight verification (QA)

1. Open `/challenge` on production — complete all three levels — submit a **real** work email.  
2. Confirm **two emails** (internal + user) in Resend/dashboard.  
3. Open **`/admin/analytics`** (admin Firebase claim) — confirm new row under **Architecture Challenge**.  
4. Confirm **`/book`** links to `/challenge`.  
5. If internal playbook is gated, confirm **`/playbooks/sovereign-strike`** still behaves as expected.

---

## Quality gates (local)

| Check | Result |
|--------|--------|
| `npm run lint` | Pass |
| `npx tsc --noEmit` | Pass |

*(Full `next build` is recommended in CI or before merge; repo build includes sitemap generation and other steps per `package.json`.)*

---

## Documentation

- `docs/playbooks/ARCHITECTURE-CHALLENGE.md` — Technical map of public challenge + API + Firestore.  
- `docs/playbooks/SOVEREIGN-STRIKE.md` — Internal playbook + gate.  
- This file — **command team** launch + prod checklist.

---

## Suggested comms handoff

- **CEO / GTM:** Final LinkedIn copy + link `https://www.pocketportfolio.app/challenge` + optional cover image path above.  
- **Sales:** Internal objection matrix remains at `/playbooks/sovereign-strike` (gated when secret is set).  
- **Ops:** Monitor `architecture_challenge_leads` and `/admin/analytics`; tune `CHALLENGE_LEAD_TO` for the right inbox.

---

*End of report.*

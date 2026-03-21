# Zero-Trust Architecture Challenge (public)

**Route:** [`/challenge`](/challenge)

**Discovery:** Linked from [`/book`](/book) under **Public architecture challenge**.

Public, indexable funnel for CTOs / lead engineers: three levels (truncated ingest, fixed-schema aggregate vs. cloud RAG, stateless execution). Victory screen collects work email.

## Lead capture

- **POST** [`/api/challenge/lead`](/api/challenge/lead) with JSON `{ "email": "..." }`.
- **Admin:** Each validated signup is appended to Firestore collection **`architecture_challenge_leads`** (email, `createdAt`, `source`, `path`). View counts and recent emails on **[`/admin/analytics`](/admin/analytics)** (same time-range selector as the rest of the dashboard). Retrieval is via **`GET /api/admin/analytics`** field `architectureChallengeLeads` — not a separate public route.
- Validates with shared `validateEmail` (format + MX, disposable checks).
- **Resend:** requires `RESEND_API_KEY`. Sends (1) internal notify to `CHALLENGE_LEAD_TO` or `SUPPORT_EMAIL_TO` or `ai@pocketportfolio.app`, (2) branded auto-reply to the user (logo, slate header, amber CTAs) with links to Technical Press and join. HTML: `lib/challenge/challenge-lead-email.ts` (logo URL via `EMAIL_LOGO_URL` or Cloudinary default, same as Stack Reveal).
- If `RESEND_API_KEY` is unset, the API returns success but only logs (local dev).

## Source files

| File | Role |
|------|------|
| `app/challenge/page.tsx` | Metadata (indexable), renders matrix |
| `app/challenge/layout.tsx` | Flex shell above TabBar |
| `app/challenge/ArchitectureChallengeMatrix.tsx` | Levels, localStorage, email form |
| `app/challenge/ArchitectureChallengeExtras.module.css` | Email form styles |
| `app/api/challenge/lead/route.ts` | Email validation + Resend |
| Styles reuse | `app/playbooks/sovereign-strike/SovereignStrikeMatrix.module.css` |

## Progress storage

Client key: `pp-architecture-challenge-v1` (separate from internal Sovereign Strike).

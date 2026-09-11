---
id: OP-SEC-WAVE-AB-REPORT-2026-09-11
title: Wave A + Wave B security implementation report
status: IMPLEMENTED_TESTED
date: 2026-09-11
parent: docs/command/platform-security-audit-2026-09-11.md
mode: implement + regression (not yet production-claimed)
---

# Wave A + Wave B implementation report — 2026-09-11

**Verdict:** Wave A (High) and Wave B (Medium) **implemented and regression-tested**. No git commit/push in this session. Production claim freeze remains until deploy + smoke on live.

**Regression:** **54 passed** / 16 skipped across auth, AI boundary, map-csv, data-api gate, bot gate, waitlist, import, symbol allowlist, llms compliance.

---

## Wave A — High (done)

| ID | Change | Business continuity |
|----|--------|---------------------|
| **H1** | `/api/api-keys` + `[email]` require owner/admin Bearer; guests no longer email-fetch secrets | Signed-in → `/api/api-keys/user`; sponsor success → session route only (5 retries); retrieve-api-key requires sign-in |
| **H2** | `requireAdminRequest` on `/api/admin/analytics` | Admin UI sends Bearer |
| **H3** | `requireAdminRequest` on `/api/metrics/export` | Partners must send admin Bearer |
| **H4** | Admin auth on agent leads/metrics/send-email/kill-switch/audit/conversations; neurons fail-closed without key in prod | Sales admin uses `authFetch`; health stays public (no connection preview) |
| **H5** | Resend webhook: raw body + Svix verify via `RESEND_WEBHOOK_SECRET` | Unsigned webhooks → 401; secret missing → 500 |
| **H6** | Portfolio history binds to token `uid` | Hook sends Bearer; rejects other userIds |

### Wave A caller updates
- `PremiumTierContext` — no unauthenticated email key lookup
- `retrieve-api-key` — Firebase + `/api/api-keys/user`
- `sponsor/success` — session only
- `admin/analytics`, `admin/sales`, `ActionFeed` — Bearer
- `usePortfolioHistory` — auth-bound

### New helpers
- `lib/auth/require-user-request.ts`
- `lib/auth/verify-resend-webhook.ts`
- `app/lib/auth/bearerFetch.ts`
- `adminUnauthorizedResponse` on `require-admin-request.ts`
- `tests/unit/auth/wave-a-security.spec.ts`

---

## Wave B — Medium (done / deferred)

| ID | Status | Change |
|----|--------|--------|
| **M4** | **Done** | Removed spoofable `x-vercel-cron: 1`; Bearer or header === `CRON_SECRET` only |
| **M5** | **Done** | Free-tier AI fails closed with 503 when Firestore+KV unavailable |
| **M3** | **Done** | `/api/ai/map-csv` IP rate limit (20/min); guest Smart Import preserved |
| **M2** | **Done** | AI chat: string-only context, max message 8k / context 32k / attach 60k |
| **M6** | **Done** | Plaid routes require Firebase auth; `access_token` never returned to browser; UI updated |
| **M1** | **Deferred** | Page middleware auth not added (Edge Firebase cost). **API-layer locks from Wave A are the control** for `/admin` data |
| **M7** | **Doc** | Claim hygiene: signed-in Firestore trades ≠ absolute local-first — keep §6b language |
| **M8** | **Deferred** | CSP `unsafe-inline`/`unsafe-eval` left for follow-up report-only pass (risk of breaking Auth/Stripe/Drive) |

---

## Business & operations regression matrix

| Surface | Expected after harden | Test evidence |
|---------|----------------------|---------------|
| Market data / bot gate | Unchanged gate behavior | `data-api-gate`, `bot-gate` pass |
| AI chat inference boundary | Sovereign cold → Cloud Auto; no portfolio persist | `chat-inference-boundary` pass |
| Smart Import map-csv | Flag + heuristic/LLM; now rate-limited | `map-csv-route` pass |
| Waitlist | Rate limit intact | waitlist tests pass |
| Import contracts | Unchanged | import specs pass |
| Checkout redirect safety | Unchanged | `safe-return-to` pass |
| Cron | Spoof `1` denied; Bearer secret OK | `wave-a-security` cron cases |
| Resend signature | Valid accept / forge reject | `wave-a-security` Svix cases |
| Tier unlock | Session key + authenticated user endpoint | Caller wiring (manual smoke recommended on deploy) |
| Admin analytics / sales | Bearer required | Caller wiring + route guards |
| Plaid | Auth required; no access_token leak | Route + `PlaidLinkButton` updated |

---

## Deploy checklist (ops)

1. Confirm `RESEND_WEBHOOK_SECRET` set in Vercel (unsigned inbound will 401).
2. Confirm Vercel Cron sends `Authorization: Bearer $CRON_SECRET` (not bare `x-vercel-cron: 1`).
3. Confirm `NEURON_API_KEY` set in production (neurons otherwise 401).
4. Smoke: sponsor checkout → success key via session; signed-in settings tier; admin analytics; sales kill-switch; retrieve-api-key after sign-in.
5. Do **not** claim SOC2/ISO; perimeter packaging language only after live smoke.

---

## Org-role close

| Role | Position |
|------|----------|
| **CISO** | Wave A P0 closed in code; M1/M8 residual accepted with API-first posture |
| **Eng** | R complete for A+B implemented items |
| **Platform** | Own deploy secrets + cron header verification |
| **CEO / CMD2** | Claims still HOLD until production smoke |

**SEND_LOCKED for implementation package:** ready for review/deploy mandate — not auto-shipped.

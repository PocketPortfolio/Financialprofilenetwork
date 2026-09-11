---
id: OP-SEC-WAVE-AB-REPORT-2026-09-11
title: Wave A–F security clearance (audit → remediations → re-audit)
status: CLEARED_2026-09-11
date: 2026-09-11
parent: docs/command/platform-security-audit-2026-09-11.md
merged_wave_ab: https://github.com/PocketPortfolio/Financialprofilenetwork/pull/121
prod_deploy: Ready (www.pocketportfolio.app / www.openportfolio.co.uk)
---

# Platform security — Wave A–F clearance

**Verdict (2026-09-11):** App-perimeter Highs **H1–H8 CLOSED**. Mediums **M2/M3/M4/M5/M6/M9–M14 CLOSED**. **M1/M7/M8** remain accepted/deferred. Dependabot runtime Highs patched via npm overrides where a safe fix exists. App-path CodeQL hygiene addressed (EnvDebug, OG clamp, TickerSearch sanitize; Resend ReDoS #88 N/A — no regex on current route).

| Bucket | Count |
|--------|-------|
| High closed (H1–H8) | **8** |
| Medium closed | **10** (M2–M6, M9–M14) |
| Medium deferred / accepted | **3** (M1/M7/M8) |
| Supply-chain High patched (overrides) | sharp, nanoid, fast-uri, browserslist, brace-expansion, js-yaml, ip-address, socket.io-parser |
| Supply-chain deferred | `extract-zip` (no patch), `image-size` (no patch ≤2.0.2) |

---

## 1. High — status

| ID | Finding | Status | Evidence |
|----|---------|--------|----------|
| **H1** | API keys by email without auth | **CLOSED** | `requireEmailOwnerOrAdmin`; prod 401 |
| **H2** | Admin analytics open | **CLOSED** | `requireAdminRequest`; prod 401 |
| **H3** | Metrics export open | **CLOSED** | `requireAdminRequest`; prod 401 |
| **H4** | Agent leads / send-email / kill-switch | **CLOSED** | Admin / neuron fail-closed; prod 401 |
| **H5** | Resend webhook no signature | **CLOSED** | Svix verify; prod 401 |
| **H6** | Portfolio history IDOR | **CLOSED** | uid bind; prod 401 |
| **H7** | Session key retrieval by sessionId | **CLOSED** | Paid-only, 24h window, IP rate limit, one-time Firestore redeem (`sessionKeyRedeems`); local invalid → 404 |
| **H8** | Cron `x-vercel-cron: 1` spoof | **CLOSED** | All cron routes use `verifyVercelCron`; local spoof → **401** |

---

## 2. Medium — status

| ID | Finding | Status | Notes |
|----|---------|--------|-------|
| **M2** | AI context trust | **CLOSED** | Caps in `/api/ai/chat` |
| **M3** | map-csv unauth LLM spend | **CLOSED** | IP rate limit |
| **M4** | Cron accepts `x-vercel-cron: 1` | **CLOSED** (via H8) | Shared helper only |
| **M5** | Quota fail-open | **CLOSED** | 503 when store down |
| **M6** | Plaid unauth / access_token | **CLOSED** | Auth; no token leak |
| **M9** | Cron `?test=1&email=` blast | **CLOSED** | `lib/cron/verify-cron-test-email.ts` allowlist / `ALLOW_CRON_TEST_EMAIL` |
| **M10** | Price API key fail-open | **CLOSED** | Firestore error → 503; fake key local **401** |
| **M11** | Dividend diagnostic / test-sources | **CLOSED** | Cron-gated; presence-only key flags |
| **M12** | setup-link abuse | **CLOSED** | IP rate limit 5/hour |
| **M13** | notifications/register unauth | **CLOSED** | Firebase Bearer + owner DELETE; `useFCM` uses `bearerFetch`; local POST → **401** |
| **M14** | Stripe checkout-session IDOR window | **CLOSED** | 24h expiry → 410 |
| **M1** | Client-only UI page gates | **OPEN (accepted)** | API locks are control |
| **M7** | Claim hygiene | **OPEN (claim)** | Narrative, not exploit |
| **M8** | CSP unsafe-inline/eval | **OPEN (accepted)** | Defer report-only pass |

---

## 3. Local smoke (Wave C/D — 2026-09-11, `:3001`)

| Probe | Result |
|-------|--------|
| `GET /api/health` | **200** |
| `GET /api/dividend/diagnostic` | **401** |
| `GET /api/dividend/test-sources` | **401** |
| `GET /api/cron/weekly-snapshot` | **401** |
| `GET /api/cron/notes-blast?test=1&email=attacker@evil.com` | **401** |
| `GET cron` + `x-vercel-cron: 1` | **401** |
| `GET /api/price/AAPL?key=pp_fake_key` | **401** |
| `POST /api/notifications/register` (no Bearer) | **401** |
| `GET /api/stripe/checkout-session/cs_test_invalid` | **404** |
| Unit: `tests/unit/auth/wave-a-security.spec.ts` | **9 passed** (Svix, cron helper, test-email gate) |

---

## 4. GitHub Security dashboard

### Dependabot
- Runtime Highs closed via `package.json` **overrides** where patched releases exist.
- Still open / no patch: **extract-zip**, **image-size** (≤2.0.2 has no fixed release on npm at clearance time).
- Remaining Medium/Low: triage with Dependabot PRs / `npm audit` (dev tooling).

### CodeQL (app-priority)
| Item | Status |
|------|--------|
| EnvDebug clear-text | **CLOSED** — presence-only, localhost gate |
| OG reflected XSS | **CLOSED** — stronger `clamp` strip |
| TickerSearch DOM/XSS | **CLOSED** — `sanitizeSymbol` on input + links |
| Resend ReDoS #88 | **N/A / stale** — current route has no regex; alert may clear on next analysis |
| Scripts / URL-substring bulk | Backlog (non-runtime path) |

---

## 5. Production readiness snapshot

| Check | Result |
|-------|--------|
| PR #121 (Wave A/B) | Merged `d3a0665b` |
| Wave C–F clearance | Local verified; ship via `security/wave-cdef-clearance` |
| Env: `RESEND_WEBHOOK_SECRET`, `CRON_SECRET`, `NEURON_API_KEY` | Present in prod |
| Optional ops: `CRON_TEST_EMAIL_ALLOWLIST` / `ALLOW_CRON_TEST_EMAIL` | Needed for intentional cron test sends |
| GitHub Actions CI | Billing lock may still block Actions green |

**CISO vote:** App High perimeter **cleared**. Accepted residual: M1/M8 (architecture), M7 (claims), unpatched transitive extract-zip/image-size.

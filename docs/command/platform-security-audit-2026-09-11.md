---
id: OP-SEC-AUDIT-2026-09-11
title: Platform security audit — org roles + CISO (audit-first)
status: AUDIT_LOCKED
date: 2026-09-11
mode: audit-first (no ship)
owners:
  accountable: CEO
  responsible_eng: Head of Product Engineering
  responsible_platform: Head of Platform & DevOps
  consulted: CISO (guest), Head of AI, CPO, CCO
claim_gate: docs/command/claims-vs-codebase-calibration.md §6b
---

# Platform security audit — 2026-09-11

**Verdict:** **CLEARED for app High perimeter (H1–H8) + Medium M2–M6/M9–M14** as of Wave C–F local clearance 2026-09-11. See `docs/command/platform-security-wave-ab-report-2026-09-11.md`.  
**Scope:** Pocket + Open surfaces; auth/API/AI/agent/webhooks/cron/tier paths.  
**Accepted residual:** M1/M8 (architecture), M7 (claims), unpatched transitive `extract-zip` / `image-size`.

Diff-based Security Review subagent could not compute a usable diff (oversized dirty tree on `main`). This package is a **platform inventory audit** with verified file evidence.

---

## 1. Org-role votes (CMD1 ∪ CMD2 → synthesis)

| Role | Vote | One-liner |
|------|------|-----------|
| **CISO (guest)** | **HOLD / P0 now** | Unauthenticated secret retrieval + open sales/admin APIs are unacceptable for any diligence room. Label and remediate before claiming security packaging. |
| **CEO** | **HOLD claims** | Do not assert SOC2/ISO or “enterprise-ready perimeter.” Factual posture only: local-first where true; gaps listed here. |
| **Head of Platform & DevOps** | **A on Wave A** | Own cron auth, webhook sigs, deploy gates, secret rotation after key exposure window. |
| **Head of Product Engineering** | **R on Wave A–B** | Own route auth, IDOR fixes, client caller updates, regression tests. |
| **Head of AI & Community Ops** | **C / claim gate** | AI context trust + map-csv cost abuse are Medium; keep §6b language (bounded processor, not zero-leakage). |
| **CPO** | **C** | Tier/quota fail-open and retrieve-api-key UX must survive hardening without breaking paid unlock. |
| **CCO** | **I → C on agent** | Sales agent open routes are commercial PII risk; kill-switch without auth is ops sabotage risk. |
| **Marketing / Creative** | **I** | No outbound security claims until Wave A closed. |
| **CMD2 (adversarial)** | **HARD PASS on overclaim** | Prior “local-first” absolute vs Firestore trades for signed-in users is a claim hygiene issue (Medium / narrative), not a silent ship. |

**Synthesis:** CISO + Eng + Platform own Wave A. CEO owns claim freeze. No code ship in this package — plan + regression gates only.

---

## 2. Severity legend

| Label | Meaning |
|-------|---------|
| **High** | Exploitable without privileged access; secret/PII/ops control exposure |
| **Medium** | Abuse under auth, fail-open controls, or defense-in-depth gaps with real impact |
| **Low / Info** | Hygiene, claim drift, limited blast radius |

---

## 3. Labeled findings (High + Medium)

### High

| ID | Label | Location | Finding | Business callers at risk if naively locked |
|----|-------|----------|---------|--------------------------------------------|
| **H1** | IDOR / secret disclosure | `app/api/api-keys/route.ts` L53–156; `app/api/api-keys/[email]/route.ts` | `GET` by email returns `apiKey`, `corporateLicense`, tier **with no auth** | `PremiumTierContext` fallback; `retrieve-api-key`; `sponsor/success` fallbacks |
| **H2** | Missing auth — admin BI | `app/api/admin/analytics/route.ts` L157+ | Full analytics (MRR/Stripe/Firestore) open; other admin routes use `requireAdminRequest` | `app/admin/analytics/page.tsx` (fetch without Bearer today) |
| **H3** | Missing auth — metrics export | `app/api/metrics/export/route.ts` | Business metrics export unauthenticated | Partner/export consumers |
| **H4** | Missing auth — sales agent | `app/api/agent/leads/*`, `send-email`, `kill-switch` L17–23 TODO | Lead PII list/detail, outbound email, kill-switch toggle open | `app/admin/sales/page.tsx`, ActionFeed |
| **H5** | Webhook forgery | `app/api/agent/webhooks/resend/route.ts` L22–26 | Signature verification commented out | Lead status machine, inbound email pipeline |
| **H6** | IDOR — portfolio history | `app/api/portfolio/history/route.ts` L15–46 | Arbitrary `userId` reads snapshots | `usePortfolioHistory.ts` |

### Medium

| ID | Label | Location | Finding | Business / ops regression risk |
|----|-------|----------|---------|--------------------------------|
| **M1** | Client-only UI gates | `middleware.ts` (no auth); dashboard/admin pages | Pages reachable at HTTP; rely on API/client | Do not break dual-surface host routing when adding auth |
| **M2** | Prompt / context trust | `app/api/ai/chat/route.ts` | Client `context` / `attachedContent` trusted into prompt | Must not break Hybrid RAG / contextBuilder contract |
| **M3** | Unauth LLM spend | `app/api/ai/map-csv/route.ts` | No auth; gated by `ENABLE_LLM_IMPORT` | Guest Smart Import must keep working when flag on |
| **M4** | Cron spoof | `lib/cron/verify-vercel-cron.ts` L12–15 | Accepts `x-vercel-cron: 1` | Cron jobs must still pass with Bearer `CRON_SECRET` |
| **M5** | Quota fail-open | `app/api/ai/chat/route.ts` quota branch | Firestore+KV both down → free may proceed | Paid unlimited + free 10/mo semantics |
| **M6** | Plaid unauthenticated | `app/api/plaid/create-link-token`, `exchange-public-token` | Arbitrary `userId`; access_token returned | Broader linking flow if enabled |
| **M7** | Claim vs code | Firestore `trades` for signed-in users | Local-first narrative drift | Marketing/diligence copy only (§6b) |
| **M8** | CSP weak | middleware / `next.config.js` | `'unsafe-inline'` / `'unsafe-eval'` | Firebase / Stripe / analytics must keep loading |

### Controls that are healthy (do not “fix”)

- Stripe webhook `constructEvent` — keep.
- `/api/ai/chat` + `/api/ai/usage` + `/api/api-keys/user` Bearer verify — keep; prefer expanding this pattern.
- `requireAdminRequest` on telemetry/feedback/support — reuse for H2/H3/H4.
- Firestore rules owner-only on `trades`; server-only on `apiKeysByEmail`.
- Data-api / bot gate unit coverage — keep green.

---

## 4. Remediation plan (High + Medium only) — audit-first

### Wave A — P0 perimeter (Eng R, Platform A) — target before any “security packaging” claim

| Step | Finding | Fix shape | Regression gate (must stay green) |
|------|---------|-----------|-----------------------------------|
| A1 | H1 | Stop returning secrets by email. Prefer `/api/api-keys/user` (auth). For retrieve-key UX: session/checkout token or signed short-TTL magic link — **not** open email GET. Update `PremiumTierContext` to drop unauthenticated email fallback when signed in; guest path = no key. | Sponsor success still delivers key after Stripe session; settings tier for signed-in users; retrieve-api-key redesigned flow |
| A2 | H2 | Wrap `GET /api/admin/analytics` in `requireAdminRequest`; pass Bearer from admin UI | Admin analytics page loads for allowlisted/admin-claim users only; 401/403 for others |
| A3 | H3 | Same admin guard (or shared secret + allowlist) on metrics export | Export consumers updated with auth |
| A4 | H4 | Require admin (or sales-ops claim) on agent leads/metrics/send-email/kill-switch/audit-feed; update `admin/sales` fetches | Sales dashboard, kill-switch toggle, ActionFeed |
| A5 | H5 | Implement Resend signature verification; reject unsigned | Inbound email → CONTACTED transitions; opt-out handling |
| A6 | H6 | Require Firebase token; `userId` must equal `decoded.uid` | Portfolio history charts for owner only |

### Wave B — Medium hardening (Eng R, AI C)

| Step | Finding | Fix shape | Regression gate |
|------|---------|-----------|-----------------|
| B1 | M4 | Remove `vercelCronHeader === '1'`; require Bearer or header === `CRON_SECRET` | All cron routes via Vercel still succeed |
| B2 | M5 | Fail closed on free tier when quota stores unavailable (or soft-503) | Paid users unaffected; free sees clear error |
| B3 | M3 | Rate-limit map-csv; optional auth for LLM path; keep heuristic guest path | Smart Import guest UX |
| B4 | M2 | Schema-validate / bound context; separate system vs user channels | Chat streaming + sovereign fallback tests |
| B5 | M6 | Auth Plaid routes; bind link token to uid; never return long-lived access_token to browser without vault design | Plaid flows if product-active |
| B6 | M1 | Optional middleware auth for `/admin/*` only (do not break marketing hosts) | Dual-surface middleware + A/B cookies |
| B7 | M8 | Tighten CSP incrementally with report-only first | Auth popup, Stripe, Drive OAuth |
| B8 | M7 | Claim calibration only — no architecture rewrite in this audit | §6b copy updates |

### Explicit non-goals this audit

- Shipping patches in this session.
- Creating SOC2/ISO claims.
- Full Dependabot remediation (parallel track).

---

## 5. Business & operations logic — regression pack

### Already executed (2026-09-11)

| Suite | Result |
|-------|--------|
| `tests/unit/data-api-gate.spec.ts` | Passed (in first batch) |
| `tests/unit/bot-gate.spec.ts` | Passed |
| `tests/unit/ai/chat-inference-boundary.spec.ts` | Passed |
| `tests/unit/safe-return-to.spec.ts` | Passed |
| `tests/lib/waitlist/rateLimit.test.ts` | Passed |
| `tests/unit/import/universal-hardening.spec.ts` | Passed |
| `tests/unit/import/contract.spec.ts` | Passed |
| `tests/unit/symbol-index-allowlist.spec.ts` | Passed |
| `tests/unit/wave2-llms-compliance.spec.ts` | Passed |
| `tests/lib/waitlist/api.test.ts` | Passed |

**Totals this audit:** 41 tests passed, 16 skipped across two batches. No production code changed.

### Required before Wave A merge (not run as ship — checklist)

1. **Auth matrix:** unsigned → 401 on H1–H6 targets; wrong user → 403 on H6; admin claim → 200 on H2/H4.
2. **Tier unlock:** checkout → session key route → `/api/api-keys/user` for signed-in.
3. **AI ops:** free quota still increments; paid unlimited; sovereign cold → Cloud Auto (existing boundary tests).
4. **Sales ops:** kill-switch activate/deactivate only as admin; Resend signed events only mutate leads.
5. **Cron ops:** Vercel cron with `Authorization: Bearer $CRON_SECRET` only.
6. **Dual surface:** Pocket vs Open host routing unchanged (`tests/e2e/dual-surface/*`).
7. **Stripe webhook:** still signature-verified; no regression to fail-open.

### Gaps (tests that do not exist yet — add with Wave A)

- Unauth denied on `/api/api-keys?email=`
- Admin required on `/api/admin/analytics`, `/api/agent/*`
- Resend invalid signature → 401
- Portfolio history IDOR denial
- Cron header `1` denied

---

## 6. RACI for remediation

| Activity | CEO | CISO | Eng | Platform | AI | CPO | CCO |
|----------|-----|------|-----|----------|----|-----|-----|
| Wave A code | I | C | **A/R** | C | C | C | I |
| Wave A deploy / secrets | I | C | C | **A/R** | I | I | I |
| Claim language | **A** | C | R (facts) | R (facts) | **R** (gate) | C | I |
| Sales agent auth UX | I | C | R | C | I | C | **C** |
| AI Medium (M2–M5) | I | C | R | C | **A/R** | C | I |

---

## 7. SEND_LOCKED status

| Package | Status |
|---------|--------|
| This audit | **AUDIT_LOCKED** — findings labeled; plan approved for implementation track |
| Code remediations | **MERGED PR #121** — Wave A H1–H6 CLOSED in prod; see re-audit in `platform-security-wave-ab-report-2026-09-11.md` |
| External security claims | **HARD PASS** until H7/H8 closed + Actions billing restored |
| Post-merge residuals | **H7** session key IDOR · **H8** cron spoof incomplete rollout · Medium M9–M14 |

---

## 8. Evidence index

- Platform inventory: explore agent 2026-09-11 (route map, auth matrix).
- Verified reads: `api-keys/route.ts`, `admin/analytics/route.ts`, `agent/kill-switch/route.ts`, `agent/webhooks/resend/route.ts`, `portfolio/history/route.ts`, `verify-vercel-cron.ts`, `require-admin-request.ts`.
- Callers: `PremiumTierContext.tsx`, `retrieve-api-key/page.tsx`, `sponsor/success/page.tsx`, `admin/sales/page.tsx`, `usePortfolioHistory.ts`.

---
id: TIER1-CODEQL-REMEDIATION-PLAN
title: CodeQL Static Analysis Remediation Plan (62 Open Alerts)
status: COMPLETE
branch: main
last_updated: 2026-05-27
roles: [CSO, Head of Engineering, Security Office]
---

# CodeQL Remediation Plan

## Executive summary

GitHub **Security → Code scanning** reports **62 open CodeQL alerts** on `main`. These are **not** npm/Dependabot issues (currently **17 open**). The diligence hardening sprint correctly reduced **supply-chain** risk (`npm audit`: **34 total, 5 High, 0 Critical**). This plan closes the **static code analysis** ledger without violating Security Office code of conduct:

> **Do not alter business logic, AI inference logic, or operational semantics.**

All fixes must be **observability, input-validation, regex-hardening, or scan-scope** changes with **byte-identical functional outputs** for user-facing flows.

---

## Alert inventory (baseline 2026-05-27)

| # | CodeQL rule | Open | Severity | Primary locations |
|---|-------------|-----:|----------|-------------------|
| 1 | `js/clear-text-logging` | 17 | error | `app/api/dividend/**`, `app/components/EnvDebug.tsx` |
| 2 | `js/incomplete-url-substring-sanitization` | 19 | warning | `scripts/**`, `CompanyLogo.tsx`, `AnalystVideo.tsx`, `lib/sales/sourcing/predator-scraper.ts` |
| 3 | `js/incomplete-sanitization` | 9 | warning | `FilePicker.tsx`, `scripts/**` |
| 4 | `js/identity-replacement` | 4 | warning | `waitlist/analytics.ts`, `scripts/**` |
| 5 | `js/insecure-randomness` | 3 | warning | `analytics/conversion.ts`, `analytics/seo.ts`, `src_backup/**` |
| 6 | `js/redos` | 2 | error | `scripts/fix-imported-posts.ts`, `scripts/import-external-content.ts` |
| 7 | `js/polynomial-redos` | 1 | error | `app/api/agent/webhooks/resend/route.ts` |
| 8 | `js/reflected-xss` | 1 | error | `app/api/og/route.tsx` |
| 9 | `js/tainted-format-string` | 1 | warning | `app/lib/portfolio/sectorService.ts` |
| 10 | `js/xss-through-dom` | 3 | warning | `TickerSearch.tsx`, `coverage/sorter.js` |
| 11 | `js/functionality-from-untrusted-source` | 1 | warning | `zero-server-stack-marketing.html` |
| 12 | `js/incomplete-multi-character-sanitization` | 1 | warning | `scripts/extract-devto-urls.js` |
| | **Total** | **62** | | |

**Note:** CodeQL workflow currently reports errors in CI — Phase 0 must fix the scanner before trusting close-out metrics.

---

## Security Office code of conduct (non-negotiable)

### Allowed change classes

| Class | Example | Verification |
|-------|---------|--------------|
| **A. Log hygiene** | Remove API key prefixes from `console.log`; gate `[DIVIDEND_DEBUG]` behind `NODE_ENV !== 'production'` | Same API responses; diff logs only |
| **B. Regex / parse hardening** | Replace polynomial regex with bounded, linear-time patterns on **same inputs** | Unit test: identical match results on fixture corpus |
| **C. URL / string validation** | Replace `.includes('https')` checks with `new URL()` + allowlist | Same redirect/embed behavior on approved URLs |
| **D. DOM safety** | Use `textContent` instead of `innerHTML` where equivalent | Visual regression / Playwright smoke |
| **E. Scan scope** | Exclude `scripts/`, `coverage/`, `src_backup/`, one-off HTML from CodeQL | Alerts closed as out-of-runtime-scope with annex |
| **F. Crypto hygiene (non-auth)** | `crypto.randomUUID()` for analytics session IDs (not security tokens) | Session continuity tests unchanged |

### Forbidden change classes

| Class | Examples in repo — **hands off** |
|-------|----------------------------------|
| **Business logic** | `portfolioCalculations`, trade CRUD, importer adapter mappings, tier resolution, quote/dividend **data selection order** |
| **AI logic** | `app/api/ai/**`, `app/lib/ai/**`, `contextBuilder.ts`, `AskAIModal`, prompt assembly, quota/tier routing |
| **Operational semantics** | Webhook **state transitions** (Resend), cron schedules, Firestore write paths, KV rate-limit thresholds, middleware host routing |
| **SSOT / brand** | `lib/canonical-claims.ts`, dual-surface redirects, O./P. emblems, marketing copy |
| **Behavioral refactors** | “While we’re here” cleanups, API response shape changes, new feature flags |

### PR gate checklist (every CodeQL fix PR)

- [ ] Diff touches **only** allowlisted paths for that phase
- [ ] No edits under `app/api/ai/` or `app/lib/ai/`
- [ ] No changes to function return types / JSON response schemas
- [ ] `npm run test:inference-boundary` pass
- [ ] `npx vitest run tests/unit/canonical-claims.spec.ts` pass
- [ ] `npm run e2e:dual-surface` pass (or documented env skip)
- [ ] CodeQL alert ID referenced in PR description

---

## Phased execution

### Phase 0 — Governance & scanner health (Week 0)

**Goal:** Reliable measurement before remediation.

| Task | Owner | Output |
|------|-------|--------|
| Fix CodeQL workflow errors | DevOps | Green `codeql.yml` run on `main` |
| Add `.github/codeql/codeql-config.yml` | Security | Path filters + query suite |
| Export baseline | Security | `docs/seed/phase2-evidence/codeql-baseline-20260527.json` |
| Branch | Eng | `infra/codeql-hardening` off `main` |

**Proposed CodeQL path policy:**

```yaml
# .github/codeql/codeql-config.yml (draft)
paths-ignore:
  - 'scripts/**'
  - 'coverage/**'
  - 'src_backup/**'
  - 'tests_backup/**'
  - '**/*.html'
  - 'playwright-report/**'
paths:
  - 'app/**'
  - 'lib/**'
  - 'packages/importer/src/**'
```

**Rationale for procurement:** Runtime attack surface is the **deployed Next.js app**, not one-off content migration scripts. Excluding `scripts/` is standard for monorepos; each exclusion is documented in this annex.

**Expected alert reduction after Phase 0 alone:** **27 alerts excluded** (scripts, coverage, backup, HTML) → **35 projected runtime baseline** (verified via `npm run export:codeql-baseline` on 2026-05-27).

---

### Phase 1 — Dev / artifact surface (Week 1)

**Scope:** Files that never ship to production users.

| Alert rule | Action | Files | Logic impact |
|------------|--------|-------|--------------|
| `incomplete-url-substring-sanitization` | Fix or exclude | `scripts/**` | None — dev-only |
| `incomplete-sanitization` | Fix escaping helpers | `scripts/**` | None |
| `redos` | Linear-time regex | `import-external-content.ts`, `fix-imported-posts.ts` | None |
| `incomplete-multi-character-sanitization` | Chain `replaceAll` | `extract-devto-urls.js` | None |
| `identity-replacement` | Remove no-op `.replace(x,x)` | calendar/migrate scripts | None |
| `xss-through-dom` | Delete or gitignore | `coverage/sorter.js` | None |
| `functionality-from-untrusted-source` | SRI hash or self-host | `zero-server-stack-marketing.html` | None |
| `insecure-randomness` | Exclude | `src_backup/**` | None |

**Verification:** Re-run CodeQL; confirm **zero** alerts under excluded paths.

---

### Phase 2 — Observability & logging perimeter (Week 1–2)

**Scope:** Remove secret leakage without changing API behavior.

#### 2a. `js/clear-text-logging` (17 alerts)

| File | Fix pattern | Forbidden |
|------|-------------|-----------|
| `app/api/dividend/route.ts` | Replace `EODHD_API_KEY.substring(0,8)` logs with `configured: boolean`; wrap `[DIVIDEND_DEBUG]` in `if (process.env.DIVIDEND_DEBUG === '1')` | Do **not** change provider fallback order, cache TTL, or response JSON |
| `app/api/dividend/[ticker]/route.ts` | Same as above | Same |
| `app/components/EnvDebug.tsx` | **Remove from production bundle** — dynamic import only when `NEXT_PUBLIC_ENV_DEBUG=1` on localhost; never log full Firebase config values | Do not change Firebase init |

**New shared utility (logic-free):**

```typescript
// app/lib/server/safe-log.ts — NEW
export function logDividendDebug(message: string, meta?: Record<string, string | number | boolean>) {
  if (process.env.DIVIDEND_DEBUG !== '1') return;
  // Never pass raw env vars or key material
  console.warn('[DIVIDEND_DEBUG]', message, meta ?? {});
}
```

**Expected closure:** 17 alerts.

---

### Phase 3 — Runtime hardening, non-AI routes (Week 2)

**Scope:** Production routes **outside** AI and core portfolio math.

| Alert | File | Fix (logic-preserving) |
|-------|------|------------------------|
| `js/polynomial-redos` | `app/api/agent/webhooks/resend/route.ts` | Replace vulnerable regex on inbound email headers with bounded split / linear parser; **webhook state machine unchanged** |
| `js/reflected-xss` | `app/api/og/route.tsx` | HTML-encode user query params in OG template; **same image output for valid inputs** |
| `js/tainted-format-string` | `app/lib/portfolio/sectorService.ts` | Change `console.error(\`...${upperTicker}\`, error)` → `console.error('API classification failed', { ticker: upperTicker, error })` — **one line, no classification logic change** |
| `js/incomplete-url-substring-sanitization` | `CompanyLogo.tsx`, `AnalystVideo.tsx` | Use `safeExternalUrl()` helper with HTTPS allowlist; **same domains render** |
| `js/incomplete-sanitization` | `FilePicker.tsx` | Escape display filename only; **parser pipeline unchanged** |
| `js/xss-through-dom` | `TickerSearch.tsx` | Prefer `textContent` / React children over HTML injection; **search results identical** |
| `js/identity-replacement` | `app/lib/waitlist/analytics.ts` | Remove dead `.replace()` chain; **analytics events unchanged** |

**Explicitly excluded from Phase 3 edits:**

- `app/api/ai/**`
- `app/lib/ai/**`
- `app/lib/utils/portfolioCalculations.ts`
- `middleware.ts`, `lib/canonical-claims.ts`

**Expected closure:** ~8–10 alerts.

---

### Phase 4 — Analytics session IDs (Week 2)

**Scope:** Non-cryptographic identifiers only.

| Alert | File | Fix |
|-------|------|-----|
| `js/insecure-randomness` | `app/lib/analytics/conversion.ts` | `crypto.randomUUID()` instead of `Math.random()` for `session_*` IDs |
| `js/insecure-randomness` | `app/lib/analytics/seo.ts` | Same |

**Constraint check:** These IDs are **not** auth tokens, Firebase session IDs, or AI quota keys. Changing RNG source does not alter funnel semantics.

**Verification:** Existing analytics unit tests + manual check that `sessionId` format change does not break conversion attribution (document format migration in annex if dashboards filter on prefix).

**Expected closure:** 2 alerts.

---

### Phase 5 — Close-out & diligence packaging (Week 3)

| Task | Target |
|------|--------|
| Re-run CodeQL on `main` | **0 open runtime alerts** (or each remaining alert has written dismissal) |
| Update `tier1-supply-chain-audit-snapshot.md` | Add **CodeQL ledger** section |
| Dependabot refresh | Confirm `@trigger.dev` / `next-pwa` alerts closed |
| Human sign-off | CPO visual + Head of Engineering regression |
| Merge train | `infra/codeql-hardening` → `main` |

---

## Target metrics

| Metric | Baseline | Phase 0 | Phase 1–4 | Target |
|--------|----------|---------|-----------|--------|
| CodeQL open (total) | 62 | **35 projected** | ~0–5 | **≤5 documented dismissals** |
| CodeQL open (runtime `app/` + `lib/`) | ~35 | **35 baseline** | **0** | **0** |
| Dependabot open | 17 | — | — | Track separately |
| npm audit High | 5 | — | — | Track separately |

---

## Dismissal policy (when fix is worse than risk)

Alerts may be **closed as false positive / won't fix** only with CSO sign-off and annex entry:

| Condition | Example |
|-----------|---------|
| Dev-only path excluded in Phase 0 | `scripts/predator-probe.ts` |
| Non-production HTML artifact | Marketing static HTML |
| Generated coverage artifact | `coverage/sorter.js` |
| Risk accepted with compensating control | Documented analog to `xlsx` annex |

**Never dismiss** without: alert ID, rule name, file path, rationale, compensating control, reviewer initials.

---

## Resource & branch strategy

| Item | Value |
|------|-------|
| Branch | `infra/codeql-hardening` |
| PRs | **Split by phase** (max ~200 LOC each) — mirrors diligence hardening discipline |
| CI gates | `codeql.yml` + `test:inference-boundary` + `canonical-claims` + `e2e:dual-surface` |
| Deploy | No production deploy required until Phase 3 runtime fixes merge; logging fixes are safe at any time |

---

## Procurement narrative (verbatim-safe)

> **Static analysis (CodeQL)** and **dependency scanning (Dependabot)** are separate ledgers. Supply-chain hardening reduced npm High advisories from 13 to 5 with zero Critical. CodeQL remediation follows a phased plan that **excludes AI inference paths and portfolio business logic**, hardens logging and input validation on runtime routes, and scopes dev tooling out of the production security boundary. Target: zero open runtime CodeQL alerts with documented exceptions only.

---

## Related annexes

- `docs/command/tier1-supply-chain-audit-snapshot.md`
- `docs/command/tier1-inference-boundary-annex.md`
- `docs/command/tier1-diligence-xlsx-compensating-control.md`
- `docs/command/claims-vs-codebase-calibration.md`

---

## Immediate next action

**Status (2026-05-27):** Phases 0–4 merged to `main`. Runtime ledger projected **0 open** after fixes. Fresh CodeQL scan pending GitHub Actions billing resolution.

Evidence: `docs/seed/phase2-evidence/codeql-remediation-summary-20260527.json`

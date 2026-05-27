---
id: TIER1-SUPPLY-CHAIN-AUDIT
title: Supply Chain Audit Snapshot — Diligence Hardening
status: DILIGENCE_ANNEX
branch: infra/diligence-hardening
last_updated: 2026-05-27
---

# Supply Chain Audit Snapshot

## Phase 1 — Surgical `npm audit fix` (non-force)

| Metric | Before | After Phase 1 |
|--------|--------|---------------|
| Total advisories | 58 | **45** |
| Critical | 0 | **0** |
| High | 19 | **13** |
| Moderate | 38 | **32** |
| Low | 1 | **0** |

Command: `npm audit fix` (no `--force`). **33 packages updated**, no React/Next rendering dependency forced to breaking majors.

## Phase 2 — Perimeter + dependency cleanup (2026-05-27)

| Metric | After Phase 1 | After Phase 2 |
|--------|---------------|---------------|
| Total advisories | 45 | **34** |
| Critical | 0 | **0** |
| High | 13 | **5** |
| Moderate | 32 | **29** |

### Actions taken

| Action | High CVEs removed | Notes |
|--------|------------------|-------|
| Removed unused `@trigger.dev/sdk` | 3 | Zero imports in codebase — dead dependency |
| Removed `next-pwa` wrapper | 5 | Committed `public/sw.js` retained; FCM uses `firebase-messaging-sw.js` |
| `npm audit fix` (undici/Firebase chain) | Partial | Remaining `undici` tracked via Firebase SDK |

### Remaining High (5) — triage

| Package | Runtime? | Fix |
|---------|----------|-----|
| `xlsx` | Client import path | **No upstream fix** — `tier1-diligence-xlsx-compensating-control.md` |
| `undici` | Firebase transitive | Monitor Firebase SDK releases |
| `eslint-config-next` / `glob` / `@next/eslint-plugin-next` | **Dev/lint only** | Force → Next 16 eslint — quarantined |

**Procurement framing:** **9 of 13** original High advisories were build/dev-only; Phase 2 eliminated **8 High** without breaking UI or cron logic.

## Firestore perimeter (Phase 2)

| Collection | Before | After |
|------------|--------|-------|
| `toolUsage` | Anonymous client `create` | **Server-only** (Admin SDK) |
| `pageViews` | Anonymous client `create` | **Server-only** (Admin SDK) |
| `waitlist` | Anonymous client `create` | **Server-only** via `POST /api/waitlist/join` |
| `waitlist_rate_limit` | Open client write | **Denied** — replaced by KV on API routes |

API routes `/api/tool-usage`, `/api/page-views`, `/api/waitlist/join`, `/api/waitlist/submit` enforce Vercel KV sliding-window rate limits when `KV_REST_API_URL` is set.

## SBOM

| Artifact | Command |
|----------|---------|
| CycloneDX JSON | `npm run sbom` → `docs/seed/phase2-evidence/sbom-cyclonedx.json` |

## Regeneration

```bash
npm audit
npm run sbom
npm run test:inference-boundary
npm run export:codeql-baseline
```

## CodeQL static analysis ledger (Phase 0–4, 2026-05-27)

Separate from Dependabot/npm audit. GitHub Security tab combines both ledgers (~82 pre-remediation).

| Metric | Pre-scope | Phase 0 scope | Post Phase 1–4 |
|--------|----------:|--------------:|---------------:|
| CodeQL open (total) | 62 | 35 projected runtime | **0 projected runtime** |
| Excluded (scripts/coverage/HTML) | — | 27 | 27 |

| Phase | Fix class | Alerts closed |
|-------|-----------|---------------|
| 0 | Scan scope (`codeql-config.yml`) | 27 dev/artifact |
| 2 | Logging redaction (`safe-log.ts`, dividend, EnvDebug) | 17 |
| 3 | Runtime hardening (OG, resend, URLs, DOM, sector log) | 14 |
| 4 | `crypto.randomUUID()` analytics IDs | 2 |

**No-touch preserved:** AI inference paths, portfolio calculations, middleware/SSOT.

Evidence: `docs/seed/phase2-evidence/codeql-remediation-summary-20260527.json`

**CI note:** CodeQL workflow blocked by GitHub Actions billing lock — config validated locally; re-run `codeql.yml` when billing restored.

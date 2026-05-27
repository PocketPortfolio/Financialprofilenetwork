---
id: TIER1-SUPPLY-CHAIN-AUDIT
title: Supply Chain Audit Snapshot — Diligence Hardening
status: DILIGENCE_ANNEX
branch: infra/diligence-hardening
last_updated: 2026-05-27
---

# Supply Chain Audit Snapshot

## Surgical `npm audit fix` (non-force)

| Metric | Before | After surgical fix |
|--------|--------|-------------------|
| Total advisories | 58 | **45** |
| Critical | 0 | **0** |
| High | 19 | **13** |
| Moderate | 38 | **32** |
| Low | 1 | **0** |

Command: `npm audit fix` (no `--force`). **33 packages updated**, no React/Next rendering dependency forced to breaking majors.

## Isolated — requires breaking change or no upstream fix

| Package / chain | Severity | Action |
|-----------------|----------|--------|
| `xlsx` | High | **Accepted risk** — compensating controls in `tier1-diligence-xlsx-compensating-control.md` |
| `@trigger.dev/sdk` → `@opentelemetry/sdk-node` | High | Dev/cron only; `--force` would bump to v4.4.6 — **quarantined** for post-diligence |
| `eslint-config-next` → `glob` | High | Dev-only lint chain; force → Next 16 eslint config — **quarantined** |
| `next-pwa` → `serialize-javascript` | High | PWA build chain; force → next-pwa@2 — **quarantined** |
| `vitest` / `vite` / `esbuild` | Moderate | Dev/test only; force → vitest@4 — **quarantined** |
| `firebase` → `undici` | High | Partially transitive; monitor Firebase SDK releases |
| `drizzle-kit` → esbuild | Moderate | Dev tooling only (not production runtime per architecture rules) |

## SBOM

| Artifact | Command |
|----------|---------|
| CycloneDX JSON | `npm run sbom` → `docs/seed/phase2-evidence/sbom-cyclonedx.json` |

## Regeneration

```bash
npm audit > docs/seed/phase2-evidence/npm-audit-$(date +%Y%m%d).txt
npm run sbom
```

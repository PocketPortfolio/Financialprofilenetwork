---
id: OP-GROWTH-B2B-STAGE2-AEO-GEO-2026-05-16
title: Stage 2 — AEO / GEO SSOT + llms.txt drift discipline
status: OPS_PLAYBOOK
programme_ref: growth-b2b-open-market-acceleration-programme.md
last_updated: 2026-05-16
---

# Stage 2 — AEO / GEO lock (procurement + model-facing copy)

## SSOT for numbers and founder lines

All **numeric claims**, **founder credential lines**, **Open route inventory**, and **GitHub submission URLs** shown on Open-facing surfaces, procurement decks, Talk tracks, and outbound briefs **must** come from [`lib/canonical-claims.ts`](../../lib/canonical-claims.ts):

| Constant / export | Use |
|-------------------|-----|
| `NUMBERS_SNAPSHOT` | Quantified metrics (TRAC row IDs are audit hooks) |
| `FOUNDER_CREDENTIALS_ABBA`, `PERSON_ABBA` | Founder biography / receipts |
| `OPEN_ALIAS_ROUTES`, `OPEN_URLS` | Canonical Open URLs (length and paths guarded by Vitest) |
| `DESIGN_CHALLENGE.github.submissionThread` | GitHub Discussions submission thread |

**Do not** round, reinterpret, or substitute alternate figures (e.g. legacy £4B vs SSOT £7B) without updating **`canonical-claims.ts`** and regenerating dependent artefacts.

## `build:llms` and committed output

- Generator: [`scripts/build-llms-txt.ts`](../../scripts/build-llms-txt.ts)
- Outputs: **`public/llms.txt`**, **`public/open/llms.txt`**
- Command: **`npm run build:llms`** (also runs as part of `npm run build`)

Any PR that changes trust metrics, Open URLs, or challenge copy in **`canonical-claims.ts`** must:

1. Run **`npm run build:llms`**
2. Commit updated **`public/*.txt`** files when bytes change
3. Ensure CI **`seo-validation`** (llms drift guard) stays green — see [`.github/workflows/seo-validation.yml`](../../.github/workflows/seo-validation.yml)

## Growth copy-review checklist (minimal)

- [ ] Every statistic cites a **`NUMBERS_SNAPSHOT`** row ID or explicit SSOT field name in speaker notes.
- [ ] Fork / submission links match **`DESIGN_CHALLENGE.github`** or **`CHALLENGE_V1_URLS`** in [`scripts/lib/challenges/design-partnership-v1.ts`](../../scripts/lib/challenges/design-partnership-v1.ts).
- [ ] No **`ppi-meter`** compliance claims (roadmap-only per programme doc).

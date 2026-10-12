---
id: OP-CMD-SHIP-SURFACE-BOUNDARY-2026-10-12
title: Ship surface boundary — product git vs local ops/business/docs
status: ACTIVE · ORG LOCK
date: 2026-10-12
owners: [Platform (R/A deploy surface), Eng (R app code), Marketing (I), CEO (A exceptions)]
raci: docs/command/roles/RACI.md
---

# Ship surface boundary (org lock)

**Verdict:** Vercel/GitHub ship **product runtime only**. Operations, commercial, and document assets stay local or on Drive — they must not ride product deploys.

## Ships (allow)

| Surface | Examples |
|---------|----------|
| App / API / lib / tests | Attribution, crons, Open/Pocket routes |
| Public product assets required at runtime | `public/open/llms.txt`, site icons, shipped landing plates already on the money path |
| Thin Command locks that gate **code** behaviour | This file; claim SSOT already tracked for CI |

## Does not ship (deny — `.gitignore` + review)

| Class | Paths / patterns | Owner |
|-------|------------------|-------|
| Command / org / OI production docs | `docs/command/**` except explicitly tracked code gates; `docs/command/roles/` | CEO / Platform |
| Outreach & commercial leave-behinds | `docs/outreach/` | CCO |
| Seed / investor decks | `docs/seed/` | CEO |
| Media packages | `docs/media/` | Creative |
| Marketing paste / comps / tmp | `docs/marketing/LINKEDIN-*`, `oi-*`, `_tmp*`, `linkedin-*/` | Marketing |
| Ops scripts & deck generators | `scripts/ops-*`, `scripts/generate-*-brief*`, `*-pptx*`, AssumeAI edit scripts | Platform / Creative |
| Audit dumps / reports | `npm-audit*.json`, `dependabot-alerts.json`, `exports/`, `playwright-report/` | Platform |
| Heavy public marketing binaries | `public/marketing/**/*.mp4`, large GIFs, demo `.bak` | Marketing / Platform |

## RACI one-liners

* **Platform (A/R):** Refuse deploy PRs that add ops/business/docs/media; keep `.gitignore` ship-boundary current.
* **Eng (R):** PR = runtime change + tests. No drive-by Command packs.
* **Marketing (R content, I git):** Paste locks and UTM SSOTs may live locally; only product telemetry code merges.
* **CCO / CEO:** Outreach and decks never land on `main` as deploy payload.
* **Head of AI:** Claim gate applies to **external** copy; does not require packing OI edit locks into the deploy.

## PR checklist (Platform)

1. Diff is app/lib/tests/(required) public runtime only — or an explicit exception signed by CEO.
2. No new `docs/outreach`, `docs/seed`, `docs/media`, OI edit packs, or marketing binaries.
3. `npm run lint` + typecheck green before merge.

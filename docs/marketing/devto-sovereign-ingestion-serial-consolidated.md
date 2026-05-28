# dev.to — Sovereign Ingestion & Stateless Inference (12-Part Series Consolidation)

**Role:** Chief AI Architect · Head of AI & Community Operations  
**Cover (upload to dev.to):** `public/marketing/devto-sovereign-ingestion-serial-cover.png`  
**Live URL (after publish):** host at `https://www.pocketportfolio.app/marketing/devto-sovereign-ingestion-serial-cover.png`  
**Regenerate cover:** `node scripts/generate-devto-sovereign-ingestion-cover.mjs`

**Copy everything below the `---` frontmatter block into the dev.to editor.**

---

```yaml
---
title: "Sovereign Ingestion & Stateless Inference: The 12-Part Architecture Playbook (Consolidated)"
published: false
description: "We shipped a 12-part CoderLegion serial on data-minimised wealth AI — dual-surface routing, bounded LLM context, MIT importer, and deploy gates that bind marketing to grep. Full consolidation for dev.to."
tags: architecture, opensource, ai, nextjs
cover_image: https://www.pocketportfolio.app/marketing/devto-sovereign-ingestion-serial-cover.png
canonical_url: https://www.pocketportfolio.app/book/sovereign-intelligence
series: Sovereign Ingestion
---
```

---

We just finished a **12-part technical serial** on [CoderLegion](https://coderlegion.com/groups/openfi-builders) titled **Sovereign Ingestion & Stateless Inference: The Architecture of Data-Minimised Wealth Intelligence**.

This post is the **dev.to consolidation** — one readable map of the whole arc, written from the lens of **Chief AI Architect** and **Head of AI & Community Operations**. If you are building fintech AI, open-source ingestion, or procurement-facing infra narratives, treat this as the table of contents **plus** the claims discipline we enforce before anything hits production.

> **Calibration rule:** Every outward claim must survive `clone-and-grep` against our repo. We maintain a governance ledger (`claims-vs-codebase-calibration`) so marketing ambition cannot outrun middleware, Firebase persistence, or the inference route.

---

## Why this series exists

Finance AI has a trust problem that is really an **architecture** problem:

1. Teams mirror full ledgers into cloud warehouses “so the model can reason.”
2. Marketing says “local-first” while signed-in users sync to Firebase.
3. Procurement hears “AI never sees your data” — which fails the moment a bounded context string crosses the wire.

We open-sourced the **workflow** and the **boundary**, not a bag of UI widgets:

- **Pocket Portfolio** — B2C terminal and **live adversarial test harness**
- **Open Portfolio** — B2B / procurement gateway on the **same deployment**
- **`@pocket-portfolio/importer`** — MIT npm package for broker CSV normalisation

The serial documents how those pieces fit together with **file-level receipts**.

---

## One deployment, two audiences (Part 1)

Procurement asks: “Is Open a separate codebase?” **No.** One Next.js monorepo, one Vercel project, **host-aware routing** in `middleware.ts`.

| Surface | Host | Route tree | Role |
| --- | --- | --- | --- |
| Pocket | `www.pocketportfolio.app` | Default App Router | Retail harness |
| Open | `www.openportfolio.co.uk` | `app/open/*` rewrites | Engineering + procurement narrative |

**Receipt curls** (post-deploy):

- `www.pocketportfolio.app/architecture` → **301** to Open architecture
- `www.openportfolio.co.uk/dashboard` → **307** to Pocket dashboard

SSOT: `lib/canonical-claims.ts`. Do **not** claim two production codebases.

---

## Sanitization by construction (Part 2)

The Ask AI path uses `buildPortfolioContext` in `app/lib/ai/contextBuilder.ts` — our **Edge Compiler** (term of art, not a separate package).

It emits a **fixed template**: portfolio totals + **top 10** holdings by value. No raw trade rows. No account identifiers. **Structural exclusion**, not regex roulette on CSV exports.

**Calibrated language:**

- ✅ “The LLM receives a **bounded, user-approved aggregate context**.”
- ❌ “AI never sees your data.” (The model also gets your message, optional attachments, and route-defined quote injection.)

Open DevTools → Network on a typical Ask AI question. You should see a **short** `context` string — not your full export.

---

## Stateless inference pipeline (Part 3)

`POST /api/ai/chat` builds the prompt, streams the response, and **does not persist the portfolio context string** as a ledger row. Quota and tier metadata may use Firestore/KV — that is a separate **metadata lane**.

```text
Trades in memory
  → buildPortfolioContext()
  → POST /api/ai/chat (stream)
  → quota metadata only (not portfolio payload DB)
```

Engineering record: `docs/IP-TECHNICAL-MECHANISMS.md`.

---

## Persistence honesty (Part 4)

“Local-first” here means **interaction and ingestion default to the device** — not “no server for everyone.”

| Mode | Authoritative trades | Notes |
| --- | --- | --- |
| Guest | `localStorage` | Namespaced keys, quota handling |
| Authenticated | **Firebase** | Cloud-authoritative history |
| IndexedDB | Firestore SDK **cache** | Not the master vault for all users |
| Zustand persist | UI prefs only | `partialize` — not position blobs |
| Google Drive | User-owned JSON file | Dumb sync lane, not app logic server |

We fail closed on overclaims like “fully local portfolio” for signed-in workflows.

---

## Standardising ingestion (Part 5)

`@pocket-portfolio/importer` (MIT) is the open-core transformation lane: broker adapters → normalised `Trade[]`, parsed **client-side** where our architecture demands it.

For unknown CSV shapes, column mapping sends **headers + sample rows only** — full files stay on device (same minimisation instinct as Ask AI).

**Community ops:** we point engineers to GitHub, Discussions, and `README-OSS-WORKFLOW.md` — **not** a fictional in-app plugin marketplace.

---

## The continuous evaluation harness (Part 6)

Pocket’s landing (`app/landing/page.tsx`) and `CommunityContent` exercise import flows under real retail pressure. That velocity feeds SDK hardening on Open — broker edge cases become adapter PRs, not slide-deck hypotheticals.

Scale receipts (Whale Watch, managed-asset substrate) prove **volume seen** — they do not prove “zero cloud.”

---

## Unit economics at the edge (Part 7)

We deflate the **LLM hop** by aggregating in-browser before paid inference — avoiding the pattern of mirroring every user’s full ledger into a server-side analytics DB for each question.

Firebase still stores auth trades. Vercel still hosts the route. The win is **narrower portfolio retention on the inference path**, not a fiction of zero infrastructure.

---

## Limited-scope processor posture (Part 8)

> Engineering narrative only — not legal advice. Contract language requires legal + engineering sign-off.

We map GDPR **data minimisation** (Art. 5(1)(c)) to mechanisms auditors can grep:

- Bounded context builder
- Stateless portfolio payload handling in `/api/ai/chat`
- Truncated CSV mapping preview
- Compiled trust lines in programmatic `llms.txt`

Phrase authorised on technical surfaces: **Limited-Scope Processor** — smaller technical scope by design, not zero regulatory obligation.

---

## Search moat / GEO discipline (Part 9)

`scripts/build-llms-txt.ts` regenerates **`public/llms.txt`** (Pocket) and **`public/open/llms.txt`** (Open) from `lib/canonical-claims.ts`.

Deploy gate **D7**: if claims change but regenerated manifests are not committed, CI drift guard fails. Machine-readable identity is **compiled output**, not hand-wavy hero copy.

---

## Production gates prevent strategic drift (Part 10)

`docs/command/deploy-production-gates.md` chains narrative to ship:

| Gate tier | Examples |
| --- | --- |
| **CTO** | Framework parity with host/Open changes; canonical host SSOT |
| **DevOps** | lint, typecheck, `canonical-claims.spec.ts`, build parity, Open 404 audit, llms drift |
| **Product** | HTTPS smokes on both hosts; redirect matrix |
| **Release** | merge → deploy → DNS → GSC sitemaps |

No new technical superlative in campaigns until these pass.

---

## Terminal UX narrative (Part 11)

Design encodes **terminal / pro reference manual** gravity: `var(--accent-warm)` / `#f59e0b`, dense tables, `var(--border-subtle)` — **no generic fintech blue** (`#0070f3`, `bg-blue-500`).

UI metaphor does not change Firebase truth. Copy on `/learn/local-first` must stay calibrated.

---

## The sovereign financial interaction workflow (Part 12)

Three inspectable pillars:

1. **Ingestion + transformation** — `packages/importer`, OpenBrokerCSV
2. **Inference boundary** — `contextBuilder.ts` → `/api/ai/chat` → IP mechanisms doc
3. **Dual-surface GTM** — middleware, canonical claims, deploy gates

**Procurement five-minute audit:**

1. Network tab → bounded `context` on Ask AI
2. `curl -IL` redirect matrix
3. `git diff` on `llms.txt` after claim edits
4. `packages/importer/src/registry.ts` adapter list

If we cannot demo it in five minutes of clone-and-grep, it does not belong in an RFP.

---

## Full serial index (CoderLegion)

| Part | Title | Focus |
| --- | --- | --- |
| 1 | Invariant Boundaries | `middleware.ts`, dual surface |
| 2 | Sanitization by Construction | `contextBuilder.ts` |
| 3 | Stateless Inference | `/api/ai/chat`, IP doc |
| 4 | Persistence Honesty | Guest / Firebase / cache matrix |
| 5 | Ingestion Interface | `@pocket-portfolio/importer` |
| 6 | Evaluation Harness | B2C landing stress surface |
| 7 | Unit Economics at Edge | Client aggregation before LLM |
| 8 | Limited-Scope Processor | Minimisation by architecture |
| 9 | Search Moat | `build-llms-txt.ts` |
| 10 | Production Gates | CTO / DevOps / Product / release |
| 11 | Terminal UX | Amber design system |
| 12 | Interaction Workflow | Synthesis + honest roadmap |

**In-repo paths:** `content/coderlegion-sovereign-ingestion-serial/01-*.md` … `12-*.md`  
**Covers:** `public/book-assets/sovereign-ingestion-covers/ing-01.png` … `ing-12.png`

---

## Community: how to engage

As Head of AI & Community Operations, here is what we actually want from dev.to and CoderLegion readers:

1. **Clone the importer** — add or fix a broker adapter; open a PR.
2. **Challenge our claims** — if prose outruns `middleware.ts`, file an issue; we treat that as a gift.
3. **Join [OpenFi Builders on CoderLegion](https://coderlegion.com/groups/openfi-builders)** — serial discussion threads and design-partner intros.
4. **Run the five-minute audit** on your own stack — bounded context before inference is portable beyond our repo.

We are building **contributor loops**, not pretending a runtime extension economy already exists in `app/`.

---

## Red-team phrases (do not use for signed-in flows)

| ❌ Overclaim | ✅ Calibrated replacement |
| --- | --- |
| Zero server footprint | Hybrid persistence; stateless **inference** hop |
| AI never sees your data | Bounded aggregate context + user message |
| IndexedDB is our database | Guest localStorage; auth Firebase; IDB = SDK cache |
| No cloud | Firebase, Vercel, LLM APIs are cloud-adjacent |
| Sovereign AI OS | Tie “sovereign” to **technical nouns** with receipts |

---

## Resources

- 📖 [Sovereign Intelligence book](https://www.pocketportfolio.app/book/sovereign-intelligence)
- 🏗️ [Open Portfolio](https://www.openportfolio.co.uk) · [OpenBrokerCSV](https://www.openportfolio.co.uk/openbrokercsv)
- 📦 [npm: @pocket-portfolio/importer](https://www.npmjs.com/package/@pocket-portfolio/importer)
- 🧪 [Try Pocket Portfolio](https://www.pocketportfolio.app)
- 💬 [CoderLegion — OpenFi Builders](https://coderlegion.com/groups/openfi-builders)

---

**Questions for the community:** What is the weakest link in your finance-AI stack — ingestion normalisation, inference payload size, or host/audience routing? Drop a comment; we optimise the serial’s next wave from real threads.

---

*Consolidation of the 12-part CoderLegion serial **Sovereign Ingestion & Stateless Inference**. Governance SSOT: claims-vs-codebase-calibration ledger. Cover: amber terminal on `#09090b`, no fintech-blue gradients.*

---
id: OP-CLAIMS-CALIBRATION-2026-05-20
title: Ecosystem Positioning & Codebase Reality Alignment Ledger
status: EVALUATION_RECORD
deployment: NOT_CLEARED_FOR_PRODUCTION
last_updated: 2026-05-20
roles: [Engineering, Growth, FounderOps, Procurement-facing copy]
---

# Claims vs codebase calibration

This ledger is the **governance SSOT** between **market narrative** (Consultant 1 themes) and **verifiable system behaviour** (Consultant 2 discipline). All outward-facing campaigns, landing copy, investor decks, and grant annexes should **pass through** this document before production deploy.

**Doctrine (ratified):** Narrative ambition must be constrained by verifiable architectural truth.

**Core moat thesis (evidence-backed):** We open-source a **financial interaction workflow** and an **architectural boundary** (data minimisation on the inference path), not merely a bag of UI components.

---

## 1. Dual-surface reality (one deployment)

| Surface | Role in prose | Code / config reality |
|---------|----------------|------------------------|
| **Pocket Portfolio** | Consumer terminal; live adversarial test harness for ingestion + UX | Default App Router product routes; canonical host `www.pocketportfolio.app` per `lib/canonical-claims.ts` |
| **Open Portfolio** | Developer / procurement gateway; infrastructure narrative | `app/open/*`; Open hosts + redirects in `middleware.ts` + `next.config.js`; canonical `www.openportfolio.co.uk` |

**SSOT:** `lib/canonical-claims.ts`, `docs/command/deploy-production-gates.md`, `docs/command/production-readiness-dual-surface-2026-05-16.md`.

Do **not** imply two separate production codebases. It is **one monorepo**, **one Vercel-style deployment**, **host-aware routing**.

---

## 2. Persistence: approved vs overstated claims

### Ground truth (do not contradict in marketing)

| User mode | Authoritative store for trades / portfolio working set | Code touchpoints |
|-----------|--------------------------------------------------------|-------------------|
| **Guest (unauthenticated)** | Browser `localStorage` (namespaced keys, quota handling) | `localPortfolioStore` patterns documented in `content/coderlegion-sovereign-engineering-serial/05-local-first-browser-vault.md` |
| **Authenticated** | **Firebase** (cloud) as authoritative trade history; UI still aggregates client-side for Ask AI | `useTrades` → `TradeService.getTrades` (see same serial Part 5) |
| **Preferences** | Zustand `persist` with **`partialize`** — chart/filters only, not full position blobs | `portfolioStore` (serial Part 5) |
| **IndexedDB** | Primarily **Firestore client SDK cache**; cleared on logout where implemented — **not** “the portfolio vault” for all users | `useAuth` / Firestore persistence teardown (serial Part 5) |
| **Google Drive** | **Sovereign Sync**: user-owned file (`pocket_portfolio_db.json`) as dumb storage / sync lane — not a server executing business logic | `docs/DRIVE_EDIT_SYNC_ISSUE_GOOGLE_PARTNERS.md`, architecture copy in `app/architecture/page.tsx` |

### Approved short phrases (external)

- **Client-side aggregation by construction** for LLM context (totals + top-N; no raw ledger in the inference payload).
- **No PII and no account identifiers on the Pocket Analyst inference path** as designed in `app/lib/ai/contextBuilder.ts`.
- **Stateless inference handler** for portfolio text: request payload used only to build the prompt and stream the response; see `app/api/ai/chat/route.ts` header comment and `docs/IP-TECHNICAL-MECHANISMS.md`.

### Prohibited / red-team phrases (external)

Do **not** use without legal + engineering sign-off:

| Phrase | Why it fails calibration |
|--------|---------------------------|
| “Zero server footprint” / “fully local portfolio” | Auth users: **Firebase** is authoritative for trades. |
| “IndexedDB is our database” (blanket) | Misstates guests vs auth vs cache. |
| “AI never sees your data” | Overbroad: model sees **bounded, user-approved aggregate context** + user message + optional attachment + server-injected quotes per route logic. |
| “No cloud” | Firebase, Vercel, LLM APIs, optional Redis/KV — all cloud-adjacent. |
| “Bloomberg replacement” / “AI-native Bloomberg” | Competitor + capability implication; UX gravity not proven by infra alone. |
| “Sovereign AI OS” / vague “sovereignty” without technical noun | Reads ideological; procurement red flag. |

---

## 3. Inference boundary (workflow moat) — code receipts

**Flow (accurate):**

```text
Raw client corpus (trades / positions in memory)
  → buildPortfolioContext()  [deterministic, fixed schema]
  → bounded string in POST body
  → /api/ai/chat  [stateless w.r.t. portfolio payload; stream out]
  → optional Firestore/KV quota + analytics metadata only
```

| Mechanism | Location |
|-----------|----------|
| Context engine (“sanitization by construction”) | `app/lib/ai/contextBuilder.ts` |
| Stateless inference + quote injection notes | `app/api/ai/chat/route.ts` |
| Engineering record (patent-aligned) | `docs/IP-TECHNICAL-MECHANISMS.md` |

CSV universal import: **truncated payload** for mapping (headers + sample rows); full file stays client-side — see section 3 of `docs/IP-TECHNICAL-MECHANISMS.md`.

---

## 4. Ecosystem and “platform” honesty

| Claim | Codebase state | Campaign guidance |
|-------|----------------|---------------------|
| Plugin / agent marketplace | **Not** a runtime platform in `app/` today | Do not promise an extension economy. Point to **GitHub**, **Discussions**, **`@pocket-portfolio/importer`**. |
| OSS primitives | **MIT** importer on npm; monorepo MIT | Lead with **ingestion + transformation + inspectable boundaries**. |
| Community | `README-OSS-WORKFLOW.md` (issues → RICE → discussions → CODEOWNERS) | “We are building contributor loops” — accurate. “We have a thriving plugin ecosystem” — **not** accurate yet. |

---

## 5. Deployment quality gates (link to operational SSOT)

Prevent **strategic drift** into production: no campaign should hard-launch **new** technical superlatives until deploy gates pass.

**Runbook:** `docs/command/deploy-production-gates.md` — **CTO** (architecture + security), **DevOps** (lint, typecheck, sovereign SSOT tests, build parity, Open 404 audit, `llms.txt` drift), **Product** (correct host + persona smoke), **Release sequence** (merge → deploy → DNS → smoke → GSC).

**Readiness narrative:** `docs/command/production-readiness-dual-surface-2026-05-16.md`.

---

## 6. Canonical terminology (starter dictionary)

| Term | Allowed when |
|------|----------------|
| Local-first | Qualified: **interaction** and **ingestion** default to device-side; not “no server for signed-in users.” |
| Stateless inference | Tied to **`/api/ai/chat`** portfolio payload non-retention — cite `IP-TECHNICAL-MECHANISMS.md`. |
| Bounded portfolio context | Output of `buildPortfolioContext` only (totals + top N). |
| Open Portfolio | **Host + route surface** + narrative; same deployment as Pocket. |
| OpenBrokerCSV / importer | Concrete OSS artifact: `packages/importer`, `SCHEMA.md`. |

**Future formalisation:** consider splitting this section into `docs/command/approved-claims-dictionary.md` if marketing surface area grows; until then, **this file is the SSOT**.

---

## 7. Content pipeline handoff (Consultant 1 → Consultant 2)

- **Investor / category narrative:** Use Consultant 1 *themes* only where each bullet maps to a **row in this ledger** or to `docs/IP-TECHNICAL-MECHANISMS.md`.
- **Seed raise (Open Portfolio):** Teaser + CEO Q&A appendix — `docs/seed/open-portfolio-seed-investor-package.md` (calibrated 2026-05-25).
- **Engineering / procurement / grant technical annex:** Lead with **this ledger + IP mechanisms**; avoid metaphor stack (Bloomberg, OS, “full sovereignty”) unless footnoted to behaviour.

---

## 8. Changelog

| Date | Change |
|------|--------|
| 2026-05-25 | Linked calibrated Open Portfolio seed package (`docs/seed/open-portfolio-seed-investor-package.md`). |
| 2026-05-20 | Initial ledger: dual-surface, persistence truth, inference boundary, prohibited phrases, deploy gate linkage. |

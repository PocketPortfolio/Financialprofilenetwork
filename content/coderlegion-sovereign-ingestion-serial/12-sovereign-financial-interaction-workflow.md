---
title: "Part 12: The Sovereign Financial Interaction Workflow"
date: "2026-08-10"
tags: ["engineering", "open-source", "architecture", "vision", "finance"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-ingestion-covers/ing-12.png"
series: "Sovereign Ingestion & Stateless Inference"
---

# The Sovereign Financial Interaction Workflow: From Repo to Inspectable Protocol

Twelve parts reduce to one **category primitive**: a **financial interaction workflow** you can clone, grep, and challenge — not a closed UI with slogans.

**Open Portfolio** sells the **boundary** (ingestion standard + data-minimised inference). **Pocket Portfolio** **stress-tests** it under retail chaos. Both live in one monorepo with receipts.

---

## The three inspectable pillars

<table>
<thead>
<tr>
<th scope="col">Pillar</th>
<th scope="col">Receipt</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Ingestion + transformation</strong></td>
<td><code>packages/importer</code> (MIT), OpenBrokerCSV narrative, client-side parse</td>
</tr>
<tr>
<td><strong>Inference boundary</strong></td>
<td><code>contextBuilder.ts</code> → <code>/api/ai/chat</code> → <code>docs/IP-TECHNICAL-MECHANISMS.md</code></td>
</tr>
<tr>
<td><strong>Dual-surface GTM</strong></td>
<td><code>middleware.ts</code>, <code>lib/canonical-claims.ts</code>, deploy gates</td>
</tr>
</tbody>
</table>

Governance SSOT for all outward copy: **`docs/command/claims-vs-codebase-calibration.md`**.

---

## Serial map (quick reference)

| Part | Topic |
| --- | --- |
| 1 | Invariant boundaries — one deploy, two hosts |
| 2 | Sanitization by construction |
| 3 | Stateless inference pipeline |
| 4 | Persistence honesty |
| 5 | Ingestion interface (npm importer) |
| 6 | B2C evaluation harness |
| 7 | Unit economics at edge |
| 8 | Limited-scope processor posture |
| 9 | Search moat (`llms.txt`) |
| 10 | Production gates |
| 11 | Terminal UX narrative |
| 12 | **This synthesis** |

---

## Honest roadmap (no marketplace fiction)

**Real today:**

- Contributor workflow (`README-OSS-WORKFLOW.md`), GitHub Discussions, CODEOWNERS path.
- OSS importer on npm; adversarial tests in-repo.
- Stateless inference route with documented metadata lane.

**Not promised in `app/` today:**

- Runtime **plugin / agent marketplace** (calibration §4).
- “Bloomberg replacement” or “sovereign AI OS” without technical nouns.

**Directional (engineering serial Part 10–11):** universal statement parser, institutional gateway patterns — label as **roadmap**, not shipped SKU.

---

## What procurement should ask us

1. Show `buildPortfolioContext` output for a demo account in Network tab.
2. Show middleware redirect matrix (Part 1 curls).
3. Show `llms.txt` diff after claim change (Part 9–10).
4. Show importer adapter list in `packages/importer/src/registry.ts`.

If we cannot demonstrate in **under five minutes of clone-and-grep**, the phrase does not belong in an RFP.

---

## Close

**Sovereign Ingestion & Stateless Inference** is the architecture of **data-minimised wealth intelligence**: ingest with inspectable transforms, reason with bounded context, ship with gates that bind narrative to code.

We are not selling vagueness. We are selling **workflow + boundary** — and Pocket is the harness that keeps it honest.

---

*Part 12 of **Sovereign Ingestion & Stateless Inference** — fin.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book, explore [Open Portfolio](https://www.openportfolio.co.uk/openbrokercsv), or [try Pocket Portfolio](https://www.pocketportfolio.app).**

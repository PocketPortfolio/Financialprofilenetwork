---
title: "Part 7: Deflationary Unit Economics at the Edge"
date: "2026-07-06"
tags: ["engineering", "economics", "ai", "architecture", "finance"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-ingestion-covers/ing-07.png"
series: "Sovereign Ingestion & Stateless Inference"
---

# Deflationary Unit Economics at the Edge: Client Aggregation vs Central Analytics Stores

The expensive mistake in “AI for finance” is mirroring **every user’s full ledger** into a server-side analytics database “so the model can reason.” That pattern charges you twice: **storage + compliance surface area**, then **per-token inference** on duplicated text.

We deflate the **LLM hop** by aggregating in the browser first.

---

## What moved to the edge

- **Portfolio rollups** for dashboard views — client-side math on the working set.
- **`buildPortfolioContext`** — fixed-template string before `POST /api/ai/chat` (Part 2).
- **CSV transformation** — `packages/importer` in the browser (Part 5).

Each step removes temptation to ship the **full corpus** to a central analytics pipeline for every Ask AI question.

---

## What did **not** disappear

<table>
<thead>
<tr>
<th scope="col">Component</th>
<th scope="col">Why it remains</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Firebase</strong></td>
<td>Authoritative authenticated trade history (Part 4)</td>
</tr>
<tr>
<td><strong>LLM APIs</strong></td>
<td>Reasoning happens in vendor inference (bounded input)</td>
</tr>
<tr>
<td><strong>Vercel / edge</strong></td>
<td>Hosting, middleware, streaming route</td>
</tr>
<tr>
<td><strong>KV / Firestore quota</strong></td>
<td>Tier enforcement on `/api/ai/chat` (Part 3)</td>
</tr>
</tbody>
</table>

**Prohibited claim:** “We removed the cloud database stack.” **Accurate claim:** we avoided a **central portfolio mirror for inference** — narrower blast radius on the costliest new feature (LLM).

---

## Unit economics intuition

If average user has 2,000 trades and context caps at ~2 KB of aggregates:

- **Token bill** scales with summary + user question — not row count.
- **Breach story** for the inference path excludes row-level history **by construction** — not by policy PDF alone.

Firebase storage still has a cost line — we pay for **product auth**, not for **duplicating the ledger into an AI warehouse**.

---

## Comparison table (honest)

<table>
<thead>
<tr>
<th scope="col">Pattern</th>
<th scope="col">Central ledger DB + AI</th>
<th scope="col">Our LLM hop</th>
</tr>
</thead>
<tbody>
<tr>
<td>Pre-inference data</td>
<td>Full history in warehouse</td>
<td>Bounded aggregate string</td>
</tr>
<tr>
<td>Auth trades</td>
<td>Often same warehouse</td>
<td>Firebase (separate concern)</td>
</tr>
<tr>
<td>Compliance perimeter</td>
<td>Warehouse + model vendor</td>
<td>Model vendor + metadata; smaller text payload</td>
</tr>
</tbody>
</table>

---

*Part 7 of **Sovereign Ingestion & Stateless Inference**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book, explore [Open Portfolio](https://www.openportfolio.co.uk), or [try Pocket Portfolio](https://www.pocketportfolio.app).**

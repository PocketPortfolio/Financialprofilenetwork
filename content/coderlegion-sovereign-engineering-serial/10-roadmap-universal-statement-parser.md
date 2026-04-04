---
title: "Part 10: Beyond the CSV — Universal Statement Parser (roadmap)"
date: "2026-06-12"
tags: ["engineering", "ai", "finance", "import", "roadmap", "pdf"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-engineering-covers/se-10.png"
series: "Sovereign Engineering"
status: "roadmap"
---

# Beyond the CSV: Statements as a Product Surface

**Part 10** looks past today’s CSV importers at **broker statements** (often PDF). The architecture below is **directional**: we are spelling out constraints and a credible pipeline, not announcing a finished PDF-to-portfolio feature in production.

---

## What you can use today

1. **Broker adapters and universal CSV** — importer package and in-app CSV flow. Heavy parsing stays **in the browser**; where cloud-assisted mapping exists, only **bounded** previews go upstream (for example headers plus a small sample of rows).
2. **Ask AI context** — always the `buildPortfolioContext` string (Parts 2–3), no matter how trades entered the app.

---

## Why PDF is harder than CSV

- **Layout** — multi-column tables, repeated headers, page breaks.
- **Noise** — footnotes, disclaimers, mixed fonts.
- **Scans** — OCR errors break deterministic parsers.
- **Trust** — people should **confirm** extracted rows before anything merges into a ledger—the same bar we set on universal CSV mapping.

---

## Target pipeline (when we ship it)

1. **Extract** — client-side or trusted worker → row-like text or tables.
2. **Map** — the same schema discipline as CSV (still **bounded** if the cloud helps).
3. **Parse deterministically** — `Trade[]` in the same spirit as today’s `genericParse`.
4. **Review** — explicit user confirmation before merge.

---

**Scope.** This installment is engineering intent and product reasoning. **End-to-end PDF statement import** is not described here as something you can do in the live app today; when we ship it, we will say so in release notes and product copy, not only in a serial essay.

---

*Part 10 of **Sovereign Engineering**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book or [try the app](https://www.pocketportfolio.app).**

---
title: "Part 5: Standardizing the Ingestion Interface"
date: "2026-06-22"
tags: ["engineering", "open-source", "csv", "importer", "typescript"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-ingestion-covers/ing-05.png"
series: "Sovereign Ingestion & Stateless Inference"
---

# Standardizing the Ingestion Interface: OpenBrokerCSV and the MIT Importer

We open-source a **financial interaction workflow** — not a bag of UI widgets. The concrete artifact is `@pocket-portfolio/importer` (`packages/importer`, **MIT** on npm). It normalises broker-specific chaos into a **`Trade` model** the app and SDK consumers can reason about.

---

## Package reality

From `packages/importer/package.json`:

- **Name:** `@pocket-portfolio/importer`
- **License:** MIT
- **Surface:** TypeScript adapters (Robinhood, Fidelity, eToro, IBKR Flex, Koinly, TurboTax, Ghostfolio, Sharesight, and more) + **universal** inference for unknown CSV shapes.

**Schema SSOT in-repo:** `packages/importer/README.md`, `packages/importer/src/universal/types.ts`, adapter registry in `src/registry.ts`. A dedicated `SCHEMA.md` is on the roadmap; until then, cite TypeScript types and README — do not invent a phantom file path in external copy.

---

## Client-side parse by design

Broker CSV parsing runs **in the browser** for the product architecture we ship — the file does not need to land on an app-server disk for transformation. That supports:

- **Inspectable transforms** (clone the repo, read the adapter),
- **Reduced central warehouse temptation** for raw exports,
- **Adversarial testing** in `src/universal/adversarial.ts` without multi-tenant DB blast radius.

---

## Universal mapping: truncated preview only

For unknown columns, `docs/IP-TECHNICAL-MECHANISMS.md` §3 documents **truncated payload** for mapping assistance: headers + sample rows — **full file stays client-side**. This mirrors the Ask AI instinct (Part 2): send the **minimum** structure needed for the next step.

---

## OpenBrokerCSV narrative

Open Portfolio surfaces OpenBrokerCSV as the **procurement-facing name** for the normalised interchange (`app/open/openbrokercsv/page.tsx`). Pocket exercises the same package under retail UX pressure — that is the **harness** relationship (Part 6).

---

## What we do not promise

- A **plugin marketplace** runtime in `app/` — not shipped.
- “Zero server” after import for signed-in users — Firebase still holds authoritative trades (Part 4).

**Do** point engineers to **GitHub**, **Discussions**, and npm — the real contributor loop (`README-OSS-WORKFLOW.md`).

---

*Part 5 of **Sovereign Ingestion & Stateless Inference**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book, explore [Open Portfolio](https://www.openportfolio.co.uk), or [try Pocket Portfolio](https://www.pocketportfolio.app).**

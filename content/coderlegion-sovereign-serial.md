---
# CoderLegion Series Manifest: Sovereign Serial
# Use this file to batch-create or schedule the 12-post series in CoderLegion.
# Schedule: Every Tuesday and Thursday @ 9:00 AM EST for 6 weeks.

series:
  name: Sovereign Serial
  slug: sovereign-serial
  description: >-
    A 12-part technical series adapted from the book Universal LLM Import—
    local-first CSV ingestion, schema inference, heuristics + LLMs, and sovereign data.
  source_book: Universal LLM Import (CSV) — Building Local-First, Sovereign CSV Ingestion
  book_url: /book/universal-llm-import
  cadence: "2 posts/week (Tue, Thu)"
  timezone: "9:00 AM EST"
  total_posts: 12
  weeks: 6
---

# Sovereign Serial — CoderLegion Series

**Series:** Sovereign Serial  
**Source:** [Universal LLM Import: Building Local-First, Sovereign CSV Ingestion](/book/universal-llm-import)  
**Cadence:** 2 posts/week (Tuesday & Thursday @ 9:00 AM EST)  
**Duration:** 6 weeks (12 posts)

---

## Series overview

This series repurposes the **Universal LLM Import** book into 12 high-engagement technical posts for CoderLegion. Each post:

- Opens with a **developer pain point** or hook
- Adapts content from the book (short paragraphs, no meta-instructions)
- Includes at least **one diagram or cover image** (chapter headers or figures from `/book-assets/`)
- Ends with **CTA:** *"Read the full [Bestseller Edition](/book/universal-llm-import) or [Try the app](https://www.pocketportfolio.app)."*

All posts link back to the main book landing page.

---

## Post roster (copy-paste or import)

### Week 1 — The Manifesto

| # | Publish date | Title | Slug | Cover image | Description (short) |
|---|--------------|-------|------|-------------|---------------------|
| 1 | 2026-02-11 (Tue) | The Fragmentation Problem: Why Financial Data is Broken | sovereign-serial-1-fragmentation-problem | chapter-01-header.svg | Broker-specific CSV parsers don't scale. How we inverted the model—support any trade-like CSV via schema inference. |
| 2 | 2026-02-13 (Thu) | Why We Bet on CSV over APIs | sovereign-serial-2-csv-over-apis | chapter-02-header.svg | Plaid and broker APIs are permissioned and fragile. We chose CSV as the sovereign, user-owned format. |

### Week 2 — The Architecture

| # | Publish date | Title | Slug | Cover image | Description (short) |
|---|--------------|-------|------|-------------|---------------------|
| 3 | 2026-02-18 (Tue) | Building Local-First: The Browser as the Server | sovereign-serial-3-local-first-browser | chapter-03-header.svg | Heavy work runs in the client. Only headers + 3 rows may touch the network when LLM is used. |
| 4 | 2026-02-20 (Thu) | The Bifurcated Pipeline: Heuristics + LLMs | sovereign-serial-4-bifurcated-pipeline | chapter-04-header.svg | Heuristic first; LLM only when confidence &lt; 0.9. Mapping is probabilistic; parsing is deterministic. |

### Week 3 — The Intelligence

| # | Publish date | Title | Slug | Cover image | Description (short) |
|---|--------------|-------|------|-------------|---------------------|
| 5 | 2026-02-25 (Tue) | The 3-Row Snapshot: Privacy-Preserving Inference | sovereign-serial-5-three-row-snapshot | chapter-05-header.svg | We send only headers and three sample rows to the LLM—enough to disambiguate columns without exposing full history. |
| 6 | 2026-02-27 (Thu) | Data Normalization: Solving the Date/Locale Nightmare | sovereign-serial-6-data-normalization | chapter-05-header.svg | UK dd/mm vs US mm/dd. Decimal commas vs points. How we normalize dates, numbers, and tickers without guessing. |

### Week 4 — Sovereignty

| # | Publish date | Title | Slug | Cover image | Description (short) |
|---|--------------|-------|------|-------------|---------------------|
| 7 | 2026-03-04 (Tue) | Google Drive as Dumb Storage | sovereign-serial-7-drive-dumb-storage | chapter-06-header.svg | Drive stores one JSON file. No backend logic; the client owns sync and conflict semantics. |
| 8 | 2026-03-06 (Thu) | The Interface of Uncertainty: Designing Human-in-the-Loop | sovereign-serial-8-interface-uncertainty | chapter-07-header.svg | When confidence is below 0.9, we show the mapping UI—not a silent guess. Designing for REQUIRES_MAPPING. |

### Week 5 — Engineering

| # | Publish date | Title | Slug | Cover image | Description (short) |
|---|--------------|-------|------|-------------|---------------------|
| 9 | 2026-03-11 (Tue) | Comparison: Universal Import vs. Plaid/Yodlee | sovereign-serial-9-universal-vs-plaid | chapter-08-header.svg | Data ownership, failure modes, maintenance, cost, compliance—side by side. |
| 10 | 2026-03-13 (Thu) | Security & Threat Modeling for Local Apps | sovereign-serial-10-security-threat-modeling | chapter-09-header.svg | What is never transmitted; what the LLM sees when enabled; attack surfaces; GDPR-by-design. |

### Week 6 — The Future

| # | Publish date | Title | Slug | Cover image | Description (short) |
|---|--------------|-------|------|-------------|---------------------|
| 11 | 2026-03-18 (Tue) | Beyond Finance: Use Cases for Client-Side ETL | sovereign-serial-11-use-cases-client-etl | chapter-10-header.svg | The "headers + sample → mapping → parse" pattern is generic. Brokers, banks, crypto—and time tracking, CRM. |
| 12 | 2026-03-20 (Thu) | The Future of Finance is Client-Side AI | sovereign-serial-12-future-client-side-ai | chapter-11-header.svg | User-owned data, LLMs as interpreters not oracles, and why this design matters for the next decade. |

---

## Asset paths (for CoderLegion)

- **Chapter headers (cover images):** `/book-assets/assets/chapter-headers/chapter-01-header.svg` … `chapter-11-header.svg`
- **Figures (in-post):**  
  - Post 3: `/book-assets/figures/figure-02-local-first-flow.svg`  
  - Post 4: `/book-assets/figures/figure-03-llm-lifecycle.svg`  
  - Post 7: `/book-assets/figures/figure-04-drive-sync.svg`

Base URL for assets: site origin (e.g. `https://www.pocketportfolio.app`).

---

## CTA (every post)

Use this block at the end of each post:

```markdown
---

*Part N of the **Sovereign Serial**—a 12-part technical series adapted from the book [Universal LLM Import: Building Local-First, Sovereign CSV Ingestion](/book/universal-llm-import).*

**Read the full [Bestseller Edition](/book/universal-llm-import) or [Try the app](https://www.pocketportfolio.app).**
```

---

## Draft locations (this repo)

| Slug | Site (MDX) | CoderLegion-ready (plain Markdown) |
|------|------------|-------------------------------------|
| sovereign-serial-1-fragmentation-problem | content/posts/sovereign-serial-1-fragmentation-problem.mdx | content/coderlegion-sovereign-serial/01-fragmentation-problem.md |
| sovereign-serial-2-csv-over-apis | content/posts/sovereign-serial-2-csv-over-apis.mdx | content/coderlegion-sovereign-serial/02-csv-over-apis.md |
| … | content/posts/sovereign-serial-N-*.mdx | content/coderlegion-sovereign-serial/NN-*.md |
| sovereign-serial-12-future-client-side-ai | content/posts/sovereign-serial-12-future-client-side-ai.mdx | content/coderlegion-sovereign-serial/12-future-client-side-ai.md |

- **Site:** All 12 MDX drafts live in `content/posts/` with the naming pattern `sovereign-serial-{N}-{slug}.mdx`.
- **CoderLegion:** Plain Markdown versions (no MDX, absolute URLs) live in `content/coderlegion-sovereign-serial/` as `01-*.md` … `12-*.md`. Use these for copy-paste or upload to CoderLegion. See that folder’s README for usage.

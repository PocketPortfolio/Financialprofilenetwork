---
title: "Part 12: Sovereign Intelligence - The Complete Blueprint - Sovereign Intelligence"
date: "2026-04-08"
tags: ["engineering", "ai", "local-first", "rag", "finance", "blueprint"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "./images/chapter-12-header.png"
series: "Building Sovereign Intelligence"
---

# Sovereign Intelligence: The Complete 25,000 Word Blueprint (Download)

This 12-part series has walked through the full architecture of **Pocket Analyst**—the local-first financial AI that keeps your data on your device and sends only a sanitized snapshot to the cloud. Here is the one-page recap and where to get the full blueprint.

## Architecture recap

1. **Data Chasm** — Raw ledger stays on device; only a token-bounded summary (totals, top N holdings) crosses the wire. The context builder (`buildPortfolioContext`) is the funnel.
2. **Split Brain** — Memory (trades, positions, conversation) in the browser; reasoning (LLM, search grounding) on the server. The API is stateless: (context, message, attachment) → stream.
3. **Token Funnel** — 10,000 trades → aggregation → top N + totals → context string (≤4K tokens). Signal preserved; PII and noise excluded.
4. **Dual source** — "My Portfolio" (local context) + "The Market" (Gemini search grounding). Model cites which source it used.
5. **Guardrails** — System prompt constrains to finance only; red lines (no advice, no execution, no invented data); polite redirect for off-topic.
6. **Transient attachments** — File parsed in browser; only text sent; not stored on server. Browser-Side ETL: Extract → Transform → Load (into prompt).
7. **Streaming & UX** — Vercel AI SDK (`useChat`, `streamText`); FAB, glassmorphism modal, optimistic UI, usage badge.
8. **Economics** — Tiered quotas (free N/month, paid unlimited); Firestore for usage; cost per query and break-even modeled.
9. **Model choice** — Gemini Flash default (speed, cost, grounding); Pro for upgrade; benchmarked vs. GPT-4o.
10. **Agent loop** — Future: model proposes action → user confirms → client executes. Human in the loop always for financial actions. No autonomous execution.

## The full blueprint

The complete technical reference—every chapter, every figure, implementation paths, and appendices—is the book:

**[Sovereign Intelligence: Building Local-First RAG for Finance](https://www.pocketportfolio.app/book/sovereign-intelligence)**

Single canonical URL for SEO and deep links: `https://www.pocketportfolio.app/book/sovereign-intelligence`. ~25,000 words. Ten chapters in five parts, plus Conclusion and Appendix. All diagrams (Data Chasm, Hybrid Architecture, Token Funnel, Grounding Flow, Prompt Engineering, Browser-Side ETL, Component Tree, Cost/Unit Economics, Benchmark, Agent Loop) are in the book and on the site.

## Related docs

- **Pocket Analyst implementation report:** `docs/POCKET-ANALYST-IMPLEMENTATION-REPORT.md`
- **Production checklist:** `docs/POCKET-ANALYST-PROD.md`
- **Vercel env (Pocket Analyst):** `docs/VERCEL-ENV-SUPPORT-ADMIN.md`

---

*Part 12 of **Sovereign Intelligence Serial** — the complete series adapted from [Sovereign Intelligence: Building Local-First RAG for Finance](https://www.pocketportfolio.app/book/sovereign-intelligence).*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) or [Try the app](https://www.pocketportfolio.app).**

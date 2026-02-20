# Technical Writer Peer Review: Sovereign Intelligence Book

**Document:** `SOVEREIGN-INTELLIGENCE-BOOK.md` (Sovereign Intelligence: Building Local-First RAG for Finance)  
**Reviewer:** Technical writer peer review  
**Date:** 2025-02

---

## 1. Summary

The manuscript is a structured technical reference for Pocket Analyst (Pocket Portfolio’s AI financial assistant). It explains a local-first RAG design: sanitized context, hybrid browser/server split, and implementation pointers. The audience (senior engineers, fintech founders, privacy advocates) is well matched to the level of detail. The main gaps are **missing illustrations** (all diagrams are described in prose only), **inconsistent cross-references**, and **no explicit “reader path” for different roles**. Recommended actions: add the planned figures, normalize cross-references, and add a short “How to read this book” by role.

---

## 2. Strengths

- **Clear structure:** Five parts and ten chapters follow a logical flow (problem → architecture → context → safety → UX → economics → future). Table of contents and part/chapter titles make navigation obvious.
- **Consistent terminology:** Terms (sanitized snapshot, context builder, Split Brain, grounding, transient attachment, token funnel) are defined and reused. Code names (`buildPortfolioContext`, `AskAIModal`, `/api/ai/chat`) match the codebase.
- **Actionable appendix:** Implementation reference with file paths and key functions is directly usable. Links to related docs are included.
- **Useful summaries:** Each chapter ends with bullet summaries that reinforce main ideas and support scanning.
- **Concrete examples:** Context string example (Ch 1), end-to-end request flow (Ch 2), 10k-trades-to-one-paragraph (Ch 3), and grounding flow (Ch 4) help readers connect concepts to behavior.
- **Explicit design rationale:** “Why we do X” and “why we don’t do Y” (e.g. no server-side RAG, no raw ledger) are stated, which supports both implementation and compliance discussions.

---

## 3. Gaps and recommendations

### 3.1 Illustrations (critical)

**Issue:** Every diagram is only described in text (“Draw a diagram…”, “Conceptually, draw…”). There are no embedded figures. Readers cannot see the Data Chasm, Hybrid Architecture, Token Funnel, Grounding Flow, Prompt Engineering box, Browser-Side ETL, Component Tree, Cost/Unit Economics, Benchmark Charts, or Agent Loop.

**Recommendation:** Add the planned figures (SVG or PNG) and reference them in the body, e.g.:

- After the “Data Chasm” description in Ch 1: insert `![Figure 1 — The Data Chasm](figures/si-figure-01-data-chasm.svg)` with a short caption.
- Repeat for each chapter’s main diagram so the book has a consistent set of visuals (see diagram list in the blueprint).

**Status:** Addressed by creating `si-figure-01-*` through `si-figure-10-*` in `docs/book/figures/` and inserting them into the manuscript.

---

### 3.2 Cross-references

**Issue:** Some forward/backward references are vague (“see Chapter 6”, “the system prompt”) or missing where they would help (e.g. Ch 4 grounding and Ch 9 “Google Mode” both touch on when to call the model; Ch 5 guardrails and Ch 10 agent loop both touch on “no execution”).

**Recommendation:**

- Use consistent phrasing: “Chapter 6 — Transient File I/O” or “(Ch 6)” on first mention in a section.
- Add a few explicit back-references: e.g. in Ch 10, “As in Chapter 5, the model must not execute actions without confirmation.”
- In the Appendix, add “See also” pointers to the chapter that deep-dives each file (e.g. context builder → Ch 3).

---

### 3.3 Reader paths by role

**Issue:** The Introduction says “who this book is for” but does not give role-based reading paths (e.g. “If you’re implementing the API, read Ch 2 and 8 first; if you’re on compliance, read Ch 1 and 5.”).

**Recommendation:** Add a short “How to read this book” subsection in the Introduction with 2–3 suggested paths, for example:

- **Implementing the stack:** Introduction → Ch 2 (architecture) → Ch 3 (context) → Ch 7 (UI) → Appendix.
- **Privacy/compliance:** Introduction → Ch 1 (privacy gap) → Ch 5 (guardrails) → Ch 6 (transient file) → Summary table in Ch 1.
- **Product/cost:** Ch 8 (economics) → Ch 9 (model choice) → Ch 10 (future).

---

### 3.4 Code and configuration examples

**Issue:** System prompt “outline” (Ch 5) and Firestore schema (Ch 8) are described in prose. A single, short code or config snippet (e.g. a minimal system prompt block or a sample Firestore document) would make the contract unambiguous.

**Recommendation:** Add one optional “Example” code block per chapter where it matters most (e.g. Ch 5: minimal system prompt snippet; Ch 8: example usage document structure). Keep snippets short and mark them as illustrative, not copy-paste.

---

### 3.5 Accessibility of figures

**Issue:** Once figures are added, they need meaningful alt text and optional captions so screen-reader users and search get the same information as the diagram.

**Recommendation:** Use descriptive alt text for every figure (e.g. “Diagram: Raw Ledger on device, Sanitized Context in the middle, LLM in the cloud; only the summary crosses the wire”). If the renderer supports it, add a caption below the figure (e.g. “Figure 1 — The Data Chasm.”).

---

### 3.6 Minor consistency and polish

- **Numbering:** Figures are not yet numbered in the body; once figures are in place, use “Figure 1”, “Figure 2”, etc., and refer to them in the text (“as in Figure 2”).
- **Table formatting:** The “Summary table: what crosses the wire” (Ch 1) and the Appendix table render correctly in Markdown; ensure no extra pipes or broken rows in other tables.
- **Double blank line (Ch 10):** There is an extra blank line between “Broker orders and regulatory considerations” and “Research and industry direction”; remove for consistency.
- **Tense:** Most of the book is present tense (“We send”, “The client builds”); a few forward-looking sentences use “would” or “could”. That mix is fine; just avoid switching tense within the same paragraph.

---

## 4. Checklist (for final pass)

- [ ] All 10 figures created and referenced in the correct chapter.
- [ ] Alt text (and captions if supported) for every figure.
- [ ] “How to read this book” (by role) added to Introduction.
- [ ] At least 2–3 cross-references added (e.g. Ch 5 ↔ Ch 10, Appendix ↔ chapters).
- [ ] Optional: one short code/config example in Ch 5 and Ch 8.
- [ ] Extra blank line in Ch 10 removed.
- [ ] Run `npm run book:copy-assets` (or equivalent) so figures appear under `/book-assets/` for the live book.

---

## 5. Conclusion

The Sovereign Intelligence book is technically accurate, well structured, and aligned with the codebase and blueprint. The highest-impact improvement is **adding the illustrations** that are currently only described. After that, small improvements to cross-references, reader paths, and figure accessibility will make the book easier to use for implementers, compliance, and product readers.

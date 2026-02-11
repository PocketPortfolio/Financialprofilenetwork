# Book Design System — Universal LLM Import

**Document:** Definitive visual and typographic system for *Universal LLM Import: Building Local-First, Sovereign CSV Ingestion*.  
**Publisher:** Pocket Portfolio  
**Rule:** Design, branding, and imagery only. No content additions, deletions, or rewrites.

---

## 1. Brand & visual identity

### Brand pillars (express visually)

- **Data sovereignty** — User owns the file; data boundaries are clear.
- **User ownership** — No vendor lock-in; the reader holds the canonical reference.
- **Local-first** — Browser as compute boundary; minimal server.
- **Clarity over hype** — No startup clichés; evidence-first, precise.
- **Engineering rigor** — Reference-manual feel; trustworthy, scannable.

### Pocket Portfolio as imprint

- **Imprint name:** Pocket Portfolio (consistent on title page, colophon, running feet, back cover).
- **Tagline for book:** “Definitive technical guide” (subtitle and back-cover one-liner).
- **Logo placement:** Title page (top or bottom); optional on chapter openers or running head. If no logo asset exists, wordmark “Pocket Portfolio” in book typeface is sufficient.
- **Product alignment:** Where the app uses warm neutrals and accent `#ff6b35` (salmon/orange), the book may extend that in a restrained way (e.g. accent for key diagram nodes, borders, or spine). For a “reference manual” feel, prefer calm neutrals for body and reserve accent for emphasis and diagrams.

### Tone of the design

- **Authoritative, calm, precise.** No generic tech imagery, no decorative filler.
- **Prefer:** Clarity, whitespace, structure, a slight “reference manual” feel that still feels modern.
- **Audience:** Senior engineers, tech leads, indie hackers, fintech builders, product and compliance. Design for the person who values substance and will keep the book on their desk or in their library.

---

## 2. Typography & hierarchy

### Type system

- **Body text:** Highly readable serif or neutral sans; comfortable line length (e.g. 60–70 characters); line height 1.4–1.6. No cramped or flashy layouts.
- **Headings:** Clear, repeatable hierarchy. Same treatment for all Parts (I–V), all Chapters (1–11), Conclusion, and Appendices (A–F).
  - **Part title:** Largest weight; may use a different style (e.g. small caps, number “I”, “II”, …) to signal major division.
  - **Chapter title:** One level below Part; consistent numbering (e.g. “Chapter 1 — …”).
  - **Section (###):** Subsection; visually distinct from body.
- **Summary blocks:** Same style for every chapter “Summary”; optional light background or left border to signal “recap” without introducing new content.
- **Code:** One clear, readable monospace (e.g. SF Mono, Menlo, Consolas, Liberation Mono). Differentiate **inline code** (e.g. `parseUniversal`) from **block code** by background, padding, and optional border. No content changes—only typography, background, and spacing.

### Table of Contents

- **TOC as map of the book.** Consider part groupings (I, II, III, IV, V) with chapter titles indented or grouped beneath. Consistent indentation and optional leader dots to page numbers.
- **Do not rewrite the TOC;** restyle only. Order and wording come from the manuscript.

### Front matter

- **Title page:** Title, subtitle, author/imprint (Pocket Portfolio), and optional colophon. Intentional, on-brand.
- **Colophon/copyright:** Publisher (Pocket Portfolio), year, optional ISBN placeholder, “Definitive technical guide” or short tagline.

### Back matter

- **Conclusion, Appendices A–F, Diagram List, Style Sheet:** Same book, not an afterthought. Appendix headings and list styling consistent with chapter/section hierarchy. Same body and code styles.

---

## 3. Figures and imagery

### Figure 1 — ASCII pipeline (hero diagram)

- **Keep as monospace diagram.** No content change.
- **Design it:** Typography (monospace, consistent weight), spacing, alignment. Optional: subtle frame or background so it reads as the “hero diagram” of the pipeline. Optional: light color or weight to separate the three layers (User’s CSV → Schema inference → Deterministic parse).
- **In manuscript:** Wrapper class or block identifier (e.g. `figure-hero ascii-pipeline`) for styling in export; caption unchanged.

### Figures 2, 3, 4, 5 — From Mermaid to final art

- **Replace raw Mermaid code with final art.** Each diagram is part of one visual language:
  - **Same:** Line weights, arrow style, color usage, type (one sans-serif for labels).
  - **Read as:** “This is how the system works,” not “this is a code block.”
- **Figure 2:** Local-first flow (CSV → browser → heuristic → LLM optional → parse → NormalizedTrade[]). Flowchart, left-to-right or top-down; decision diamonds for confidence and LLM enabled.
- **Figure 3:** LLM-assisted lifecycle. Sequence: User, Browser, Heuristic, API, LLM; alt branches for confidence ≥ 0.9, LLM path, REQUIRES_MAPPING.
- **Figure 4:** Local device ↔ Drive ↔ restore. Client (IndexedDB, export file) ↔ Google Drive (single file); export & upload, create/update, download, import & load; note: Drive stores file only, no schema logic.
- **Figure 5:** Known vs unknown broker decision tree. File dropped → known broker? → dedicated adapter vs parseUniversal → confidence → parse or REQUIRES_MAPPING.
- **Source of truth:** `docs/book/DIAGRAM-LIST.md` for intent; manuscript for placement and captions. Image files live in `docs/book/figures/` (e.g. `figure-02-local-first-flow.svg`).

### Figure 6 — Data boundaries (table)

- **Key reference.** Design so the three boundaries (Client, Server, Drive) are instantly scannable: hierarchy, alignment, optional subtle row shading or borders so it feels like a “map” of where data lives.
- **In manuscript:** Table content unchanged; use HTML table with class (e.g. `reference-table data-boundaries`) for styling (header row, row shading by boundary).

### Other tables

- **Comparison (CSV vs API), standard fields (Appendix A), troubleshooting (Appendix D), etc.:** Same table language as Figure 6: clear headers, readable body, consistent alignment. Optional alternating row shading for long tables. No content changes.

### Optional supporting imagery

- Where a section clearly implies a concept (e.g. “user holds the file,” “browser as compute boundary,” “Drive as dumb storage”), a small conceptual illustration or icon may be added **only** if it reinforces the existing sentence and stays within the same visual system. No decorative filler; no new text.

### Accessibility

- **Contrast:** Sufficient for body and headings (WCAG AA where applicable).
- **Figures:** Every figure has a caption; alt text or captions “tell the story” for all readers. Diagram SVGs should use readable font size and clear labels.

---

## 4. Code blocks and snippets

- **One clear monospace style** for all code. Background (e.g. light gray or warm off-white), padding, optional thin border. Inline code (e.g. `genericParse`) slightly distinct (e.g. background tint, no block padding). No content changes.

---

## 5. Cover, spine, and back (if in scope)

### Cover

- **Conveys:** “Technical reference” and “sovereign / local-first” without being generic.
- **Consider:** Data flow, ownership, or “one pipeline” as visual metaphor. Typography-led is fine; imagery should support, not dominate.
- **Elements:** Title, subtitle, Pocket Portfolio as publisher. Restrained use of product accent if desired.

### Spine and back (if print)

- **Spine:** Title, author/imprint. Optional short tagline.
- **Back:** One-liner from manuscript: *“The definitive technical guide to building and understanding a local-first, LLM-assisted CSV import system that treats CSV as sovereign data and the browser as the compute boundary—from schema inference and confidence thresholds to sovereign sync and threat modeling.”*

---

## 6. Internal finish (print & digital)

- **Margins and grids:** Consistent throughout. Safe margins for print (e.g. 0.75–1 in); same grid for digital.
- **Page numbers and running heads:** Part or chapter name on verso/recto if format supports. Imprint (Pocket Portfolio) optional on running foot.
- **Widows and orphans:** Avoid where layout is controlled (e.g. in PDF/print export).
- **Spacing:** Consistent space before/after headings, figures, and tables. Figure and table captions: one consistent style (e.g. small type, numbered “Figure 1”, “Figure 2”, …).

### Print vs digital

- **One master layout** that works for print and for PDF/e-reader: figure size and resolution sufficient for both; safe margins; imagery sharp and legible in both. SVGs scale; if using PNGs, use 2× resolution for retina.

---

## 7. Color palette (book)

- **Primary text:** Near black or dark gray (e.g. `#1a202c`, `#2d3748`).
- **Secondary/muted:** Medium gray for captions and metadata.
- **Accent (optional):** Use sparingly for diagram emphasis, borders, or spine. Product accent `#ff6b35` or a calmer teal/slate for “reference” feel (e.g. `#0f766e`, `#475569`).
- **Backgrounds:** White or warm off-white for body; light gray or tint for code blocks and optional table row shading.
- **Diagrams:** One accent for key nodes (e.g. “Client,” “NormalizedTrade[]”); otherwise neutral strokes and text.

---

## 8. Export and build notes

- **Pandoc / Word / PDF:** When exporting from `UNIVERSAL-LLM-IMPORT-BOOK.md`, ensure the `figures/` directory is relative to the document so image paths `figures/figure-02-local-first-flow.svg` (etc.) resolve. For PDF, SVG can be embedded or converted to high-resolution raster. Use `--reference-doc=reference.docx` to apply the book type hierarchy and table styles; define styles for `.figure-hero`, `.reference-table`, `.data-boundaries`, `.comparison-table`, `.standard-fields`, `.troubleshooting` so tables and the hero diagram are visually distinct.
- **Chapter 8 comparison table:** The manuscript may keep the comparison table (Dimension | Universal LLM Import | Plaid/Broker APIs) as Markdown; the reference doc or CSS should apply the same `reference-table` / `comparison-table` styling to all comparison tables in export.
- **Book stylesheet:** `docs/book/book-styles.css` defines `.figure-hero.ascii-pipeline`, `.reference-table`, and `.data-boundaries` for HTML or for reference when defining Word styles.

## 9. File and asset checklist

| Asset | Location | Notes |
|-------|----------|--------|
| Figure 1 | In manuscript | ASCII; wrapper class `figure-hero ascii-pipeline` |
| Figure 2 | `figures/figure-02-local-first-flow.svg` | Local-first flowchart |
| Figure 3 | `figures/figure-03-llm-lifecycle.svg` | Sequence diagram |
| Figure 4 | `figures/figure-04-drive-sync.svg` | Client ↔ Drive ↔ restore |
| Figure 5 | `figures/figure-05-known-unknown-broker.svg` | Decision tree |
| Figure 6 | In manuscript | Data boundaries table; class `reference-table data-boundaries` |
| Other tables | In manuscript | Class `reference-table` or `comparison-table` where applicable |
| Design system | `docs/book/BOOK-DESIGN-SYSTEM.md` | This document |

---

## 10. Definition of done (design)

- [ ] Every figure that can be art is **final art** (Figures 2–5 as SVG; Figure 1 styled monospace/hero).
- [ ] One consistent **visual and typographic system** across Parts I–V, Conclusion, Appendices.
- [ ] **Brand and imprint** clearly present (Pocket Portfolio, “definitive technical guide”).
- [ ] **Imagery and tables** tell the story of the pipeline, data boundaries, and sovereignty without adding or removing content.
- [ ] Result feels like a **bestseller edition**: confident, clear, ready to ship as the canonical reference for Universal LLM Import.

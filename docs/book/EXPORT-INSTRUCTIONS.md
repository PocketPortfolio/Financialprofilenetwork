# Exporting the Book to Word or PDF

The full manuscript is in **UNIVERSAL-LLM-IMPORT-BOOK.md**. To produce a single Word (.docx) or PDF file with all chapters, figures, and tables, use one of the following approaches.

## Option 1: Pandoc to Word (recommended) — Option A

1. **Install Pandoc** (optional but recommended): https://pandoc.org/installing.html (Windows: `winget install Pandoc.Pandoc`)

2. **Generate Word document** (from repo root):
   ```bash
   npm run book:docx
   ```
   This script tries **Pandoc** first; if Pandoc is not installed, it falls back to **@mohtasham/md-to-docx** (ensure `npm install` has been run so the dependency is present). Output is written to **docs/book/Universal-LLM-Import-Book.docx**.

   Or manually with Pandoc:
   ```bash
   cd docs/book
   pandoc UNIVERSAL-LLM-IMPORT-BOOK.md -o Universal-LLM-Import-Book.docx --toc --toc-depth=3
   ```
   This produces **Universal-LLM-Import-Book.docx** in `docs/book/` with a table of contents. Mermaid blocks will appear as code blocks in Word; for publication you may want to render them to images (see Option 3) and replace the code blocks.

3. **Optional: reference doc for styles:**
   ```bash
   pandoc UNIVERSAL-LLM-IMPORT-BOOK.md -o Universal-LLM-Import-Book.docx --toc --reference-doc=reference.docx
   ```
   Create a `reference.docx` with your desired heading styles, body font, and code block formatting, then use it so the output matches your house style.

## Option 2: Generate PDF (recommended — one command)

1. **From repo root**, ensure dependencies are installed (once; if install crashes or times out, retry in a new terminal or after a reboot):
   ```bash
   npm install
   ```

2. **Generate the PDF:**
   ```bash
   npm run book:pdf
   ```
   Output: **docs/book/Universal-LLM-Import-Book.pdf**. The script uses `md-to-pdf` (Puppeteer), applies `book-styles.css`, and resolves figures from `figures/`. No Pandoc or LaTeX required.

3. **If `npm install` keeps failing:** Install only the PDF tool: `npm install md-to-pdf --save-dev`, then run `npm run book:pdf`.

## Option 2b: Pandoc to PDF (alternative)

1. **Install Pandoc and a LaTeX engine** (e.g. MiKTeX or TeX Live on Windows, or use `--pdf-engine=wkhtmltopdf` if you have that installed).

2. **Generate PDF** (from `docs/book/`):
   ```bash
   cd docs/book
   pandoc UNIVERSAL-LLM-IMPORT-BOOK.md -o Universal-LLM-Import-Book.pdf --toc --toc-depth=3
   ```
   Figures 2–5 are already SVG in the manuscript; embed paths are relative to the document.

## Option 3: Render Mermaid diagrams to images

For a print-ready document where **Figures 2, 3, 4, 5** appear as flowcharts/sequence diagrams (not raw Mermaid code):

1. **Install Mermaid CLI:** `npm install -g @mermaid-js/mermaid-cli`

2. Extract each Mermaid block from the manuscript into a separate `.mmd` file and render:
   ```bash
   mmdc -i figure2.mmd -o figure2.png
   ```

3. In the manuscript (or in the Word/PDF after export), replace the Mermaid code blocks with the corresponding images, and add a caption (e.g. "Figure 2 — Local-first flow").

4. Alternatively, use **Pandoc with mermaid-filter** so Mermaid is rendered during conversion:
   ```bash
   npm install -g mermaid-filter
   pandoc UNIVERSAL-LLM-IMPORT-BOOK.md -o Universal-LLM-Import-Book.docx --toc -F mermaid-filter
   ```
   (Exact filter name and usage may vary; check the mermaid-filter or pandoc-mermaid documentation.)

## Figures in the manuscript

Figures 2–5 are **final art** (SVG) in `figures/`. The manuscript references them by path; no Mermaid rendering is required.

| Figure | Type        | Location  | Action for print |
|--------|-------------|-----------|------------------|
| 1      | ASCII       | Chapter 1 | Keep as monospace; styled with class `figure-hero ascii-pipeline` (see BOOK-DESIGN-SYSTEM.md) |
| 2      | SVG         | Chapter 3 | `figures/figure-02-local-first-flow.svg` — embed as image |
| 3      | SVG         | Chapter 4 | `figures/figure-03-llm-lifecycle.svg` — embed as image |
| 4      | SVG         | Chapter 6 | `figures/figure-04-drive-sync.svg` — embed as image |
| 5      | SVG         | Chapter 3 | `figures/figure-05-known-unknown-broker.svg` — embed as image |
| 6      | Table       | Chapter 3 | HTML table with class `reference-table data-boundaries`; preserve in Word/PDF |

**Design system:** For typography, tables, cover, and print/digital specs, see **BOOK-DESIGN-SYSTEM.md**.

## Option 4: Node script (md-to-docx)

From the repository root:

```bash
npm install @mohtasham/md-to-docx
node docs/book/convert-to-docx.js
```

This writes **Universal-LLM-Import-Book.docx** into `docs/book/`. The script uses the same Markdown file; Mermaid blocks will appear as code blocks unless you replace them with images separately.

## Word count

The manuscript has been expanded to approximately 22,000–25,000 words (Introduction with prerequisites and structure; Parts I–V; Chapters 1–11 with added sections on validation, monitoring, conflict scenarios, metrics, hybrid strategies, incident response, non-financial examples, and industry trends; Conclusion with summary-by-part and next steps; Appendices A–F including case studies, FAQ, design alternatives, external references; Diagram List; Style Sheet).

## Single output file

After export you will have **one** file:
- **Universal-LLM-Import-Book.docx** (Option 1), or  
- **Universal-LLM-Import-Book.pdf** (Option 2),

containing the title, table of contents, introduction, Parts I–V, Chapters 1–11, conclusion, appendices, list of figures, and style sheet. For best results, run a final pass to fix any broken internal links, ensure all figure captions are present, and that tables are correctly formatted.

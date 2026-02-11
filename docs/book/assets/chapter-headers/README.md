# Chapter header images (Operation Bestseller Polish)

Place **11 PNG images** here for the final print edition:

- `chapter-01-header.png` … `chapter-11-header.png`

**To use your real artwork (correct files):**

1. Put your 11 chapter header PNGs in **this folder** (`docs/book/assets/chapter-headers/`). Names can be exact (`chapter-01-header.png` … `chapter-11-header.png`) or UUID-style (`chapter-01-header-172bc7e7-....png`).
2. From the repo root run:
   ```bash
   npm run book:install-headers
   ```
   This prefers non–1×1 (real) images over placeholders, renames to `chapter-01-header.png` … `chapter-11-header.png`, and copies to `public/book-assets` so the app loads them.

If your files are in a different folder:
```bash
node scripts/copy-chapter-headers-from-uuids.js path/to/your/pngs
npm run book:copy-assets
```

**Prompt strategy (abstract, data-driven, geometric):**  
*"Abstract data visualization, ethereal wireframe, dark mode UI aesthetic, orange and grey palette, isometric view of [concept], high tech, 4k, architectural style."*

**Concepts per chapter:**  
1. CSV rows converging into a single beam  
2. Broken API links vs one solid file  
3. Browser as single node, cloud small in distance  
4. Pipeline stages as connected blocks  
5. Tech stack layers  
6. Local device ↔ cloud sync  
7. Benefits / value flow  
8. CSV vs API comparison visual  
9. Security boundaries / shield  
10. Extension paths / branching  
11. Future of finance / sovereignty  

Image refs in the manuscript point to `assets/chapter-headers/chapter-NN-header.png`. **`npm run book:pdf`** auto-creates 1×1 transparent placeholders for any missing file so the PDF never shows broken images. Replace those PNGs with your final art to meet the "every chapter starts with a visual" criterion.

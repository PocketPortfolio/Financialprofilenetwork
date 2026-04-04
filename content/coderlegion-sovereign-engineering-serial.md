# CoderLegion Series Manifest: Sovereign Engineering Serial

**Series slug:** `sovereign-engineering-serial`  
**Output directory:** `content/coderlegion-sovereign-engineering-serial/`  
**Cadence:** Every **Friday** at **10:00 UTC** (does not overlap Mon/Wed Sovereign Intelligence serial or Tue/Thu Universal LLM serial).  
**Duration:** 12 weeks (12 posts).  
**Canonical URL (all parts):** `https://www.pocketportfolio.app/book/sovereign-intelligence` — use this on CoderLegion until first-party blog MDX URLs are preferred; then set per-post canonical to `https://www.pocketportfolio.app/blog/{slug}` and record in `content/CANONICAL_URLS.md`.

**Source-of-truth engineering record:** `docs/IP-TECHNICAL-MECHANISMS.md`

**Cover art (Amber Terminal, 1200×630 aspect):** `public/book-assets/sovereign-engineering-covers/se-01.png` … `se-12.png` (raster **2400×1260** for sharp OG/social). Regenerate: `node scripts/generate-sovereign-engineering-cover-pngs.mjs`. YAML `cover_image`: `https://www.pocketportfolio.app/book-assets/sovereign-engineering-covers/se-NN.png`.

**Tables in body copy:** Use **HTML `<table>`** (with `<thead>`, `<tbody>`, `<th scope="col">`, `<td>`, `<strong>`, `<code>`) rather than pipe Markdown—many syndication renderers mishandle GFM tables or inline `**` / backticks in cells. Parts **1, 3, 4, 12** follow this pattern.

---

## Post roster

| # | Publish (Fri) | Time (UTC) | Title | File |
|---|---------------|------------|-------|------|
| 1 | 2026-04-10 | 10:00 | Part 1: The End of Data Export — Why the Cloud is a Compliance Trap | 01-end-of-data-export-compliance-trap.md |
| 2 | 2026-04-17 | 10:00 | Part 2: Split-Brain — Client-Side Context vs Server-Side Reasoning | 02-split-brain-client-context-server-reasoning.md |
| 3 | 2026-04-24 | 10:00 | Part 3: Sanitization by Construction — The "Edge Compiler" | 03-sanitization-by-construction-edge-compiler.md |
| 4 | 2026-05-01 | 10:00 | Part 4: 4,669 Active Users in 28 Days — Referral Spike on Stateless Infra | 04-viral-scale-post-mortem-ga4.md |
| 5 | 2026-05-08 | 10:00 | Part 5: Local-First Mastery — Browser Storage as the Financial Vault | 05-local-first-browser-vault.md |
| 6 | 2026-05-15 | 10:00 | Part 6: Prompt Grounding — CFA-Grade Reasoning in a Stateless API | 06-prompt-grounding-system-prompt.md |
| 7 | 2026-05-22 | 10:00 | Part 7: The Viral Loop — Engineering K-Factor Without Portfolio Telemetry | 07-viral-loop-referral-events.md |
| 8 | 2026-05-29 | 10:00 | Part 8: Branding via Code — The Amber Terminal Email | 08-amber-terminal-email-css.md |
| 9 | 2026-06-05 | 10:00 | Part 9: Privacy-First Analytics — Aggregating Loop Velocity | 09-privacy-first-admin-analytics.md |
| 10 | 2026-06-12 | 10:00 | Part 10: Beyond the CSV — Universal Statement Parser (roadmap) | 10-roadmap-universal-statement-parser.md |
| 11 | 2026-06-19 | 10:00 | Part 11: Stateless B2B Gateway — Sovereign AI for Institutions (vision) | 11-vision-stateless-b2b-gateway.md |
| 12 | 2026-06-26 | 10:00 | Part 12: The Global Frontier — UK Engineering, Global Reach (Route to Rise) | 12-global-frontier-route-to-rise.md |

---

## Canonical and CTA (every post)

- **Canonical:** `https://www.pocketportfolio.app/book/sovereign-intelligence` (or blog slug once live).
- **CTA footer:**  
  *Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book or [try the app](https://www.pocketportfolio.app).*

---

## Cadence conflict note

- **Sovereign Intelligence (legacy roster):** Mon/Wed — `content/coderlegion-sovereign-intelligence-serial/`
- **Universal LLM Import:** Tue/Thu — `content/coderlegion-sovereign-serial/`
- **Sovereign Engineering (this series):** Fri — this folder

---

## Part 4 metrics (freeze before publish)

**Google Analytics 4** — Marketing performance (verify export at publish):

- **Range:** 2026-03-06 to 2026-04-02 (28 days).
- **Active users:** **4,669**
- **New users:** **4,500**

Cross-check `/admin/analytics` for **viral / referral** campaign metrics in the same window; GA4 supplies headline user counts.

Do not mix GA4 “users” with Firestore user counts without labeling both. Omit DAU/MAU as a hero stat unless the metric definition is verified.

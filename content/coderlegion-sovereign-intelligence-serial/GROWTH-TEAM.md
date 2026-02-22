# Growth Team — Sovereign Intelligence Serial (CoderLegion)

**Cadence:** Monday & Wednesday @ **9:00 AM EST**  
**Duration:** 6 weeks (12 posts)  
**Canonical book:** https://www.pocketportfolio.app/book/sovereign-intelligence

---

## Schedule (copy to calendar or cron)

| # | Day | Date | Time (EST) | Title | File |
|---|-----|------|------------|-------|------|
| 1 | Mon | 2026-03-02 | 09:00 | The Privacy Gap: Why sending financial ledgers to OpenAI is broken | 01-the-privacy-gap.md |
| 2 | Wed | 2026-03-04 | 09:00 | Architecting a Local-First Hybrid RAG for Finance | 02-hybrid-rag-architecture.md |
| 3 | Mon | 2026-03-09 | 09:00 | The Context Engine: Squashing 10,000 trades into 4,000 tokens | 03-the-context-engine.md |
| 4 | Wed | 2026-03-11 | 09:00 | AI Grounding: Connecting local data to live stock prices using Gemini 1.5 | 04-grounding-and-reality.md |
| 5 | Mon | 2026-03-16 | 09:00 | Prompt Guardrails: Forcing an LLM to only talk about finance | 05-prompt-guardrails.md |
| 6 | Wed | 2026-03-18 | 09:00 | Transient File I/O: Parsing massive CSVs in the browser without server storage | 06-transient-file-io.md |
| 7 | Mon | 2026-03-23 | 09:00 | Building Tactile AI: Optimistic UI and the Vercel AI SDK | 07-tactile-streaming-ux.md |
| 8 | Wed | 2026-03-25 | 09:00 | Economic Modeling: Running a free AI tier without going bankrupt | 08-economic-modeling.md |
| 9 | Mon | 2026-03-30 | 09:00 | Flash vs. GPT-4o: Benchmarking latency for financial reasoning | 09-flash-vs-gpt4o.md |
| 10 | Wed | 2026-04-01 | 09:00 | The Roadmap: Moving from AI Chatbots to Autonomous Financial Agents | 10-autonomous-agents.md |
| 11 | Mon | 2026-04-06 | 09:00 | Open Sourcing our Financial System Prompts (Code Dump) | 11-open-source-prompts.md |
| 12 | Wed | 2026-04-08 | 09:00 | Sovereign Intelligence: The Complete 25,000 Word Blueprint (Download) | 12-complete-blueprint.md |

---

## Pre-publish checklist (each post)

- [ ] **Canonical URL** is set in frontmatter: `canonical_url: https://www.pocketportfolio.app/book/sovereign-intelligence`
- [ ] **Cover/diagram** — image path is valid (e.g. `./images/si-figure-NN-*.svg` or upload to CoderLegion and set URL)
- [ ] **CTA** at end of body: "Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) or [Try the app](https://www.pocketportfolio.app)."
- [ ] **Tags** include: engineering, ai, local-first, finance (and topic-specific tags)
- [ ] **Series** field: "Building Sovereign Intelligence"

---

## Upload options

1. **Manual:** Each Monday and Wednesday at 09:00 EST, open the next `.md` file in this folder, copy content (or use CoderLegion’s import if supported), set publish time to 09:00 EST, publish.
2. **Cron/automation:** If CoderLegion supports scheduled posts via API or CSV import, use the table above as the schedule source. Ensure timezone is 9:00 AM EST.
3. **Batch import:** If the platform accepts a zip or folder upload, use `content/coderlegion-sovereign-intelligence-serial/` (all 12 .md files + `images/`). Then set each post’s publish date/time per the schedule.

---

## Do not conflict with Universal LLM Serial

- **Universal LLM Import** serial → **Tuesday & Thursday** @ 9:00 AM EST → `content/coderlegion-sovereign-serial/`
- **Sovereign Intelligence** serial → **Monday & Wednesday** @ 9:00 AM EST → this folder

Staggering ensures no same-day overlap and consistent cadence per series.

---

## Assets for CoderLegion

- **Markdown:** All 12 files in this directory (01-the-privacy-gap.md … 12-complete-blueprint.md).
- **Images:** `images/` contains si-figure-01 through si-figure-10 (SVG). If the platform requires uploaded images, upload the contents of `images/` and update any `./images/` paths in the markdown to the platform’s asset URLs, or use absolute URLs: `https://www.pocketportfolio.app/book-assets/figures/si-figure-NN-*.svg`.

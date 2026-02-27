# Deployment Report — 2026-02-27

**Scope:** Generate due blog post(s), deploy to production (PRE-PROD scope + autonomous blog).  
**Completed:** Blog generation (1 post), commit, push to GitHub, `vercel --prod` triggered.

---

## 1. Blog generation

| Item | Result |
|------|--------|
| **Posts due today (2026-02-27)** | 2 scheduled (How-to 14:00 UTC; Research 18:00 UTC) |
| **Generated this run** | **1** — *How to structure a "Monorepo" for Side Projects* (How-to) |
| **Not generated** | *Research: Algorithmic Trading Latency - Execution Speed Analysis* — scheduled for **18:00 UTC**. At run time (17:47 UTC) it was not yet due. Run `npm run generate-blog` after 18:00 UTC to generate it. |
| **Artifacts** | `content/posts/how-to-structure-a-monorepo-for-side-projects.mdx`, `public/images/blog/how-to-structure-a-monorepo-for-side-projects.png`, calendar updates (`content/how-to-tech-calendar.json`) |

---

## 2. Commit and push

| Item | Value |
|------|--------|
| **Commit** | `ff7ef91` — *🤖 Auto-generate blog posts (local run) + RUN-BLOG-GENERATION-LOCALLY.md* |
| **Branch** | `main` |
| **Pushed** | Yes — `origin/main` updated |
| **Files in commit** | New: `content/posts/how-to-structure-a-monorepo-for-side-projects.mdx`, `public/images/blog/how-to-structure-a-monorepo-for-side-projects.png`, `docs/RUN-BLOG-GENERATION-LOCALLY.md`. Updated: `content/how-to-tech-calendar.json` (and any calendar updates included in the commit). |

---

## 3. Vercel production deploy

| Item | Value |
|------|--------|
| **Command** | `npx vercel --prod --yes` |
| **Project** | `abba-lawals-projects/pocket-portfolio-app` |
| **Inspect URL** | https://vercel.com/abba-lawals-projects/pocket-portfolio-app/6Q46azk1vacnyJLs8xMKuH62rAoP |
| **Deployment URL** | https://pocket-portfolio-dma92q1jb-abba-lawals-projects.vercel.app |
| **Build** | Ran on Vercel (Washington, D.C. – iad1). Pre-build steps: importer, sitemaps (77,150 URLs), inject-firebase, book-assets. Next.js build: compiled successfully; static page generation was in progress (2799 pages). Confirm final status in the Inspect link. |
| **Production domain** | If this project’s production domain is `www.pocketportfolio.app`, it will serve this deployment once the build completes and is promoted. |

---

## 4. What was deployed (content and scope)

- **New blog post (live once build completes):**  
  **How to structure a "Monorepo" for Side Projects**  
  - URL: `https://www.pocketportfolio.app/blog/how-to-structure-a-monorepo-for-side-projects`  
  - Category: How-to in Tech.  
  - Calendar: `how-to-tech-calendar.json` updated; post status set to `published`.

- **PRE-PROD scope (already on `main` from earlier):**  
  Lead Magnet CTA on `/s/[ticker]/json-api` and `/s/[ticker]/dividend-history`; no code changes in this deploy beyond the new post and runbook.

- **Docs:**  
  `docs/RUN-BLOG-GENERATION-LOCALLY.md` — runbook for generating blog posts locally when GitHub Actions are blocked.

---

## 5. Local build note

- Full local `npm run build` did not complete (failed during “Collecting build traces” with ENOENT on `.next/server/app/settings/page.js.nft.json`).  
- Production build was performed on **Vercel**; the deploy does not rely on the local build.

---

## 6. Next steps

1. **Confirm deploy:** Open the [Inspect URL](https://vercel.com/abba-lawals-projects/pocket-portfolio-app/6Q46azk1vacnyJLs8xMKuH62rAoP) and ensure the build finished and the deployment is live.  
2. **Second post:** After **18:00 UTC**, run `npm run generate-blog` locally (or wait for the Generate Blog Posts workflow if Actions are unblocked), then commit, push, and deploy again.  
3. **Smoke-test (from PRE-PROD):** `/dashboard`, `/s/xvlxx/json-api`, `/s/xvlxx/dividend-history`, and `/blog/how-to-structure-a-monorepo-for-side-projects` once production is updated.

---

*Report generated after commit `ff7ef91`, push to `main`, and `vercel --prod` execution.*

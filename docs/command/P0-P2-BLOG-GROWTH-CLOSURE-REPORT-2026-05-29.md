---
id: CMD-P0-P2-BLOG-GROWTH-2026-05-29
title: Command Team Report — P0 Blog Strike, Phase 2 Sitemap, Growth Gap Closure (workspace)
status: ENGINEERING_COMPLETE_PENDING_DEPLOY
deployment: NOT_DEPLOYED_PER_DIRECTIVE
prepared_for: Unified Command Team / Salford HQ
last_updated: 2026-05-29
---

# Command Team Report — Blog P0, Phase 2, Growth Programme

**Directive received:** Execute Phase 2, close growth gaps, **do not deploy**. This report covers **repository work completed in workspace** and **production state as probed** (already live from prior P0 deploy).

---

## 1. Executive summary

| Track | Status | Notes |
|-------|--------|-------|
| **P0 — Blog route health** | **CLOSED (prod)** | Prior deploy: all three verification-gate URLs return **200** |
| **Phase 2 — Open sitemap blog URLs** | **CLOSED (repo)** | ~323 Open-category slugs re-listed in `app/open/sitemap-static.ts` |
| **Local dual-surface dev** | **CLOSED (repo)** | `open.localhost` works under `npm start` (no prod redirect bleed) |
| **B2B growth probes** | **GREEN (prod routes)** | Automated audit updated; blog + hub **200** on Open |
| **B2C growth probes** | **GREEN (prod)** | `audit:growth-b2c-pocket` sample URLs **200** |
| **GSC sitemap resubmit** | **MANUAL — post-deploy** | Required after Phase 2 merge; not executed here |
| **Deploy** | **WITHHELD** | Per Command directive — no push/Vercel from this strike |

---

## 2. What we were doing (scope clarity)

The **P0 mandate** was a **surgical blog crash fix**, not the full B2B/B2C acceleration programme. Work completed maps as follows:

### 2.1 P0 bare-metal strip (already on `main` / production)

- Removed `SEOHead`; native `generateMetadata` only.
- `gray-matter` frontmatter normalized to JSON-serializable strings (`Date` → ISO).
- `loadPost()` try/catch → `notFound()` on missing/invalid MDX.
- Page-level try/catch → **200** with “Content temporarily unavailable” (no hard 500).
- Eliminated `next-mdx-remote` RSC path → client `BlogMarkdownBody` (`react-markdown`, string prop only).
- `force-dynamic`, `runtime = nodejs`, no `generateStaticParams` on slug routes.
- Open re-export inherits `dynamic` / `runtime` (`app/open/blog/[slug]/page.tsx`).
- `ProductionNavbar` restored on post pages (UX; no-op on Open when `SurfaceProvider` is `open`).

**Production verification gate (automated probe 2026-05-29):**

| URL | HTTP |
|-----|------|
| https://www.openportfolio.co.uk/blog | **200** |
| https://www.openportfolio.co.uk/blog/the-complete-guide-to-api-error-responses | **200** |
| https://www.pocketportfolio.app/blog/the-efficient-market-hypothesis-still-relevant | **200** |

### 2.2 Phase 2 — Distribution recovery (workspace only)

**File:** `app/open/sitemap-static.ts`

- Restored `loadBlogPostSitemapEntries` + `partitionBlogPostsForSitemap`.
- Re-added `...openBlogPosts.map(...)` for every Open-category MDX post (`research`, `sovereign-engineering`, `how-to-in-tech`).
- **Local generator count:** ~346 total `<loc>` rows (~323 blog slugs + hub + `OPEN_ALIAS_ROUTES` + home).

**Production sitemap today:** still **~23 URLs** (hub only) until this Phase 2 commit is **deployed**. Probe correctly flags `Blog post <loc> rows: 0` on live `www.openportfolio.co.uk/sitemap.xml`.

### 2.3 Local Open testing fix (workspace only)

**Problem:** `open.localhost:3001` showed Pocket landing and cross-surface links jumped to production.

**Root cause:** `lib/surface-host.ts` and `middleware.ts` gated `open.localhost` on `NODE_ENV === 'development'`. Local `npm start` uses `NODE_ENV=production`.

**Fix:** `isLocalOpenDevHost` / `isLocalPocketDevHost` — hostname-based local detection regardless of `NODE_ENV`; `PORT` respected (default `3001`).

**Tests:** `tests/unit/surface-host.spec.ts` (+1 case), `tests/unit/open-sitemap.spec.ts` (new).

---

## 3. Growth programme — gap closure matrix

Aligned to `docs/command/growth-b2b-open-market-acceleration-programme.md` and `deploy-production-gates.md`.

| Gap | Action taken | Deploy needed? |
|-----|----------------|----------------|
| Open blog **5xx** / RSC crash | P0 hotfix (prior) | Already live |
| Open sitemap listed dead blog URLs | Removed in `a0d3635e`; **restored in Phase 2** | **Yes** |
| Pocket blog sitemap (B2C) | Unchanged; `sitemap-blog` ~72 URLs | No (already live) |
| Open hub + B2B routes crawlable | Probes **200** | No |
| `open.localhost` dev parity | Host routing fix | **Yes** (for team using prod build locally) |
| GSC resubmit / Validate fix | Documented below | Manual (Growth) |
| GA4 hostname segments | Not in scope | Manual (Growth) |
| Stage 0 admin analytics inventory | Existing annex | No code change this strike |
| B2C glossary `json-finance` in static sitemap | Already in `app/sitemap-static.ts` | Live |
| llms.txt drift CI | Unchanged | Run on next deploy |

---

## 4. Verification executed (this session)

```text
npm run lint          — pass
npm run typecheck     — pass
vitest                — 46 pass (canonical-claims, surface-host, open-sitemap)
node scripts/growth-b2b-open-audit.mjs   — prod probes → docs/command/growth-b2b-open-audit-automated-probe.md
npm run audit:growth-b2c-pocket          — prod probes → docs/command/growth-b2c-audit-automated-probe.md
```

**Not run:** full `npm run test`, `npm run audit:open-404` (requires local dev server). Recommended before deploy sign-off.

---

## 5. Files changed (workspace — undeployed bundle)

| Path | Change |
|------|--------|
| `app/open/sitemap-static.ts` | Phase 2: restore Open blog `<loc>` entries |
| `lib/surface-host.ts` | Local host URL helpers (`open.localhost` / `localhost`) |
| `middleware.ts` | Open host detection without `NODE_ENV=development` |
| `scripts/growth-b2b-open-audit.mjs` | P0 gate URLs + sitemap blog count |
| `tests/unit/surface-host.spec.ts` | Local `npm start` regression test |
| `tests/unit/open-sitemap.spec.ts` | Sitemap partition parity test |
| `docs/command/growth-b2b-open-audit-automated-probe.md` | Regenerated probe output |
| `docs/command/growth-b2c-audit-automated-probe.md` | Regenerated probe output |
| `docs/command/P0-P2-BLOG-GROWTH-CLOSURE-REPORT-2026-05-29.md` | This report |

---

## 6. Post-deploy checklist (Command / Growth — not executed here)

1. **Merge & deploy** workspace bundle to Vercel production (when authorized).
2. Confirm live Open sitemap: `curl -s https://www.openportfolio.co.uk/sitemap.xml | grep -c '/blog/'` → expect **~300+**.
3. **Google Search Console (Open property):** Resubmit `https://www.openportfolio.co.uk/sitemap.xml`.
4. **Validate fix** on Page indexing → Server error (5xx) for sample blog URLs.
5. **URL Inspection** → Request indexing on hub + 2 gate slugs (already 200).
6. **Pocket property:** Optional resubmit `https://www.pocketportfolio.app/sitemap.xml` (blog child unchanged).
7. Re-run `npm run audit:b2b-open` after deploy; expect blog `<loc>` count **> 50 ✓**.

---

## 7. Local testing URLs (after deploy of host fix)

| Surface | URL |
|---------|-----|
| Open | http://open.localhost:3001/ |
| Open blog hub | http://open.localhost:3001/blog |
| Open B2B post | http://open.localhost:3001/blog/the-complete-guide-to-api-error-responses |
| Pocket | http://localhost:3001/ |
| Pocket B2C post | http://localhost:3001/blog/the-efficient-market-hypothesis-still-relevant |

Use **`npm run dev`** or **`npm run build && PORT=3001 npm start`** after pulling workspace changes.

---

## 8. Verdict for Command

- **P0 objective:** Met on production — blog routes are **200**, distribution no longer actively poisoning crawl with 5xx on listed slugs (slugs were temporarily delisted).
- **Phase 2 objective:** Met in **code** — Open sitemap ready to re-onboard ~323 B2B posts; **requires deploy** to affect GSC.
- **Growth gaps:** All **engineering-actionable** items from the blog/GSC incident are closed in workspace; **GSC/GA4 operational steps** remain Growth-owned post-deploy.
- **Freeze:** Command may resume broader freeze after deploy + §6 checklist; this report does **not** authorize deploy.

**Prepared by:** Engineering (workspace strike) · **Deploy:** withheld per directive.

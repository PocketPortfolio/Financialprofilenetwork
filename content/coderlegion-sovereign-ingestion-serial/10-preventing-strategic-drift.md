---
title: "Part 10: Preventing Strategic Drift in the Production Pipeline"
date: "2026-07-27"
tags: ["engineering", "devops", "release", "quality", "governance"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-ingestion-covers/ing-10.png"
series: "Sovereign Ingestion & Stateless Inference"
---

# Preventing Strategic Drift: CTO, DevOps, Product, and Release Sequence

Marketing superlatives ship faster than middleware. **`docs/command/deploy-production-gates.md`** is the organisational invariant: no new technical claim in campaigns until the **four role gates** pass on the same production train.

This is how Consultant 1 (narrative) stays chained to Consultant 2 (grep).

---

## 1. CTO gates (architecture & security)

| # | Gate | Why it matters |
|---|------|----------------|
| C1 | Ship **Next.js** security baseline **with** host/Open changes on **same** deploy | Avoid middleware/route-tree drift between releases |
| C2 | `OPEN_HOSTS` / alias routes match production DNS | SSOT in `lib/canonical-claims.ts` |
| C3 | `/api/*` bypasses middleware matcher | APIs origin-agnostic — retest auth on both hosts |

---

## 2. DevOps gates (build + platform)

| # | Command / action |
|---|------------------|
| D1 | `npm run lint` |
| D2 | `npm run typecheck` |
| D3 | `npx vitest run tests/unit/canonical-claims.spec.ts` |
| D4 | `npm run test` (recommended) |
| D5 | `npm run clean:next && npm run build` (Vercel parity) |
| D6 | `npm run audit:open-404` (local dev + curl audit) |
| D7 | **llms.txt drift** — commit regenerated manifests |

---

## 3. Product gates (right audience, right URL)

Smoke **both** personas after deploy:

- **B2C:** `https://www.pocketportfolio.app/` — `/`, tools, advisor paths.
- **B2B:** `https://www.openportfolio.co.uk/` — `/`, `/architecture`, `/openbrokercsv`.
- **Redirects:** Pocket `/architecture` → Open; Pocket `/open/*` → Open canonical; Open `/dashboard` → Pocket.

Submit **both** sitemaps in Google Search Console; monitor redirect coverage 48–72h.

---

## 4. Release sequence

1. Merge release branch (single train).
2. Deploy Vercel production.
3. DNS cutover only after Preview smoke passes.
4. Neutral-network `curl -IL` smokes.
5. GSC sitemap resubmit.
6. Rollback plan: Vercel instant rollback + DNS TTL awareness.

Deeper context: `docs/command/production-readiness-dual-surface-2026-05-16.md`, `docs/command/production-routing-go-live-checklist.md`.

---

## Claims calibration linkage

`docs/command/claims-vs-codebase-calibration.md` §5: **no campaign should hard-launch new technical superlatives until deploy gates pass.** If prose in Part 1–9 outruns D6 or D7, you have **strategic drift** — fix the gate, then fix the tweet.

---

*Part 10 of **Sovereign Ingestion & Stateless Inference**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book, explore [Open Portfolio](https://www.openportfolio.co.uk), or [try Pocket Portfolio](https://www.pocketportfolio.app).**

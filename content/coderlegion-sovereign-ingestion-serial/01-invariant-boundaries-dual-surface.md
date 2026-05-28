---
title: "Part 1: The Architecture of Invariant Boundaries"
date: "2026-05-25"
tags: ["engineering", "architecture", "nextjs", "middleware", "open-portfolio", "finance"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-ingestion-covers/ing-01.png"
series: "Sovereign Ingestion & Stateless Inference"
---

# The Architecture of Invariant Boundaries: One Deployment, Two Audiences

Procurement teams ask whether Open Portfolio is a **separate product codebase**. Engineers ask whether Pocket and Open can drift into incompatible releases. Both questions have the same answer in our monorepo: **one Next.js deployment**, **one Vercel project**, **host-aware routing** at the edge.

This is not a metaphor for “multi-tenant SaaS.” It is observable middleware behaviour you can curl after deploy.

---

## What “dual surface” means in code

<table>
<thead>
<tr>
<th scope="col">Surface</th>
<th scope="col">Canonical host</th>
<th scope="col">Route tree</th>
<th scope="col">Audience</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Pocket Portfolio</strong></td>
<td><code>www.pocketportfolio.app</code></td>
<td>Default App Router product routes (<code>app/landing</code>, dashboard, tools)</td>
<td>B2C terminal · adversarial test harness</td>
</tr>
<tr>
<td><strong>Open Portfolio</strong></td>
<td><code>www.openportfolio.co.uk</code></td>
<td><code>app/open/*</code> (rewritten on Open hosts)</td>
<td>B2B / procurement / engineering narrative</td>
</tr>
</tbody>
</table>

**SSOT for host lists and marketing claims:** `lib/canonical-claims.ts` (`OPEN_HOSTS`, `OPEN_CANONICAL_HOST`, positioning strings). **Runtime gate:** `middleware.ts` plus `lib/surface-host.ts` helpers.

---

## Middleware: the invariant boundary

On an Open host, non-canonical hostnames get a **308** to `www.openportfolio.co.uk` so crawlers consolidate duplicates. The canonical Open host **rewrites** outward paths to `app/open/<path>` — the B2B chrome and metadata live in that route group.

On Pocket, paths under `/open/*` **redirect** to Open canonical URLs (permanent consolidation). Consumer-only routes on an Open host (e.g. dashboard) **307** back to Pocket so procurement visitors do not land in retail product flows by accident.

**Local dev:** `open.localhost` mirrors production host logic without editing `/etc/hosts` — browse Pocket at `localhost:3001` and Open at `open.localhost:3001`.

**API caveat (deploy gate C3):** `/api/*` bypasses the middleware matcher by design. APIs are origin-agnostic; auth flows that assume a Pocket origin must be smoke-tested on both hosts after every production train. See `docs/command/deploy-production-gates.md`.

---

## `app/open/page.tsx` is the procurement front door

The Open landing is not a stub redirect — it is the **infrastructure narrative** surface: sovereign ingestion, importer npm stats, design challenge, architecture deep-links. Pocket’s landing (`app/landing/page.tsx`) remains the **high-velocity B2C harness** (Part 6). Same repo, different host, different hero story.

---

## What we do **not** claim

- **Two production codebases** — false; one monorepo, one deploy artifact.
- **“Zero server”** for signed-in users — false; Firebase remains authoritative for authenticated trades (Part 4).
- **Open as a separate company stack** — false; it is a **host + route surface** on the same deployment.

---

## Verify after deploy (Product gate §3)

From `docs/command/deploy-production-gates.md`:

- `https://www.pocketportfolio.app/architecture` → **301** to `https://www.openportfolio.co.uk/architecture`
- `https://www.openportfolio.co.uk/dashboard` → **307** to Pocket dashboard
- Both sitemaps return **200** on their respective canonical hosts

These curls are the **invariant boundary receipts** — marketing copy should never outrun them.

---

*Part 1 of **Sovereign Ingestion & Stateless Inference**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book, explore [Open Portfolio](https://www.openportfolio.co.uk), or [try Pocket Portfolio](https://www.pocketportfolio.app).**

---
title: "Part 6: The Continuous Evaluation Harness"
date: "2026-06-29"
tags: ["engineering", "product", "b2c", "testing", "open-source"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-ingestion-covers/ing-06.png"
series: "Sovereign Ingestion & Stateless Inference"
---

# The Continuous Evaluation Harness: B2C Velocity as SDK Stress Surface

Open Portfolio is the **procurement story**. Pocket Portfolio is the **live adversarial test harness** — millions of real import edge cases, UX density, and referral-scale traffic that stress the same primitives Open sells.

The harness is not a separate QA environment. It is **`app/landing/page.tsx`** plus the product surface it feeds.

---

## What the landing actually exercises

`app/landing/page.tsx` is a large, high-churn B2C shell: import CTAs, feature proofs, social proof, and integration with community blocks via `CommunityContent.tsx`. Every week of retail usage surfaces:

- Broker CSV variants the universal adapter mis-parsed,
- Quota and auth edge cases on Firebase,
- Mobile layout breaks on dense terminal UI (Part 11),
- Performance cliffs on huge trade histories before `buildPortfolioContext` caps disclosure.

Those failures become **SDK hardening tasks** — not slide-deck hypotheticals.

---

## CommunityContent: signal, not marketplace

`app/components/CommunityContent.tsx` renders contributor-facing links and narrative — it supports **README-OSS-WORKFLOW.md** (issues → RICE → discussions → CODEOWNERS). It does **not** imply a runtime plugin economy inside `app/`.

Calibration §4 is explicit: **do not** promise an extension marketplace. **Do** say we are building contributor loops with inspectable OSS.

---

## Whale Watch and scale receipts (honest use)

Operational scale metrics (e.g. **4.7B** data points via Whale Watch, **£7B** managed-asset substrate in founder engineering history) belong in **trust surfaces** (`lib/canonical-claims.ts`, `scripts/build-llms-txt.ts`) — not as proof that every user’s ledger is local-only. They prove the harness has seen **serious volume**, not that architecture is “zero server.”

---

## Harness → Open feedback loop

<table>
<thead>
<tr>
<th scope="col">Harness observation</th>
<th scope="col">Open / SDK response</th>
</tr>
</thead>
<tbody>
<tr>
<td>New broker CSV shape</td>
<td>Adapter PR in <code>packages/importer</code></td>
</tr>
<tr>
<td>Mapping UX confusion</td>
<td>Universal inference + docs update</td>
</tr>
<tr>
<td>Inference over-breadth concern</td>
<td><code>contextBuilder</code> schema tightening + IP doc</td>
</tr>
<tr>
<td>Procurement 404 on B2B path</td>
<td><code>npm run audit:open-404</code> gate (Part 10)</td>
</tr>
</tbody>
</table>

---

## Self-funding narrative (calibrated)

B2C growth funds engineering time to keep the **ingestion + inference boundary** honest. It does **not** mean Pocket is only marketing — it means retail velocity is an **asset** in the same monorepo as Open’s infrastructure story (Part 1).

---

*Part 6 of **Sovereign Ingestion & Stateless Inference**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book, explore [Open Portfolio](https://www.openportfolio.co.uk), or [try Pocket Portfolio](https://www.pocketportfolio.app).**

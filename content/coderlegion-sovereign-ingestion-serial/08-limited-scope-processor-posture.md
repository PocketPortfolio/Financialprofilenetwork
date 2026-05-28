---
title: "Part 8: Limited-Scope Processor Posture"
date: "2026-07-13"
tags: ["engineering", "gdpr", "compliance", "privacy", "architecture"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-ingestion-covers/ing-08.png"
series: "Sovereign Ingestion & Stateless Inference"
---

# Mitigating Risk via the Limited-Scope Processor Posture

> **Disclaimer:** This essay is **engineering narrative** for technical readers — not legal advice. GDPR “processor” positioning requires **legal + engineering sign-off** before use in contracts (`docs/command/claims-vs-codebase-calibration.md`).

Procurement teams do not buy architecture diagrams — they buy **audit perimeters**. Our perimeter is intentionally narrow: minimise what the inference path **can** retain by **code structure**, not slides alone.

---

## Art. 5(1)(c) as engineering target

GDPR **data minimisation** (Art. 5(1)(c)) asks: collect only what is adequate, relevant, and limited to purpose. We map that to mechanisms:

| Mechanism | Evidence |
| --- | --- |
| Bounded portfolio context | `app/lib/ai/contextBuilder.ts` |
| Stateless portfolio payload handling | `app/api/ai/chat/route.ts` header + `docs/IP-TECHNICAL-MECHANISMS.md` |
| Truncated CSV mapping preview | IP doc §3 |
| Prefs-only Zustand persist | `portfolioStore` `partialize` |
| Compiled trust lines in `llms.txt` | `scripts/build-llms-txt.ts` |

`lib/canonical-claims.ts` exposes **`MOAT_CLAIMS.limitedScopeProcessor`** with `evidenceRefs` and `externalRefs` to Art. 4(8) and Art. 5(1)(c) — for **authorised surfaces** only (CoderLegion, press, npm, etc.).

---

## Limited-Scope Processor (defined)

**Phrase (authorised):** “Limited-Scope Processor”  
**Long form:** Broker data parses in-browser; AI inference runs stateless with respect to portfolio payload; UI persist is partialized — minimising per-user footprint **by design**.

This is **not** “zero regulatory obligation.” It is **smaller technical scope** than “we warehouse every export and log every prompt forever.”

---

## Metadata lane vs corpus lane

<table>
<thead>
<tr>
<th scope="col">Lane</th>
<th scope="col">Examples</th>
<th scope="col">Retention character</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Corpus (inference)</strong></td>
<td>Bounded <code>context</code> string per request</td>
<td>Ephemeral in route design (Part 3)</td>
</tr>
<tr>
<td><strong>Metadata</strong></td>
<td>Quota counters, tier, referral analytics</td>
<td>Persisted for product ops — not full ledger mirror</td>
</tr>
</tbody>
</table>

`app/designchallenge/page.tsx` discusses audit-perimeter reduction for design partners — verify wording matches legal review before quoting in RFPs.

---

## What auditors should grep

1. `buildPortfolioContext` — confirm no account-id fields in template.
2. `/api/ai/chat` — confirm no `setDoc` of `context` on portfolio collections.
3. Importer — confirm full CSV not required server-side for mapping default.

---

*Part 8 of **Sovereign Ingestion & Stateless Inference**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book, explore [Open Portfolio](https://www.openportfolio.co.uk), or [try Pocket Portfolio](https://www.pocketportfolio.app).**

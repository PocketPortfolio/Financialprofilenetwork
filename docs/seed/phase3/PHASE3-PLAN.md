# Phase 3 Plan — GEO / Social Polish (Activation)
**Date:** 2026-04-28  
**Phase:** 3 (Activation)  
**Owner split:** Engineering + Founder  
**Canonical Anchor:** https://www.pocketportfolio.app/press  
**Tagline (zero-drift):** The Sovereign Ingestion & Inference Layer

---

## Mission
Turn Phase 2 “Receipts” into a discoverable **Authority Loop**. Every distributed node (npm, GitHub, socials, search indices) should converge on the Canonical Anchor and reinforce a consistent entity graph.

---

## P0 — Index → Verify → Reciprocate (checklist)

### 1) Index (Founder-owned)
Submit crawl requests in **Google Search Console** and **Bing Webmaster Tools** for:
- https://www.pocketportfolio.app/press
- https://www.pocketportfolio.app/press/abba-lawal
- https://www.pocketportfolio.app/learn/sovereign-finance
- https://www.pocketportfolio.app/learn/sovereign-stack
- https://www.pocketportfolio.app/learn/local-first

**Receipt to capture**
- Screenshot or export showing “URL is available to Google” / “Indexing requested”.
- Bing equivalent submission confirmation.

### 2) Verify (Engineering-owned)
Run link + schema verification to ensure crawlers and due-diligence bots get a clean 200 + consistent metadata.

**Required verifications**
- `/press` returns **HTTP 200**.
- npm “homepage” for all `@pocket-portfolio/*` packages resolves to the Canonical Anchor.
- GitHub repo homepage and description match the tagline + anchor.
- `/press` and the three Salford `/learn/*` routes emit valid `Article` JSON-LD.

**Receipt to capture**
- A short markdown “probe log” committed under `docs/seed/phase3/evidence/`.

### 3) Reciprocate (Founder-owned, Engineering supports copy-paste)
Ensure the following external nodes contain:
- **Tagline**: “The Sovereign Ingestion & Inference Layer”
- **URL**: https://www.pocketportfolio.app/press

**Nodes**
- LinkedIn personal
- LinkedIn company
- dev.to profile website field
- CoderLegion external link

**Receipt to capture**
- Screenshot links visible + clickable.

---

## P1 — Authority Telemetry

### Goal
Quantify the funnel from npm/GitHub/social to `/press` + `/learn/*`.

### Outputs
- Weekly trend snapshot: `/press` visits, top referrers, and `/learn/*` assist clicks.
- A single dashboard view usable for Manchester/Leeds diligence.

---

## P1 — Manifesto / Proof Pack packaging

### Goal
Convert `docs/seed/deck-summary.md` into a public-facing “Proof Pack” that:
- is citable
- links back to `/press`
- compresses the Salford claims + citations into a single artifact

### Candidate shapes
- `/press` expansion section (“Proof Pack”)
- a short `/learn` hub page linking to the three Salford routes
- a canonical markdown-to-page artifact for journalists/VC diligence

---

## Definition of Done (Phase 3)
- **Indexed**: `/press` + three Salford `/learn/*` routes indexed (GSC/Bing evidence captured).
- **Zero drift**: tagline + anchor consistent across npm, GitHub, and socials.
- **Telemetry**: weekly authority snapshot is repeatable and stored.
- **Receipts**: Phase 3 evidence folder contains probes + screenshots list.


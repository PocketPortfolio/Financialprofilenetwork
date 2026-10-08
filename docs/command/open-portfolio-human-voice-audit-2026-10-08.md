---
id: OP-CMD-OPEN-HUMAN-VOICE-AUDIT-2026-10-08
title: Open Portfolio landing — human-voice audit + remediation plan (Geraint North feedback)
status: PHASE_1_SHIPPED · PREPARE_PROD
date: 2026-10-08
trigger: Geraint North (Arm) — site “reads as AI-generated gobbledegook”
surface: https://www.openportfolio.co.uk/
ssot_copy: lib/canonical-claims.ts → OPEN_LANDING_COPY
ssot_visual: app/open/_components/OpenLandingSovereignGrid.tsx (+ plate overlays)
governance: docs/command/claims-vs-codebase-calibration.md §6b
shoot: OI Solo S1 · Fri 9 Oct 2026 (parallel — voice rewrite not blocked)
---

# Open Portfolio — human-voice audit & plan

## Phase 1 shipped (prod prep)

| File | Change |
|------|--------|
| `lib/canonical-claims.ts` → `OPEN_LANDING_COPY` | Full human-voice rewrite (S1 cadence) |
| `app/open/page.tsx` | Job-led title + OG description |
| `app/components/compliance/complianceBadge.ts` | US/CA/AU + default pills plain English |
| `OpenLandingSovereignGrid.tsx` | Kill “systematic perimeter alignment” |
| `OpenLandingPackageTerminal.tsx` | “Open-source packages · npm” |

**Principle:** Split surfaces. **Homepage = human.** **Architecture / learn = citation engine.**

## Org-role verdict

| Role | Vote | Note |
|------|------|------|
| **CEO** | **AGREE · fix voice** | External peer confirmed internal risk. Authenticity > AEO density on first paint. |
| **Head of Marketing** | **GO — voice owner** | Homepage must sound like Abba; AEO stays on `/architecture` + `/learn/*`. |
| **Head of AI** | **GO — keep thesis** | Architecture true; jargon stack false. Claim gate unchanged. |
| **Creative** | **GO — kill decorative dialect** | Cube / grid labels are the worst offenders. |
| **CCO** | **GO — ICP still diligence** | Procurement language OK *below* fold; first screen for humans. |
| **Eng** | **STANDBY** | No product change — copy + chrome only. |
| **Platform** | **R — deploy** | Lint + typecheck green → prod. |

---

## 1. Audit summary (landing)

### Agree with Geraint
- First viewport opens with acronym soup before a product sentence.
- Decorative labels read generated (“Systematic perimeter alignment”).
- Same clauses recycle (IdP / approved storage / not a vendor-hosted ledger warehouse).
- FAQ answers are citation blocks, not spoken English.
- Page title/meta lead with BYOC, not the job-to-be-done.

### Keep (substance)
- H1 job statement is strong once reached.
- “Plumbing fitting, not another vault” metaphor.
- Dual-surface honesty (Pocket = harness, Open = enterprise boundary).
- §6b-aware diligence framing (DORA / EU AI Act as context, not certification).
- Real receipts (adapter count, MIT importer, live harness).

### Root cause
Homepage was optimized as **diligence + AEO substrate** (`OPEN_LANDING_COPY` + FAQ/AEO patterns in `canonical-claims.ts`). That dialect won the fold. Peer engineers bounce before the H1.

---

## 2. Voice rules (locked)

**Say (human):**
- What you do in one breath: *AI over wealth data without copying the client ledger into another vendor cloud.*
- You keep login + storage; we assemble a small summary; only that goes to the model.
- Pocket is the live test app; Open is the enterprise boundary.

**Avoid on first screen:**
- BYOC / IdP / substrate / harness / perimeter alignment / warehouse-to-infer / sovereign intelligence (as definition)
- Stacking 3+ jargon nouns in one sentence
- Repeated “not a vendor-hosted ledger warehouse” more than once above the fold

**Allowed below fold / on `/architecture`:**
- BYOC, bounded context, stateless hop, DORA, procurement map — once each idea is already plain.

**Plain-English glossary (use on homepage):**

| Internal | Human |
|----------|--------|
| BYOC | You keep your cloud / login / storage |
| Bounded context | Small approved summary |
| Stateless inference | Model call that doesn’t keep a copy of the book |
| Harness | Live test product (Pocket) |
| Substrate | Same underlying pipes |
| Perimeter | Who can see which data |
| Sovereign intelligence | *(avoid on homepage)* → “AI that stays inside your control” |

---

## 3. Priority defects (ordered)

| P | Location | Defect | Owner |
|---|----------|--------|-------|
| **P0** | Meta title / OG | “BYOC AI Infrastructure for Wealth-Tech” | Marketing |
| **P0** | Top chip + banner | BYOC / Inspectable stack before H1 | Marketing + Creative |
| **P0** | `OpenLandingSovereignGrid` labels | “Systematic perimeter alignment” / regulated-vertical dialect | Creative |
| **P0** | Hero body | Jargon before plain path | Marketing + Head of AI |
| **P1** | Proof strip / Pocket bullets | harness / substrate density | Marketing |
| **P1** | FAQ Q1 “sovereign intelligence” | Definition reads LLM-paste | Head of AI + Marketing |
| **P1** | Contact placeholder | warehouse-to-infer jargon | Marketing |
| **P2** | `/architecture` + AEO FAQ blocks | Keep citation voice — **label as deep dive**, don’t lead homepage | Marketing |
| **P2** | Footer identity | Pocket retail / BIP / market-data blur for B2B peers | Marketing + CPO |
| **P3** | Learn hub index | Soften card titles that only say “sovereign” | Marketing |

---

## 4. Target first viewport (draft direction — lock in rewrite pass)

**Eyebrow:** Open Portfolio · for wealth platforms  
**H1:** *(keep)* Run AI over wealth data without building another client-ledger warehouse.  
**Body:** You keep your login and your client data store. We turn broker and portfolio records into a small approved summary, and only that summary goes to the AI model — Gemini, OpenAI, or your own.  
**Proof (short):** 19 broker importers · open-source parsing · live consumer app that proves the pipes · enterprise path uses *your* storage  

BYOC and architecture links move to secondary CTA / section 2.

---

## 5. Execution plan

### Phase 0 — Hold (now → S1)
- **Fri 9 Oct:** S1 shoot absolute. No homepage rewrite tonight.
- Geraint: short ownership reply already in motion (no AEO excuse essay).

### Phase 1 — First paint (target: **w/c 13 Oct**)
1. Rewrite `OPEN_LANDING_COPY` hero + eyebrow + proof strip (Marketing + Head of AI).
2. Replace Sovereign Grid decorative labels with plain or remove (Creative).
3. Change `app/open/page.tsx` metadata title/description to job-led English.
4. Soften FAQ item 1 + contact placeholder.
5. Visual QA: Geraint-test — “would an Arm Fellow call this gobbledegook in 10 seconds?”

**Exit:** First viewport readable aloud in under 20 seconds without acronym decode.

### Phase 2 — Diligence split (target: **w/c 20 Oct**)
1. Keep dense BYOC / AEO language on `/architecture` and selected `/learn/*`.
2. Homepage FAQ = human answers; link “For procurement / answer engines → architecture”.
3. Footer: demote Pocket retail clutter on Open surface (or clear “For advisors → Pocket”).
4. One founder-voice paragraph (Abba) optional near social proof — authentic, not bio spam.

### Phase 3 — Measure
- Qualitative: next peer (Arm / systems) reaction.
- Quantitative: diligence-form starts, time-on-hero (if available), bounce — not vanity MAU.
- Do **not** optimize homepage again for AEO at the cost of Phase 1 voice.

---

## 6. RACI

| Activity | CEO | Marketing | Head of AI | Creative | CCO |
|----------|-----|-----------|------------|----------|-----|
| Voice lock / approve | **A** | **R** | C | C | I |
| Hero + FAQ copy | A | **R** | **C** | I | C |
| Visual label kill | I | C | I | **R** | I |
| Claim gate on rewrite | A | C | **R** | I | I |
| AEO stays on architecture | I | **R** | C | I | I |
| Geraint follow-up if site fixed | **A** | I | **R** | I | C |

---

## 7. Explicit non-goals
- No product architecture change for this audit.
- No “we partner with Arm” language on site.
- No deletion of `/architecture` citation blocks — **relocate**, don’t gut SEO/AEO entirely.
- No homepage rewrite during S1 shoot day.

---

## 8. Next action after S1
CEO/Marketing: schedule **Phase 1 rewrite session** (90 min) → PR against `OPEN_LANDING_COPY` + grid labels + metadata. Head of AI claim-gates. Creative ships visual. Then optional soft note to Geraint only if Phase 1 is live.

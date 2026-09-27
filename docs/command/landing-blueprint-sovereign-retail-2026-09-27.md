---
id: OP-CMD-LANDING-BLUEPRINT-2026-09-27
title: Org-roles blueprint — Sovereign and Retail landing design vs growth strategy
status: SUBMITTED · COMMAND REVIEW
date: 2026-09-27
owners: [CEO (A), CCO, CPO, Head of Marketing, Head of Creative Studios, Head of AI, Head of Product Engineering]
surfaces:
  - Sovereign: www.openportfolio.co.uk (OpenLandingClient + OPEN_LANDING_COPY)
  - Retail host: www.pocketportfolio.app (LandingVariantGate → control | retail)
ruler:
  - docs/command/homepage-diligence-gtm-lane-lock-2026-09-21.md
  - docs/command/revenue-equation-lock-2026-09-21.md
  - docs/command/phase3-arr-attribution-2026-09-21.md
  - docs/command/growth-strategy-state-2026-09-02.md
  - docs/command/roles/_locks/2026-q3-camilla-growth-hub-lock.md
  - docs/command/camilla-park-script-2026-09-23.md
governance: docs/command/claims-vs-codebase-calibration.md §6b
amended: 2026-09-27 — Bank-grade privacy. Zero inference warehousing. added to the claim-gate allow-list
---

# Landing blueprint — Sovereign and Retail vs growth strategy

**Submitted:** 27 Sep 2026 · org roles, joint read of the live pages against locked strategy.  
**Ask of Command:** accept the verdicts below. This is a fit review of pages already in the repo. It is not a new retail positioning exercise.

## Verdict

| Surface | Design & flow vs strategy | Command call |
|---------|---------------------------|--------------|
| **Sovereign** — Open homepage | **Matches** the Stages 3–4 diligence backstop | Hold the page. Close the attribution gap on the lead record. |
| **Retail host** — Pocket homepage | **Split, and the default face misses** | Freeze the A/B. Keep the retail variant as the standing consumer face. Keep **Bank-grade privacy. Zero inference warehousing.** Remove the hero path into farm tickers. |

Paid Stripe keys remain the Pocket pin (2 Sep). £1M ARR / £100k ACV / 50 qualified opportunities remains the Open pin (21 Sep). Q4 bandwidth stays on Open Portfolio commercial execution and Open Intelligence distribution. Pocket stays the live harness under flows that already exist.

---

## The ruler (what “match” means)

Later locks win where they narrow earlier programmes.

1. **Open homepage job** (21 Sep, active). Stages 3–4 only: aggregator / platform diligence, and enterprise SDK / BYOC design-partner conversations. Primary conversion: **Book a diligence call** → `#contact`. Secondary: **Read the architecture brief** → `/architecture`. Outbound remains the IFA and mid-market engine. The homepage catches diligence traffic. It is not the IFA acquisition page.
2. **Open revenue math** (21 Sep, active). 10 wins from 50 qualified opportunities. SEO, AEO, and GEO source or influence at least 25 of those 50. A form submit is an inquiry. `qualified_opportunity` is a CCO promotion after company, role, perimeter, and a booked next step inside 14 days.
3. **Pocket pin** (2 Sep, still standing). Paid Stripe keys ≥ 1. Import wedges are the offense. Farm `/s/*` volume is the thing being reduced. Geo ads stay frozen.
4. **Packaging** (Q3 lock). Retail £12/mo · £100/yr. Enterprise £35k/yr SDK + meter. The two prices stay on their own surfaces.
5. **Q4 bandwidth** (23 Sep). No new B2C campaigns, surveys, or retail positioning exercises. Existing automated signup and marketing stay. Claim-gate repairs and a hero that currently feeds the farm are defects in the live flow, not a new campaign.
6. **Claim gate.** No zero-leakage theatre, no certification language the company does not hold, no unauthorized logos, no mathematical guarantees.

---

## Sovereign — Open Portfolio homepage

**Code:** `app/open/_components/OpenLandingClient.tsx` · copy SSOT `OPEN_LANDING_COPY` in `lib/canonical-claims.ts` · form `app/open/_components/OpenContactForm.tsx` → `POST /api/open-portfolio/contact`.

### Flow as built

| # | Section | Job on the page | Exit |
|---|---------|-----------------|------|
| 1 | Hero | BYOC boundary: run AI over wealth data without a new client-ledger warehouse | Primary **Book a diligence call** → `#contact`. Secondary **Read the architecture brief** → `/architecture` |
| 2 | Proof strip | Buyer keeps IdP and storage; dedicated broker adapters; bounded inference; Pocket is the live harness | Architecture |
| 3 | BYOC | “Plumbing fitting, not another vault.” | Architecture |
| 4 | Boundary | Raw client ledger stops at the edge; buyer approves aggregate context | Architecture map |
| 5 | Pocket harness | Pocket proves the pipes. Pocket is not the enterprise store. | `https://www.pocketportfolio.app` |
| 6 | Implementation | Map perimeter → define bounded context → validate a scoped pilot | `/openbrokercsv` |
| 7 | Board / procurement | Smaller evidence surface, clearer vendor assessment, scoped processor model. Founder NGV line is labelled a prior-role credential | Mid-page **Book a diligence call** |
| 8 | FAQ | Six diligence questions, FAQ schema for AEO | Includes `/tier1designpartner` inside one answer |
| 9 | Contact | Company, role, context, perimeter problem. Reply promised in one working day | Persists an **inquiry** |

Footer pathways (Design Partnership, advisor and DORA learn pages, BIP) sit off the header and off the index CTAs, per `OPEN_LANDING_FOOTER_PATHWAYS`.

### Fit

The page does the job the 21 Sep lane lock assigned.

- One commercial verb in the hero: book diligence.
- One proof verb beside it: read the architecture.
- Buyer, IdP, approved storage, and bounded context are the nouns. Pocket is named as the harness.
- Enterprise price is absent. That is correct. £35k is a CCO conversation, not a homepage SKU.
- Open Intelligence is absent as a CTA. That is correct. OI is upstream education. This page is the catch.
- Founder social proof carries the “not an Open Portfolio customer claim” qualifier required by the proof-strip receipt.
- The form collects the fields the promotion rule needs (company, role, perimeter, context) and writes `pipelineStage: inquiry`.

### Gaps that are measurement, not a redesign

| Gap | Evidence | Owner |
|-----|----------|-------|
| Lead attribution lands as `unknown` | `OpenContactForm` posts company, role, context, message. It does not send `attributionChannel`. `recordOpenPortfolioContactLead` then stores `attributionChannel: 'unknown'`. Phase 3 needs `first_touch_channel` and `seo_aeo_geo_influenced` on the opportunity. | Eng stamps the field. Marketing defines the channel map. CCO still promotes the stage. |
| Form success is an inquiry | `trackEvent('homepage_form_submitted')`. `trackQualifiedOpportunity` is a separate function and is not called from this form. That matches the CRM rule. The Phase 3 scoreboard at 0 is a pipeline fact, not a missing button. | CCO |
| Pocket cross-link | Harness section CTA leaves the diligence host for the consumer host. Copy above the link is honest. The link is a proof exit, and it should stay visually under the diligence CTA. | Creative confirms hierarchy on the next visual pass. No new section. |
| Third proof path | Implementation CTA goes to `/openbrokercsv`, not `#contact`. Useful for a technical buyer. It must stay subordinate to the diligence call. | CPO + Creative |

**Head of AI:** Sovereign copy in `OPEN_LANDING_COPY` is inside the claim gate on this read. No SOC 2 line, no zero-leakage line, no unnamed Tier-1 logo, founder credential qualified.

**CCO:** This page can catch a diligence conversation. It cannot originate the 50 opportunities by itself. IFA and named-room outbound stay parallel. Do not retitle the hero into an IFA lander.

**Marketing:** FAQ schema and the architecture secondary support the AEO/GEO half of the revenue equation. Demand still has to arrive from import-adjacent and architecture queries, comparison cluster, and OI. The homepage is the conversion backstop for that demand.

---

## Retail — Pocket Portfolio homepage

**Code:** `app/landing/page.tsx` → `LandingVariantGate`. Resolution order: `?variant=` → cookie → A/B assignment → **control**. Control is `app/landing/ControlLandingPage.tsx`. Retail is `app/landing/RetailLandingPage.tsx` with copy in `lib/landing-retail-copy.ts` (Command-approved 10 Jun 2026).

Two different homepages are live on the consumer host. Strategy needs one job: harness use, then a paid key, without feeding the farm and without speaking as the enterprise product.

### Control flow (default until a variant sticks)

| # | What the visitor hits | Where it goes | Strategy read |
|---|------------------------|---------------|---------------|
| 1 | Chip: “For IFAs & wealth operators →” | `/for/advisors` | IFA acquisition painted on the consumer hero. Lane lock puts IFA outbound off this host. |
| 2 | H1: “Sovereign Intelligence for Serious Portfolios.” | — | Enterprise noun on the retail host. |
| 3 | Band: “Bank-grade privacy. Zero inference warehousing. 100% analytical command.” Plus £12/mo or £100/yr | — | Price is present. The first two sentences are on the claim-gate allow-list (27 Sep). “100% analytical command.” is not. |
| 4 | Primary button: “Launch The Terminal” | Dashboard | Activation, not import and not checkout. |
| 5 | “Start here — pick one” | 1 ticker search → `/s/{ticker}` · 2 local CSV demo · 3 open terminal | Path 1 sends the homepage into the farm surface the 2 Sep strategy is shrinking. |
| 6 | CSV drop zone, then snare | `/sponsor` Founders Club | A browser demo, then Founders. The shipped post-import commercial path is Developer Utility checkout, not this snare. |
| 7 | Later: GitHub, npm, architecture on `openportfolio.co.uk`, advisor links, FAQ | Mixed | FAQ answer: the product is open source and the community will decide premium later. Same page already states £12/£100. |

### Retail-variant flow (A/B arm)

| # | Section | Exit | Strategy read |
|---|---------|------|---------------|
| 1 | H1: “Master your wealth across every broker, in one secure place.” Privacy band. Primary **Import your portfolio (Free)**. Secondary **Explore Founder's Club** | Drop zone, then `/sponsor` | Single consumer job. Price path is Founders. |
| 2 | Local CSV demo → “Your portfolio is ready. Unlock Pocket Analyst with Founder's Club.” | `/sponsor` | Same demo-snare pattern as control. Still not the real import → Developer Utility path. |
| 3 | Analyst block. Eyebrow on this variant: “New: Sovereign routing” | Try Ask AI / watch demo | “Sovereign” on the consumer page blurs the two products. |
| 4 | Trust: “Trusted by investors and wealth professionals” + download count. Badges: bank-level encryption, no data sold, secure edge processing | — | “Trusted by” plus a download counter implies a customer set the evidence gate has not approved. “Bank-level encryption” is certification-adjacent. |
| 5 | Receipts, product portal (Drive sync, Founders), FAQ | Founders on the portal card | FAQ is coherent: free import, Founders unlocks Analyst at £12/mo or £100/yr. |
| 6 | Footer line to `/for/advisors` | Advisor workspace | De-emphasized. This is the right altitude for an IFA pointer on Pocket. |

### Fit

The retail variant is the closer match to “Pocket is the harness, and the commercial step is the existing £12/£100 Founders path.”

The control variant fights three locks at once:

- It speaks Sovereign / IFA in the first screen, which is the Open and outbound job.
- It offers ticker search into `/s/*`, which is the farm the de-farm programme is retiring from the growth story.
- Its FAQ disagrees with the £12/£100 price on the hero. The privacy line on that hero is allowed: **Bank-grade privacy. Zero inference warehousing.**

Neither variant is the post-import Developer Utility checkout. That path lives after a real import (`postImportDeveloperUtilityHref`, recorded 2 Sep). The landing snare sells Founders after a local demo. CPO owns that as one pricing system with two front doors. Unifying them is product work. It is not a reason to design a third homepage this quarter.

**Q4 rule applied:** do not open a new retail IA test, a survey, or a positioning rewrite. End the current test by choosing the arm that already exists.

---

## Role findings

### CEO (accountable)

Board view stays paid conversion, pilots, and discovery calls. The Sovereign page can be shown in a diligence room. **Bank-grade privacy. Zero inference warehousing.** is approved claim-gate language and stays on the page. The Pocket control hero still cannot be the consumer story while the IFA chip and the farm ticker path are in the first screen. Accepting the retail variant as the standing Pocket face spends no new campaign budget. It stops the default page from arguing with the locks.

### CCO

Sovereign form output is an inquiry with company, role, and perimeter. Promote to `qualified_opportunity` only when the 14-day next-step rule is met. Do not count `homepage_form_submitted` toward the 50. Pocket Founders clicks are retail revenue attempts. They are not enterprise opportunities and they do not move the £100k ACV math. The control IFA chip will manufacture consumer-host conversations that are not Lane A/B outbound.

### CPO

Packaging integrity fails on the control FAQ (“community will decide premium”) while £12/£100 is on the hero. The retail FAQ states the same price cleanly. Two monetisation doors remain: landing demo → Founders, real import → Developer Utility. Leave both doors until a single instrumentation pass can point the real import success at one checkout. Do not invent a new SKU on either landing page.

### Head of Marketing

Demand ownership: Sovereign is a qualified catch, not a TOFU engine. Pocket offense remains the import wedges (`/import/ghostfolio`, Trading212, IBKR, Trade Republic, Moomoo), not a new homepage narrative. The control “search a ticker” affordance pulls branded and direct visitors into `/s/*`. That works against the de-farm hold. No new landing A/B this quarter. Ending `landing_retail_ia_2026` by keeping the retail arm is measurement hygiene.

### Head of Creative Studios

Sovereign visual system matches the terminal / amber diligence brief: one hero, proof, boundary, then the form. Pocket control is a multi-intent poster (IFA chip, terminal launch, ticker, CSV theatre, Founders, GitHub, npm). Pocket retail is one card, one drop zone, one price. Keep **Bank-grade privacy. Zero inference warehousing.** on the live Pocket copy. Lines still outside the gate, without a new art direction:

- Control band tail: “100% analytical command.”
- Retail trust badges: “Bank-level encryption” and the “Trusted by investors and wealth professionals” line sitting on a download count.
- Retail analyst eyebrow: “New: Sovereign routing.”

### Head of AI (claim gate)

| Copy | Gate |
|------|------|
| `OPEN_LANDING_COPY` hero, BYOC, FAQ, contact, qualified NGV line | **Pass** on this read |
| “Bank-grade privacy. Zero inference warehousing.” | **Pass** — allow-list, 27 Sep. Public-repo posture. Not a SOC 2, ISO, or charter claim |
| Control band tail: “100% analytical command.” | **Still outside the gate** |
| Control H1 “Sovereign Intelligence for Serious Portfolios.” | **Fail as retail-host positioning** — that noun belongs on Open |
| Retail FAQ “Bank-level encryption” / “privacy is enforced by design” | **Fail** until rewritten to the device-parse + bounded-summary wording already used in the retail “How do you handle my data?” answer |
| Retail “Trusted by investors and wealth professionals” | **Fail** until a named, approved set exists under the evidence gate |

### Head of Product Engineering

Sovereign lead write path is sound and incomplete. Company, role, context, and message persist. `attributionChannel` is never set by `app/api/open-portfolio/contact/route.ts`, so every homepage lead is `unknown`. That blocks the Phase 3 “≥25 organic/AI/authority influenced” count even after CCO promotes the row. Stamp channel from first-touch already collected in `trackEvent` when this route is next touched. Do not change the page IA to do it.

Pocket control ticker search uses `linkToTickerPage` and routes to `/s/{ticker}`. That is the farm template. Take that affordance off the homepage hero when the standing face is chosen. Leave `/s/*` noindex doctrine as it is.

### Head of Platform & DevOps

No runtime change in this blueprint. Resend and the existing Founders checkout stay the retail monetisation path. Geo ads stay frozen.

---

## Decision sheet (Command)

| # | Decision | Recommendation | If accepted, who moves |
|---|----------|----------------|------------------------|
| 1 | Sovereign page redesign? | **No.** Lane fit is good. | — |
| 2 | Stamp `attributionChannel` on Open contact leads | **Yes**, next time the contact route is edited. Values: organic, ai, authority, outbound, unknown. | Eng, Marketing channel map, CCO reads it at promotion |
| 3 | Pocket A/B `landing_retail_ia_2026` | **Freeze. Standing face = retail variant.** Control remains in the repo until the gate is switched. No third variant. | CEO accepts. Eng switches the gate default. Marketing stops reading control as the consumer story |
| 4 | Claim-gate redlines on live Pocket copy | **Partial.** Keep **Bank-grade privacy. Zero inference warehousing.** Still redline “100% analytical command.”, the retail “Bank-level encryption” line, the “Trusted by” headline, and the “Sovereign routing” eyebrow. | Head of AI gates the remaining sentences. Creative places them. Marketing does not open a campaign around the edit |
| 5 | Control hero ticker → `/s/*` | **Remove from the standing face.** Retail variant has no ticker search. Choosing retail retires this path without a new design. | Covered by decision 3 |
| 6 | New retail positioning, survey, or Camilla funnel workshop | **No.** Q4 park stands. | CEO |

## Holds

- Geo ads stay frozen.
- Farm `/s/*` stays noindex. Do not “fix” GSC by putting tickers back on the homepage.
- Do not put £35k, SOC 2, or a named customer on either landing page.
- Do not make the Open homepage the IFA acquisition engine.
- Do not treat a diligence form submit, a Founders click, or a CSV demo snare as a qualified opportunity or as MRR.

## Scoreboard this page can move

| Metric | Sovereign page | Retail variant | Control variant |
|--------|----------------|----------------|-----------------|
| Qualified opportunities (target 50) | Supplies inquiries CCO can promote | No | No, and the IFA chip muddies source |
| Organic/AI influenced flag | Blocked while channel is stored as `unknown` | n/a | n/a |
| Paid Stripe keys (target ≥1) | n/a | Founders CTA exists; demo is not the live import checkout | Founders CTA exists, then the FAQ argues with it |
| Farm click share (target down) | No farm CTA | No farm CTA | Hero ticker opens `/s/{ticker}` |
| Claim-gate breaches | None found in `OPEN_LANDING_COPY` | Trust badges and “Sovereign routing” | H1 still off-surface. “Bank-grade privacy. Zero inference warehousing.” is allowed. “100% analytical command.” is not |

**Category leadership on these two pages means a diligence catch on Open and a single harness door on Pocket. The Open page already does that. The Pocket default does not.**

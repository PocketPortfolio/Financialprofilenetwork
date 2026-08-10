# Command Evaluation — CMD1 / CMD2 vs Codebase (Day-14 → Day-28)

**Date:** 2026-08-10  
**Authority:** Day-14 calibration · Hybrid Monetization Plan · Board Triad  
**Stripe truth (CCO):** **Zero paid Developer Utility / Founders / Corporate conversions** — not a GA4 illusion.

---

## 1. Alignment verdict

| Claim | CMD1 | CMD2 | Codebase / data | Verdict |
| --- | --- | --- | --- | --- |
| Defense was a success | Yes | Yes | AU ↓, eng ↑, `bot_gate/401` → `/sponsor` | **Aligned — hold the win** |
| Growth gap still open | Yes | Yes | ~90% farm GSC queries; Learn 0 clicks | **Aligned** |
| Geo ads frozen | Yes | Yes | — | **Aligned — keep frozen** |
| Open → sales-led outbound | Yes | Yes | OP GSC ghost town | **Aligned** |
| £0 might be MP telemetry only | Implied urgency on MP | Pillar 1 “black hole” | **CCO: Stripe = £0** | **Misdiagnosed if treated as primary** |
| De-farm / noindex long-tail `/s/*` | Step 2 | Pillar 2 | `/s/[symbol]` metadata has **no `robots: noindex`** — still fully indexable | **Aligned and overdue** |
| Import GSC priority | Marketing | Pillar 2 | Import meta/CTR work shipped; volume tiny | **Aligned** |
| AI citation double-down | Step 4 | Pillar 3 | AI sess ↑ / KE ↓; `/learn` 0 GSC | **Aligned** |

**CMD1 and CMD2 are aligned with each other and with Day-14.** Correct them on one point: with Stripe at zero, the urgent story is **no buyers completed checkout**, not “revenue hidden from GA4.”

---

## 2. What engineering actually shipped (vs what failed commercially)

### Shipped and working (ops)

| Ship | Evidence in repo / prod behavior |
| --- | --- |
| API hard gate + Developer Utility upsell URLs | `enforceDataApiGate` · `paymentRequiredJsonBody` · 402 HTML CTA (#110) |
| `/s` human teaser vs bot 307 | `SymbolTeaserShell` · `pp_rate_lock` (#109) |
| Stripe → Firestore key mint + GA4 MP emit | `app/api/webhooks/stripe/route.ts` → `sendGa4MeasurementProtocolEvent('developer_utility_conversion')` |
| Checkout deep-link `?tier=developer-utility` | `SponsorDeck.resolveSponsorPersonaTab` → developers pane |
| Import SERP titles/canonicals | `app/import/[broker]/page.tsx` HIGH_CTR titles |
| Open blog farm noindex doctrine | blog `[slug]` + Wave 1 prune |
| Bot middleware → sponsor | `lib/bot-gate-middleware.ts` |

### Failed or unfinished (growth / money)

| Failure | Owner class | Code / ops fact |
| --- | --- | --- |
| **Month-9 £0 Stripe MRR on DU path** | CCO + Product + Marketing (shared) | Checkout stack exists; **no completed paid sessions** |
| Treating `/sponsor` 4,008 sessions as demand | Analytics misread | Those sessions avg **0.16s** — scraper redirects, not shoppers |
| Farm still Google’s face of Pocket | Eng + Marketing | `app/s/[symbol]/page.tsx` `generateMetadata` **never sets noindex**; farm stays crawlable |
| GA4 triad blind for conversions | Marketing (+ Eng verify) | Docs still: **register MP secret in GA4 Admin** pending since 2026-07-27 |
| Open Learn not in search | AI + Marketing | Pillars live; **0 GSC clicks** — citation/outbound not closed |
| Expecting bot_gate to monetize | Doctrine error | Scrapers do not pay; gate protects compute, does not mint MRR |

---

## 3. Priority answer (CMD2 question)

> Stripe-to-GA4 audit first, or GSC import re-index first?

**Given Stripe = £0: do not prioritize MP as if it might unlock hidden revenue.**

| Order | Work | Why |
| --- | --- | --- |
| **0 (parallel, ≤1h)** | Eng smoke: Stripe webhook → MP 204; Marketing confirm GA Admin secret matches Vercel | So Day-28 isn’t blind when first £ lands |
| **1 (primary)** | De-farm crawl budget + force-index `/import/*` | Real humans convert on import (36–70s, KE); farm is 90% of clicks |
| **1b (same sprint)** | Human conversion path: teaser/402 → checkout friction audit; price clarity on Developer Utility | Plumbing exists; completion doesn’t |
| **2** | CCO outbound Open (Design Partners) | Search will not save OP this cycle |
| **3** | AI citation → `/learn` + `/import` | Qualified channel, under-monetized |

**Start with acquisition-mix repair + human checkout completion. Telemetry is hygiene, not the money.**

---

## 4. Org accountability (month 9, £0)

Not “everyone failed equally.” Failures map to mandates:

| Role | What they delivered | What they did not |
| --- | --- | --- |
| **Product Eng** | Fortress perimeter, PLG, 402, Stripe webhook MP code | Farm still indexable; `/dashboard` flood unexplained; no Day-14 paid-key smoke in admin |
| **Marketing** | Import meta work earlier; GSC exports | MP Admin registration still open; farm vanity still in narrative; import share target unmet |
| **CCO** | Confirmed Stripe zero (truth) | No paid keys; OP outbound not yet producing pipeline visible to board |
| **CPO** | Pricing/teaser UX doctrine | Product still acquires as ticker farm, not import wedge |
| **AI & Community** | llms/robots Wave 2 | Learn 0 clicks; AI KE down |
| **CEO** | Correct freeze on geo ads | Must enforce triad + Day-28 money gate, not more perimeter theater |
| **Creative** | Support role | Brand misspell CTR still weak |

**Accurate line:** A small set pulled engineering weight; **commercial close** (keys, outbound, SERP mix) did not keep pace. Month-9 £0 is a **GTM + acquisition-mix failure**, not proof the fortress failed.

---

## 5. Day-28 success criteria (2026-08-24)

Must move **all three**:

1. **Paid API Keys ≥ 1** live in Stripe (Developer Utility / Founders / Corporate) — non-negotiable  
2. **Import GSC click share** trending up (target direction: ≫ current ~9% page share; Marketing’s 15% is stretch)  
3. **Farm query click share** down from 89.6% (de-index pass shipping)  

Secondary: MP `developer_utility_conversion` visible in GA within 24h of first Stripe pay.

---

## 6. Immediate engineering ticket (if CEO authorizes)

`feat/farm-selective-noindex` — `noindex,follow` on long-tail `/s/[symbol]` (and optional json-api) below a human-value allowlist (e.g. top liquid tickers + any with import/brand overlap); keep `/import/*`, `/`, `/learn/*` indexable. Pair with Marketing GSC URL Inspection on top import URLs.

Do **not** confuse this with bot firewall work — firewall is done.

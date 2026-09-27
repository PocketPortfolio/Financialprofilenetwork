---
id: OP-CMD-LANDING-FREEZE-ORG-VERDICT-2026-09-27
title: Org-roles verdict — Ploy read and CMD ratification of the landing freeze
status: SUBMITTED · COMMAND REVIEW
date: 2026-09-27
owners: [CEO (A), CCO, CPO, Head of Marketing, Head of Creative Studios, Head of AI, Head of Product Engineering]
evaluates:
  - Ploy consultant revised read (retail arm only)
  - CMD1 ratification and execution plan
  - CMD2 unanimous decision matrix
prior: docs/command/landing-blueprint-sovereign-retail-2026-09-27.md
governance: docs/command/claims-vs-codebase-calibration.md
---

# Org-roles verdict on the Ploy read and the CMD ratification

**Answer: yes, with one execution correction and one commit split.**

The six ratified decisions stand. Ploy’s revised read is the right object: the Pocket retail arm, not the control page, and not a new positioning direction. Open stays held. Pocket positioning stays parked.

What does not survive a read of the retail arm is the instruction to “keep” **Bank-grade privacy. Zero inference warehousing.** where it already sits on that arm. It does not sit there.

---

## What the retail arm actually shows

Checked against `lib/landing-retail-copy.ts`, `lib/landing-retail-faq.tsx`, `RetailTrustSection`, and `AnalystVideo` (`variant="retail"`). Production check URL used by Ploy: `/?variant=retail` (also `/landing?variant=retail`).

| CMD / Ploy item | On the retail arm today? | Where it actually is |
|-----------------|--------------------------|----------------------|
| **Bank-grade privacy. Zero inference warehousing.** | **No** | Control hero only (`ControlLandingPage.tsx`) |
| 100% analytical command. | **No** | Same control sentence, after the approved line |
| Bank-level encryption | **Yes** | Trust badges, trust subcopy, security FAQ |
| Trusted by investors and wealth professionals + download count | **Yes** | `RetailTrustSection` H2 + `DynamicDownloadCount` |
| New: Sovereign routing | **Yes** | `RETAIL_LANDING_COPY.analyst.eyebrow` |
| privacy is enforced by design | **Yes** | Hero privacy band **and** security FAQ |
| every broker | **Yes** | Hero H1. FAQ already says “most major brokers” |
| IFA chip, ticker → `/s/*` | **No** | Control only. Freeze removes them from normal traffic |

Importer scope, public in `packages/importer`: **19 dedicated adapters** plus **Smart Import** for other trade-like CSVs. Not every broker.

---

## Decision-by-decision

| # | Ratified call | Org-roles |
|---|----------------|-----------|
| 1 | Hold Open homepage | **Agree.** |
| 2 | Repair Open `attributionChannel` | **Agree. Do not put it in the Pocket commit.** |
| 3 | Freeze `landing_retail_ia_2026` to retail | **Agree.** The switch is middleware plus the gate, not the React fallback alone. |
| 4 | Partial claim redline | **Agree, executed on the retail copy SSOT.** Place the approved privacy line onto the retail hero. It is not already there. |
| 5 | Farm ticker leaves the hero | **Agree.** Covered by the freeze. |
| 6 | Q4 B2C park | **Agree.** This pass is a freeze and a redline. |

Ploy’s “every broker” coverage check is accepted inside decision 4. It is not a seventh decision and it is not a new headline workshop.

---

## Execution correction — the approved line has to move

Control’s band is one sentence: “Bank-grade privacy. Zero inference warehousing. 100% analytical command.”

Freezing traffic onto retail takes that whole sentence off the consumer host. “Keep the approved wording” therefore means **write the approved sentence into the retail privacy band**, replacing “Your financial privacy is enforced by design.” Do not carry “100% analytical command.” across. That clause was never on the retail arm; leaving control out of rotation is the purge.

Retail hero band becomes:

> Bank-grade privacy. Zero inference warehousing.

That is the allow-list line from `docs/command/claims-vs-codebase-calibration.md` (27 Sep 2026). It is not new positioning.

### Redlines that are actually on retail

| Remove or replace | File |
|-------------------|------|
| Trust H2 “Trusted by investors and wealth professionals” and the download count beside it | `lib/landing-retail-copy.ts` `trust.headline`; stop rendering `DynamicDownloadCount` as a trust proof |
| Badge and subcopy “Bank-level encryption” | `trust.badges`, `trust.subcopy` |
| Eyebrow “New: Sovereign routing” | `analyst.eyebrow` |
| “privacy is enforced by design” | Hero `privacyBand` (replaced by the approved line) and the security FAQ |
| “Bank-level encryption” in the security FAQ | `lib/landing-retail-faq.tsx` |
| H1 “every broker” | Align to scope already stated in the retail FAQ and the importer README |

Security FAQ replacement, using the data-handling answer already on the same FAQ plus the approved line:

> Bank-grade privacy. Zero inference warehousing. Broker statements are parsed on your device. Ask AI uses a bounded portfolio summary — not your raw statements.

H1 replacement, same job, no new campaign:

> Master your wealth across your brokers, in one secure place.

“Your brokers” matches dedicated adapters plus Smart Import. The FAQ line “most major brokers” stays as the longer explanation.

### Do not expand the redline

The analyst **body** may keep “Switch Cloud Auto or OP-Hosted Sovereign in Ask AI.” That names a shipped route in §6b. The redline is the eyebrow “New: Sovereign routing,” which sells the enterprise noun as a consumer banner. “No data sold” and “Secure edge processing” were not in the ratified purge list. Leave them.

“100% analytical command.” is not a retail string. No retail edit is required to remove it.

---

## Freeze mechanics — gate default is not enough

`useLandingVariant` falls through to `'control'`. Middleware is what ordinary visitors actually get.

`LANDING_AB_IS_ACTIVE` is `true`. On `/` and `/landing`, `applyLandingAbAssignment` writes `pp_landing_variant` for 30 days, 50/50. If a cookie already says `control`, middleware returns and leaves it. Changing only the hook’s final return to `'retail'` does not take cookied visitors, or the next new visitor, off control.

Freeze, for a normal visit with no query string:

1. Set `LANDING_AB_IS_ACTIVE` to `false`. Stop `assignLandingVariantFromSeed` from running.
2. On `/` and `/landing`, set the variant cookie to `retail` unless the request has `?variant=control`.
3. Hook resolution for normal traffic reads that cookie and renders `RetailLandingPage`.
4. `?variant=control` remains the way to open `ControlLandingPage` in the repo. Control stays in the tree. It is not in rotation.

That is Ploy’s check: an ordinary new visitor sees retail, not only someone who typed the query param.

---

## Commit split — answer to CMD1

**Two changes. The Pocket freeze and the retail redlines ship together. The Open attribution repair does not.**

| Change | Why it is together or apart |
|--------|-----------------------------|
| **Commit / PR A — Pocket** | Variant freeze (middleware + gate) and the retail copy redlines, including placing the approved privacy line. Shipping the freeze without the redlines would make the bad trust block the standing face. |
| **Commit / PR B — Open contact route** | Stamp `attributionChannel` from first-touch (`organic`, `ai`, `authority`, `outbound`, else `unknown`) in `app/api/open-portfolio/contact/route.ts`. Ratified. Separate surface, separate scoreboard. Ploy and decision 2 both keep it off the homepage decision. |

Do not block PR A on PR B. Do not drop PR B.

CCO still promotes `inquiry` → `qualified_opportunity` only after company, role, perimeter, and a next step inside 14 days. A Pocket demo completion and a Founders click are not that stage and are not a paid Stripe key.

---

## Role directives (this verdict)

| Role | Do |
|------|----|
| **CEO** | Ratify the correction and the split. Park stands. No new retail test, survey, or workshop. |
| **CPO** | One consumer face after PR A. Two commercial doors stay: homepage demo → Founders; real import → Developer Utility. Not a third homepage. |
| **Head of Product Engineering** | PR A as specified above. PR B on its own. |
| **Head of AI** | Pass the retail diff against the allow-list before merge. Confirm Open copy still has no SOC 2, ISO, or zero-leakage line. Confirm the analyst body route name stays. |
| **Creative** | Place the approved privacy line in the existing privacy band. Remove the trust H2 and its download count. No new art direction. |
| **Marketing** | Stop reading control as the consumer story once PR A is live. No geo-ads thaw. No new retail campaign. Open homepage remains the diligence catch. |
| **CCO** | Stage hygiene unchanged. Do not count retail events toward the 50 or the £100k ACV plan. |

## Holds

- Geo ads frozen.
- `/s/*` stays noindex. Retail has no hero ticker; the freeze is what removes control’s ticker from normal traffic.
- £35k stays off both homepages. £12/mo or £100/yr stays on the Founders path.
- Open is not the IFA acquisition page.

**Org roles agree with Ploy and with both CMDs. Execute decision 3 and decision 4 as one Pocket change that puts the approved privacy line on the retail arm. Execute decision 2 as its own Open change.**

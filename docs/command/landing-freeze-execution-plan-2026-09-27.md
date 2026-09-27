---
id: OP-CMD-LANDING-FREEZE-EXEC-2026-09-27
title: Execution plan — Pocket retail freeze, claim redlines, Open attribution repair
status: EXECUTED LOCALLY · 2026-09-27
date: 2026-09-27
owners: [Head of Product Engineering (R), Head of AI (claim pass), Creative (copy place), Marketing (channel map), CPO (I), CCO (I), CEO (A)]
mandate: docs/command/landing-freeze-org-roles-verdict-2026-09-27.md
governance: docs/command/claims-vs-codebase-calibration.md
---

# Execution plan — landing freeze mandate

Two pull requests. PR A is the Pocket consumer face. PR B is the Open lead record. PR A does not wait for PR B. PR B is not dropped.

No new retail headline workshop, survey, campaign, or third homepage. Copy below is the copy. Art direction does not change.

---

## Sequence

| Step | Who | Exit |
|------|-----|------|
| 1 | Eng opens PR A | Diff matches the file list and the locked sentences |
| 2 | Head of AI reviews that diff before merge | Allow-list pass recorded on the PR |
| 3 | Eng merges and deploys PR A | Ordinary `/` on `www.pocketportfolio.app` renders retail |
| 4 | Marketing confirms the standing face | Control is not the story in the next growth note |
| 5 | Eng opens PR B in parallel or after | `attributionChannel` is not stored as `unknown` when first-touch maps to a known channel |
| 6 | CCO reads one test lead in admin | Stage is still `inquiry` |

---

## PR A — Pocket freeze and retail redlines

**Surface:** `www.pocketportfolio.app` `/` and `/landing`.  
**Out of scope:** Open homepage structure, Open contact route, Founders vs Developer Utility checkout, `/s/*` noindex, control page deletion.

### A1. Stop the experiment and force retail

Three mechanisms serve the variant today. All three must change. Flipping one leaves control in rotation.

| Mechanism | Today | Change |
|-----------|--------|--------|
| `lib/landing-retail-variant.ts` `LANDING_AB_IS_ACTIVE` | `true` | `false` |
| `middleware.ts` `applyLandingAbAssignment` | Writes a 50/50 `pp_landing_variant` cookie. An existing cookie is left as-is. | On `/` and `/landing`, if the query is `variant=control`, set the cookie to `control`. Otherwise set the cookie to `retail`, including when the existing cookie is `control`. Do not call `assignLandingVariantFromSeed`. |
| `app/hooks/useLandingVariant.ts` | Resolution is query, then cookie, then A/B, then **`control`**. First server render uses that fallback. | Fallback return is **`retail`**. Do not call `initializeABTest` while `LANDING_AB_IS_ACTIVE` is false. |
| `app/lib/analytics/retail-landing-ab.ts` `isActive` | `true`, weights 50/50 | `isActive: false`. Leave the test id `landing_retail_ia_2026` so historical events still attach. Do not create a new test id. |

`?variant=control` stays as the inspection URL for `ControlLandingPage.tsx`. Do not delete that file.

`initializeABTest` already returns null when `isActive` is false (`app/lib/analytics/ab-testing.ts`). The hook fallback still matters: the server render happens before the cookie effect, so a `'control'` fallback flashes the control page. The fallback must be `'retail'`.

Middleware pseudocode for `applyLandingAbAssignment`:

```text
if path is not / or /landing: return
if query variant is control:
  set pp_landing_variant=control
  return
set pp_landing_variant=retail
return
```

Do not return early on an existing cookie. That early return is why a 30-day `control` cookie would survive a flag flip.

Update the comments in `lib/landing-retail-variant.ts` and `retail-landing-ab.ts` that still say the test is active and 50/50.

### A2. Locked retail copy

Edit `lib/landing-retail-copy.ts` only for these fields. Leave Founders CTAs, drop-zone demo language, analyst body, and analyst privacy paragraph as they are.

| Field | New value |
|-------|-----------|
| `hero.headline` | `Master your wealth across your brokers, in one secure place.` |
| `hero.privacyBand` | `Bank-grade privacy. Zero inference warehousing.` |
| `analyst.eyebrow` | `Pocket Analyst` |
| `trust.headline` | Remove. Do not write a replacement customer claim. |
| `trust.badges` | `['No data sold', 'Secure edge processing']` |
| `trust.subcopy` | Remove. It only repeated the badges. |

`analyst.body` stays, including “Switch Cloud Auto or OP-Hosted Sovereign in Ask AI.” That names the shipped route. The eyebrow is the only “Sovereign” string that goes.

Replace the file’s header comment. It currently says the retail copy has no absolute privacy claims. The approved line is now intentional.

### A3. Trust section markup

`app/components/landing/RetailTrustSection.tsx`

- Remove the `DynamicDownloadCount` import and the H2 that renders `trust.headline` plus the count.
- Render the two remaining badges only.
- Do not add a new headline, logo row, or download figure.

### A4. Security FAQ

`lib/landing-retail-faq.tsx`, question “Is my portfolio data secure?”

Replace the answer with:

> Bank-grade privacy. Zero inference warehousing. Broker statements are parsed on your device. Ask AI uses a bounded portfolio summary — not your raw statements.

Leave the “How do you handle my data?” answer as it is. Leave “most major brokers” on the import answer. That sentence is the scope explanation for the shorter H1.

### A5. Strings that must not appear on the retail arm after the diff

Search the retail copy, FAQ, and `RetailTrustSection` before opening the PR:

- `Bank-level encryption`
- `Trusted by investors`
- `New: Sovereign routing`
- `privacy is enforced by design`
- `every broker`
- `100% analytical command`
- `DynamicDownloadCount` inside `RetailTrustSection`

`100% analytical command` lives on `ControlLandingPage.tsx`. Do not edit that sentence in this PR. Control leaves rotation; it is not deleted.

### A6. Tests in PR A

Add `tests/unit/landing-retail-freeze.spec.ts` (or the nearest existing unit-test folder) covering:

- `LANDING_AB_IS_ACTIVE` is false.
- `assignLandingVariantFromSeed` is not used by the freeze path. Assert the constant, not a live 50/50 call.
- Retail copy fixtures: privacy band equals the approved sentence; headline uses “your brokers”; badges do not include “Bank-level encryption”; eyebrow is `Pocket Analyst`.

No snapshot of the whole control page.

### A7. Claim pass before merge

Head of AI reads the PR diff, not a staging redesign.

Pass when:

- The approved sentence appears on the retail privacy band and the security FAQ, and nowhere claims SOC 2, ISO 27001, or a bank charter.
- The analyst body still names Cloud Auto and OP-Hosted Sovereign.
- `OPEN_LANDING_COPY` is untouched.
- “No data sold” and “Secure edge processing” are still the only trust badges.

Creative’s work in this PR is the placement above. No new component, color, or layout system.

### A8. Verify after deploy

On `www.pocketportfolio.app`, in a browser with no `pp_landing_variant` cookie, and again after setting that cookie to `control` by hand:

| Check | Expected |
|-------|----------|
| `GET /` with no query | Retail H1 “your brokers”. Privacy band is the approved sentence. No IFA chip. No ticker search. |
| Response sets `pp_landing_variant=retail` | Yes, including when the request cookie was `control` |
| `GET /?variant=control` | Control page still renders. Cookie becomes `control`. |
| `GET /?variant=retail` | Retail. |
| Retail hero, trust block, analyst eyebrow, security FAQ | Redlined strings absent. Download count absent. |
| Founders secondary CTA and post-demo snare | Still `/sponsor` |
| Open homepage | Unchanged |

First HTML from the server must already be the retail document. A control flash that hydrates into retail is a failed freeze.

Marketing, after that check: the consumer homepage in notes and reviews is the retail arm. Geo ads stay frozen. No new retail campaign.

---

## PR B — Open attribution channel

**Surface:** `POST /api/open-portfolio/contact` and the form that calls it.  
**Out of scope:** Open page sections, CTA labels, pipeline promotion rules, Pocket.

First touch is `localStorage` key `pp_first_touch_attribution_v1`, written by `LandingPageTracker` in the root layout (`captureFirstTouchAttribution`). The contact route cannot read that store. The browser maps it and posts `attributionChannel`. The route accepts only the enum and persists it. Missing or invalid values store `unknown`.

### B1. Channel map

New pure function, `lib/open-portfolio/attribution-channel.ts`:

```text
mapFirstTouchToAttributionChannel(utm_source, utm_medium, referrer) →
  organic | ai | authority | outbound | unknown
```

Marketing map, applied in this order:

| If | Channel |
|----|---------|
| `utm_medium` or `utm_source` is `outbound`, `sales`, or `room` | `outbound` |
| `utm_medium` is `ai`, `aeo`, or `geo`, or `utm_source` contains `chatgpt`, `perplexity`, `claude`, or `gemini` | `ai` |
| Referrer host is `chatgpt.com`, `chat.openai.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com`, `copilot.microsoft.com`, or `you.com` | `ai` |
| `utm_medium` is `organic` or `seo` | `organic` |
| Referrer host is `google.`, `bing.com`, `duckduckgo.com`, `yahoo.`, or `ecosia.org`, and `utm_medium` is not `cpc`, `ppc`, or `paid` | `organic` |
| `utm_medium` is `referral` | `authority` |
| Anything else, including empty first-touch and paid mediums | `unknown` |

Do not add a new enum value. Paid clicks stay `unknown` while geo ads are frozen.

### B2. Form and route

`app/open/_components/OpenContactForm.tsx`

- On submit, read `getFirstTouchAttribution()`.
- Post `attributionChannel` from the mapper beside the existing email, company, role, context, and message fields.

`app/api/open-portfolio/contact/route.ts`

- Read `attributionChannel` from the body.
- Accept only `organic`, `ai`, `authority`, `outbound`, `unknown`.
- Pass it on `leadPayload` into `recordOpenPortfolioContactLead`.
- Omit it, or send anything else, and the existing Firestore default `unknown` stands.

Do not set `pipelineStage` to `qualified_opportunity` in this route. The writer already defaults to `inquiry`.

### B3. Tests in PR B

Unit-test the mapper with one case per row in the table, plus empty input → `unknown`, plus `utm_medium=cpc` with a Google referrer → `unknown`.

Route test, if a contact-route test harness already exists: a body with `attributionChannel: "organic"` is forwarded; `attributionChannel: "soc2"` is not forwarded as that string.

### B4. Verify

Submit a diligence form on the Open homepage after landing with `?utm_medium=organic`. The stored lead shows `attributionChannel: organic` and `pipelineStage: inquiry`. A submit with no first-touch and no channel field stores `unknown`. CCO does not promote that row unless the 14-day next-step rule is met.

---

## Holds during both PRs

- Do not edit `OPEN_LANDING_COPY` or Open section order.
- Do not delete `ControlLandingPage.tsx`.
- Do not point the homepage CSV demo at Developer Utility checkout.
- Do not put £35k on either homepage.
- Do not request indexing of `/s/*`.
- Do not thaw geo ads.
- Do not open a Camilla, Growth Hub, or retail-positioning workstream.

## Rollback

Revert PR A to restore assignment. Visitors already cookied `retail` by the freeze stay on retail until `pp_landing_variant` expires (30 days) or they open `?variant=control`. Call that out in the revert note. Revert PR B on its own; existing leads keep the channel already stored.

## Done

| Mandate item | Done when |
|--------------|-----------|
| Decision 1, hold Open | No Open homepage diff in PR A |
| Decision 3, freeze | Server HTML of `/` is retail for a cookieless visit and for a visit that sent `pp_landing_variant=control` |
| Decision 4, redline | Retail search list in A5 is empty; approved sentence is on the privacy band |
| Decision 5, farm hero | Retail has no ticker control; control’s ticker is only on `?variant=control` |
| Decision 6, park | No new test id, no new campaign copy |
| Decision 2, attribution | A mapped first-touch stores that channel; stage remains `inquiry` |

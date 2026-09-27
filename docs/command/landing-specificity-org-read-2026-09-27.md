---
id: OP-CMD-LANDING-SPECIFICITY-2026-09-27
title: Org-roles read — why the retail homepage does not name broker, identity, or model
status: SUBMITTED · NO PAGE CHANGE
date: 2026-09-27
owners: [CEO (A), CPO, Head of Marketing, Head of AI, Creative, Head of Product Engineering]
prior: docs/command/landing-freeze-prod-readiness-2026-09-27.md
---

# Why the standing homepage feels flat

**The CEO is right about the shortage. The flatness was a choice, and that choice is now the only homepage.**

## The idea

The retail arm was built as one decision: import a CSV for free, or look at Founders Club. Privacy was the reason to trust the drop zone. Broker names, sign-in providers, and model names were left off that first screen on purpose.

Three rules produced that:

1. **One job.** The June retail test stripped the control page’s menu of intents (IFA chip, ticker search, GitHub, npm, “pick one”). A visitor was not asked to choose a broker, a cloud, and a model before they had imported anything.
2. **Claim risk.** “Every broker” and a naked model brand were treated as promises. The approved line is the posture — bank-grade privacy, zero inference warehousing — not a catalog.
3. **Split of labor.** Named broker intent was assigned to the import landers (`/import/trading212`, Ghostfolio, IBKR, Trade Republic, and the rest). The homepage was the trust door, not the compatibility matrix.

That was coherent while retail was one arm of a test. The freeze made it the only door. The compatibility facts never moved onto it.

## What a visitor can and cannot answer

| Question | On the retail face today | Where the shipped answer actually is |
|----------|--------------------------|--------------------------------------|
| Which broker? | Hero says “your brokers.” FAQ says “most major brokers.” The features card says “50+ brokers.” No names. | **19 dedicated adapters** plus Smart Import. Names live in `packages/importer` and on `/import/*`, not in the hero. “50+” is not that registry. |
| Which identity? | Not on the retail face. | The product portal already has a **Sovereign Storage** card: optional sync to Google Drive or OneDrive, sign in with Google or Microsoft. `ProductPortalSection` **drops that card when `variant` is retail** and keeps only “The Terminal.” |
| Which model? | Below the hero, Pocket Analyst says “Cloud Auto or OP-Hosted Sovereign.” No Gemini, no OpenAI, no host-node name. | Shipped routes are Cloud Auto (cloud APIs) and OP-Hosted Sovereign (`/api/ai/chat`). §6b allows those route names. Provider brands are a second sentence, not a new product. |

So the page showcases the boundary and withholds the three facts a person uses to decide “this takes my export, my login, and a model I can name.”

## Role read

| Role | Read |
|------|------|
| **CEO** | The shortage is real. Privacy without compatibility is an incomplete growth door. It is not a reason to restore the control page. |
| **CPO** | Retail’s filter hid a shipped storage card. The “50+ brokers” line on the one card retail still shows fights the 19-adapter SSOT. Specificity has to use the registry, not a round number. |
| **Marketing** | Import landers were supposed to carry broker names. They do not help someone whose first URL is `/`. The homepage has to name enough that the landers feel like the same product. |
| **Head of AI** | Naming Cloud Auto and OP-Hosted Sovereign is already allowed. Naming Gemini or OpenAI is allowed only as the cloud route those calls use, not as “we are that model.” Broker names must match the adapter list. Google and Microsoft are sign-in and folder sync, not a claim that we are those companies. |
| **Creative** | The amber single-column hero can take one fact strip. That is placement. It is not a new art direction and not the control page’s “pick one” row. |
| **Engineering** | The hide is one filter: `PORTAL_CARDS.filter(portalTerminal)` in `ProductPortalSection`. The Google/Microsoft copy is already written. |

## What this is not

Restoring `?variant=control` as the public face. That page names more things and also brings back the IFA chip, the ticker search, and “100% analytical command.”

A new Q4 positioning exercise. The missing words are shipped facts. A fact strip is how the standing face stops being only a privacy slogan.

**No page change in this note.** Command can ask for the strip next: broker names from the registry, Google and Microsoft as the sync sign-in, Cloud Auto and OP-Hosted Sovereign as the model choice. The “50+ brokers” line comes off when that strip goes on.

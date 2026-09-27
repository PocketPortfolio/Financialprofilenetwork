---
id: OP-CMD-LANDING-SPECIFICITY-DIRECTIVE-2026-09-27
title: First-screen specificity directive — copy insertion, no redesign
status: SHIPPING · TRIM APPLIED
date: 2026-09-27
owners: [CPO (A), Head of AI (claim), Creative (place), Marketing (I), CEO (I)]
prior: docs/command/landing-specificity-org-read-2026-09-27.md
hold: Released for production by the operator after the Ploy density trim. CMD 1 cleared the text treatment. CMD 2 kept text over logos.
---

# Specificity directive

CMD 1 asked for a layout that names the rails without a redesign. Ploy, CMD 1, and CMD 2 agreed named text beats a logo row. Ploy’s density trim is the copy below: Brokers stays the long line, Sign-in and Models are shorter, and the import button stays the focal point.

The freeze on production stands. This patch does not reopen `landing_retail_ia_2026` and does not bring the control page back.

## What goes on the first screen

Insert one fact strip in `RetailLandingHero`, directly under the privacy band and above the two buttons. Same card. Same amber border language. No new section, no logos, no third button. Brokers is the lead line (larger, weight 500). Sign-in and Models sit under it. Body copy uses `var(--text)`. Labels stay `var(--accent-warm)`.

Three lines, in `lib/landing-retail-copy.ts`:

| Line | Copy |
|------|------|
| Brokers | 19 dedicated adapters, including Trading 212, Interactive Brokers, Freetrade, Charles Schwab, and Ghostfolio. Other CSVs use Smart Import. |
| Sign-in | Google or Microsoft. Optional Drive or OneDrive folder you own. |
| Models | Cloud Auto (Gemini, then OpenAI) or OP-Hosted Sovereign. |

The privacy band stays: “Bank-grade privacy. Zero inference warehousing.”

## What comes off in the same patch

The features card still says “Track net worth across 50+ brokers.” Replace that sentence with: “Track net worth from 19 dedicated broker adapters, plus Smart Import.”

“50+” is not the registry in `VERIFIED_BROKER_ADAPTER_GROUPS`. Leaving it up makes the new strip a contradiction.

## What this patch does not do

- No control-page restoration, no IFA chip, no ticker search.
- No provider logos.
- No model version numbers and no “local 8B” line.
- No claim that Google, Microsoft, Gemini, or OpenAI are customers or partners.
- No change to the Open homepage.
- No change to the two commercial doors.

## Claim check before merge

Head of AI passes the diff when the broker count is 19, the five names are in the adapter groups, sign-in matches the Sovereign Storage card, and Cloud Auto is described as Gemini then OpenAI. Smart Import stays the long-tail path (Robinhood, eToro, Trade Republic, and other trade-like CSVs), not a dedicated-adapter claim.

## Correction to the CMD 1 measurement line

Storing `attributionChannel` does not by itself move the 50 qualified opportunities. New Open submits are still `inquiry`. CCO promotes them only after company, role, perimeter, and a next step inside 14 days. The channel is what makes a later promotion countable as organic, AI, authority, or outbound. Empty first-touch still stores `unknown`.

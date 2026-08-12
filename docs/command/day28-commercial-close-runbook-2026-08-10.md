# Day-28 Commercial Close Runbook

**Status:** EXECUTING · De-farm in `feat/farm-selective-noindex`  
**Board gate:** 2026-08-24 · Geo ads remain frozen

## Advisory triad (buyer truth)

| Role | Output |
| --- | --- |
| **NYSE Market Analyst** | Ratified `lib/seo/symbol-index-allowlist.ts` (curated Top-100; veto farm `*xx`) |
| **Fund Manager** | Developer Utility card: full OHLCV JSON + CSV + `pp_` key |
| **Wealth Manager** | GSC force-index: Ghostfolio → Trading212 → IBKR → Trade Republic → Moomoo |

## Marketing (next 48h)

1. GSC URL Inspection — request indexing for `/import/ghostfolio`, `/import/trading212`, `/import/interactive-brokers`, `/import/trade-republic`, `/import/moomoo`.
2. GSC URL Inspection — sample farm URLs (`/s/xinxx`, `/s/xvlxx`) after deploy to accelerate `noindex` pickup.
3. Confirm GA4 Admin MP secret for `G-9FQ2NBHY7H` matches Vercel `GA4_MEASUREMENT_PROTOCOL_SECRET` (local smoke already returns **204**).
4. **News Room conversion circuit (augment):** Homepage + `/newsroom` now pair briefing cards with `/for/advisors` and `/import/*` wedge CTAs. Track GA4 `newsroom_cta_click` → `advisor_tool` / `csv_import_success` funnel.

## CCO (continuous → Day-28)

1. **≥1 paid Stripe key** (Developer Utility / Founders / Corporate) — non-negotiable.
2. Open Portfolio Design Partner outbound to CTOs/CISOs (Modern Wealth).
3. Walk: teaser/402 → `/sponsor?tier=developer-utility&returnTo=…` → Checkout → success → Return CTA.

## Head of AI

1. Push `/llms.txt` citations toward `/import/*` and `/learn/*`.
2. Track AI Assistant sessions → key events / contact.

## Eng verification after deploy

```bash
node --env-file=.env.local scripts/ops-ga4-mp-smoke.mjs
# Expect: status 204
```

## Day-28 scoreboard

| Metric | Target |
| --- | --- |
| Stripe paid keys | ≥ 1 (£>0) |
| Farm GSC click share | < 50% trending |
| Import GSC click share | toward 15% |

# Wave 1 Ship Closure — Commercial SEO & KPI Sprint

**Date:** 2026-07-27  
**Code:** PR #91 → `main` (`1ab58054`) + noindex hotfix (this ship)  
**Window open:** 2026-07-28 → Day-14 review 2026-08-10

## Shipped & verified in production

| Workstream | Status | Evidence |
| --- | --- | --- |
| Board KPI triad (retire Active Users) | Done | `board-kpi-reset-memo-2026-07-27.md`, `board-triad-dashboard-wave1.md` |
| Brand SERP meta + `/login` | Live | `https://www.pocketportfolio.app/login` 200; homepage title Pocket Portfolio |
| Import above-fold dropzone | Live | `/import/ghostfolio` shows “Drop your … CSV here” |
| Hybrid API hard gate | Live | `/api/tickers/spy/json` → 401 + `X-Robots-Tag: noindex` |
| Stripe → GA4 MP wiring | Live (env) | Vercel prod: `GA4_MEASUREMENT_PROTOCOL_SECRET`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `PP_FIRST_PARTY_FETCH_SECRET`; MP debug payload valid; collect returns 204 |
| OP pillars (4) | Live | `/learn/sovereign-ai-architecture` indexable |
| OP farm pause | Code | Cron skips how-to/research unless `OP_BLOG_FARM_PAUSED=false` |
| OP farm `noindex` | Hotfix | Frontmatter bug fixed; research/how-to → `noindex,follow`; removed from Open sitemap |

## Marketing / CEO actions still open (not blocking ship)

1. **GA4 Admin** — Data stream `G-9FQ2NBHY7H` → Measurement Protocol API secrets → create secret with the **exact** value already in Vercel `GA4_MEASUREMENT_PROTOCOL_SECRET` (also in local `.env.local`). Until this matches, Stripe `developer_utility_conversion` events are accepted by Google’s endpoint but may not appear in reports.
2. **GSC URL Inspection** — Submit `/`, `/login`, top-10 `/import/*`, and four OP pillar URLs; log in `brand-serp-tracking-wave1.md` / `import-serp-tracking-wave1.md`.
3. **Day 14 (2026-08-10)** — Fill `wave1-day14-review-2026-08-10.md` triad + CTR; Wave 2 go/no-go.

## Out of scope (Wave 2+)

ICP geo spend · enterprise outbound · AI citations · Cloudflare WAF · phantom £49 SKU.

## Verdict

**Wave 1 engineering ship is complete.** Measurement and SERP outcomes run for 14 days; board review on 2026-08-10.

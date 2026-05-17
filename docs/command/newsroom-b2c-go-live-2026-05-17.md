---
id: PP-NEWSROOM-GO-LIVE-2026-05-17
title: B2C News Room — production deployment report
status: DEPLOYED
surface: pocketportfolio.app (B2C)
last_updated: 2026-05-17
---

# Command Team — News Room go-live report

## Mandate delivered

Replaced static “Building in Public” / placeholder community grid on the Pocket landing with a **live institutional News Room**: UK wealth, regulatory, and wealth-tech headlines sourced from Google News RSS, classified into three lanes, surfaced on homepage and `/newsroom`.

## What shipped

### Product & IA

- **Homepage** (`CommunityContent.tsx`): News Room section with live fetch from `/api/newsroom`, loading state, category art + publisher favicons.
- **`/newsroom`**: Full index page (SSR) with same briefing cards.
- **Nav**: “Architecture” → **News Room** in sovereign marketing nav and production navbar; `#news-room` on `/` and `/landing`, `/newsroom` elsewhere.
- **Landing IFA pivot**: Hero/trust copy aligned to wealth operators & advisors; removed “Join the Community” social proof block; dev section points to Open architecture substrate.
- **`/news`**: Fixed to use ticker news API (dashboard feed), separate from News Room.

### Data pipeline (local-first friendly — no user PII)

```
Vercel Cron (every 4h UTC)
  → GET /api/cron/newsroom-ingest (CRON_SECRET)
  → ingestNewsroomBriefings() — 6 UK RSS queries
  → Filters: ≤72h age, relevance gate (no crypto/off-topic)
  → 3 lanes × 2 articles = 6 cards
  → Vercel KV newsroom:briefings:v1 (TTL 5h)

GET /api/newsroom
  → Fresh KV (≤4h) → else cached live ingest (30m) → else editorial seed
```

### Freshness & relevance

| Control | Value |
|---------|--------|
| Cron ingest | Every **4 hours** UTC |
| Max article age at ingest | **72 hours** |
| KV stale threshold | **4 hours** (triggers live re-ingest) |
| API cache | **30 minutes** |
| Relevance | `isRelevantWealthHeadline()` + lane classification |

### SEO

- `/newsroom` added to static sitemap.

### Quality gates (pre-push)

- `npm run lint` — pass
- `npm run typecheck` — pass
- `tests/unit/newsroom.spec.ts` + `canonical-claims.spec.ts` — 41 tests pass

## Post-deploy verification (ops)

1. Confirm Vercel env: `CRON_SECRET`, `KV_REST_API_URL` (+ token).
2. Prime KV once if needed:
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" https://www.pocketportfolio.app/api/cron/newsroom-ingest
   ```
3. `GET /api/newsroom` — expect `X-Newsroom-Source: kv-cache` or `google-news-rss` (not seed-only).
4. Visual: homepage News Room + `/newsroom` show six live cards (category SVG art; Google News RSS has no hero images).

## Known limitations

- Thumbnails are **category art + publisher favicon**, not publisher photos (RSS limitation).
- Seed payload remains **fallback only** if RSS and KV both fail.
- Stricter freshness (48h window or 2h cron) available on request — constants in `lib/newsroom/constants.ts`.

## Commit

Deployed via `main` push — see git log for `feat(newsroom):` commit on 2026-05-17.

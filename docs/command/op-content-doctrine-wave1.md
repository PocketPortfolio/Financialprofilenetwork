# Open Portfolio Content Doctrine — Wave 1

**Owners:** Head of Marketing · Head of AI & Community · Eng  
**Status:** Farm prune LIVE (noindex hotfix 2026-07-27) · Four pillars shipped · Farm URLs removed from Open sitemap

## Doctrine

1. Generic `how-to-in-tech` and `research` blog posts: **`noindex, follow`** (metadata robots).
2. Cron farm generation for those categories: **paused** unless `OP_BLOG_FARM_PAUSED=false`.
3. Crawl budget redirected to four institutional pillars (indexable).

## Pillars (canonical on openportfolio.co.uk)

| Pillar | Path |
| --- | --- |
| Sovereign AI Architecture & Data Perimeters | `/learn/sovereign-ai-architecture` |
| DORA & EU AI Act for Wealth Management | `/learn/dora-eu-ai-act-wealth` |
| Stateless Edge Ingestion vs Centralized Warehousing | `/learn/stateless-edge-ingestion` |
| Enterprise Design Partnership (5-Seat BIP Cap) | `/learn/enterprise-design-partnership` |

Pocket hosts 301 to Open via `next.config.js` alias list (synced with `OPEN_ALIAS_ROUTES`).

## Keep vs prune

| Category | Index? | Notes |
| --- | --- | --- |
| `how-to-in-tech` | noindex, follow | Farm |
| `research` | noindex, follow | Farm |
| `sovereign-engineering` | index | Keep |
| Pocket deep-dive / philosophy | index | Keep on Pocket surface |

Override: frontmatter `noindex: true` on any post.

## GSC follow-up (Marketing)

- Request indexing for the four pillar URLs after deploy.
- Monitor blog impressions shifting away from generic how-to queries over 14 days.

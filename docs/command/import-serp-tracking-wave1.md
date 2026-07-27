# Import SERP Re-index & CTR Tracking — Wave 1

**Owner:** Head of Marketing · Head of Product Eng (optional Indexing API)  
**Baseline CTR:** 0.72% on ~12.5k import impressions (SOS)  
**Stretch target:** directional lift toward >3.5% (not a Day-14 guarantee)  
**Window:** 2026-07-28 → 2026-08-10

## Top-10 broker URLs (GSC URL Inspection)

Submit after production deploy of PR #90 meta + this sprint's dropzone.
**Code ready 2026-07-27** — above-fold dropzone verified on Ghostfolio. Marketing: GSC URL Inspection each row.

| # | Broker | URL | Submitted | Indexed? | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | Ghostfolio | https://www.pocketportfolio.app/import/ghostfolio | Ready | | Dropzone live |
| 2 | Trade Republic | https://www.pocketportfolio.app/import/trade-republic | Ready | | |
| 3 | Interactive Brokers | https://www.pocketportfolio.app/import/interactive-brokers | Ready | | |
| 4 | Webull | https://www.pocketportfolio.app/import/webull | Ready | | |
| 5 | Trading 212 | https://www.pocketportfolio.app/import/trading212 | Ready | | |
| 6 | eToro | https://www.pocketportfolio.app/import/etoro | Ready | | |
| 7 | Wealthsimple | https://www.pocketportfolio.app/import/wealthsimple | Ready | | |
| 8 | DEGIRO | https://www.pocketportfolio.app/import/degiro | Ready | | |
| 9 | Revolut | https://www.pocketportfolio.app/import/revolut | Ready | | |
| 10 | Moomoo | https://www.pocketportfolio.app/import/moomoo | Ready | | |

## 14-day CTR log (GSC Performance → Pages filter `/import/`)

| Date | Impressions | Clicks | CTR | vs 0.72% baseline |
| --- | ---: | ---: | ---: | --- |
| Pre-sprint (28d SOS) | ~12,516 | ~90 | 0.72% | — |
| Week 1 end | | | | |
| Week 2 / Day 14 | | | | |

## Indexing API

Do **not** block on Indexing API. Manual GSC URL Inspection is the deliverable unless `GOOGLE_INDEXING` service-account credentials already exist in ops.

## Related ship

- Meta titles: `HIGH_CTR_IMPORT_TITLES` in `app/import/[broker]/page.tsx` (PR #90)
- Above-fold dropzone: `ImportLanderDropzone` (this sprint)

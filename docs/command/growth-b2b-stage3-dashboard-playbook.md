---
id: OP-GROWTH-B2B-STAGE3-DASHBOARDS-2026-05-16
title: Stage 3 — GSC / GA4 boundaries + Open audit automation
status: OPS_PLAYBOOK
programme_owner: GROWTH_AND_DELIVERY
last_updated: 2026-05-16
---

# Stage 3 — Search & analytics dashboards (Open vs Pocket)

Stage 3 is **mostly Growth-owned** (credentials and vendor consoles). Engineering supplies **boundary definitions** and an **optional** production probe script.

---

## 3.1 Google Search Console (Open property)

1. Add / verify property **`https://www.openportfolio.co.uk`** in [Google Search Console](https://search.google.com/search-console).
2. Submit sitemap: **`https://www.openportfolio.co.uk/sitemap.xml`**  
   (implemented by [`app/open/sitemap.xml/route.ts`](../../app/open/sitemap.xml/route.ts) and static composition under [`app/open/sitemap-static.ts`](../../app/open/sitemap-static.ts)).
3. Export or screenshot **Coverage** + **Sitemaps** status for the programme readout.

---

## 3.2 GA4 — hostname segmentation

1. In GA4, create an **Exploration** or **Report** with dimension **`Hostname`** (or equivalent host dimension available in your property).
2. Build two segments or filters:
   - **Open:** host matches `www.openportfolio.co.uk` (and non-www apex if used).
   - **Pocket:** host matches `www.pocketportfolio.app` (and apex if tracked).
3. Save the exploration URL and paste into internal wiki / programme tracker.

This aligns measurement with **dual-surface** routing (`OPEN_ALIAS_ROUTES` Pocket → Open aliases).

---

## 3.3 Automated probe (optional)

Run **`npm run audit:b2b-open`** from CI or locally. Writes [`growth-b2b-open-audit-automated-probe.md`](growth-b2b-open-audit-automated-probe.md) with HTTP status lines for the Open sitemap and sample paths.

**Not a substitute** for GSC, GA4, or CrUX — same caveat as the Pocket B2C audit script.

---

## Submission thread verification (Stage 1 cross-reference)

Engineering SSOT for **GitHub Discussions #49**:

`https://github.com/PocketPortfolio/Financialprofilenetwork/discussions/49`

Verify periodically with:

`curl -sI "https://github.com/PocketPortfolio/Financialprofilenetwork/discussions/49"`

Expect **HTTP 200** (GitHub may set cookies; status alone suffices for “thread exists” smoke).

**Last engineering smoke:** 2026-05-17 — `HTTP/1.1 200 OK`.

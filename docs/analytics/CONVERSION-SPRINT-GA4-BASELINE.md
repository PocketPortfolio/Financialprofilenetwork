# Conversion sprint — GA4 / Firebase before–after

Use the same **date range length** for baseline vs post-ship windows. Replace placeholders after deploy.

| Artifact | Value |
|----------|--------|
| **Commit SHA** | `<paste git rev-parse HEAD>` |
| **Vercel Preview URL** | `<paste preview deployment URL>` |
| **Baseline window** | `<start> – <end>` (e.g. 14 days pre-ship) |
| **Post window** | `<start> – <end>` (e.g. first 14 days after prod) |

## Event definitions (GA4 / gtag)

| Internal name | Notes |
|---------------|--------|
| `csv_import_start` | Funnel start |
| `csv_import_success` | Successful parse/import |
| `csv_import_error` | User-visible failure |
| `csv_import_header_autofix` | Optional; `{ fixes_applied }` style params |
| `bridge_to_terminal_cta_click` | JSON-api bridge; note `cta_id` if present |
| `paywall_impression` | Paywall surfaces |
| `paywall_cta_click` | Checkout / upgrade intent |
| `ai_attachment_button_click` | Paperclip; includes `is_paid` |
| `ai_file_attachment_attempt` | Checkout trigger source (existing) |
| `dashboard_demo_shown` | `{ source: 'auto_cold_start' \| 'manual_button' }` |
| `dashboard_demo_dismissed` | `{ source: 'banner' }` |

## Before / after table (fill from GA4 + Firebase exports)

| Metric | Definition | Baseline (N / rate) | Post (N / rate) | Δ |
|--------|------------|---------------------|-----------------|---|
| CSV completion | `csv_import_success` / `csv_import_start` | | | |
| CSV error density | `csv_import_error` / `csv_import_start` | | | |
| Bridge activation | `bridge_to_terminal_cta_click` / json-api sessions (fix denominator in GA4) | | | |
| Paywall surface | `paywall_impression` / `session_start` (or active users) | | | |
| Attachment funnel | Modal → `paywall_cta_click`; supplement `ai_attachment_button_click` by `is_paid` | | | |

**Small-N note:** Until weekly `csv_import_start` ≥ ~100, prefer a **Wilson interval** or qualitative “directionally up” read alongside raw counts.

## Verify on artifact

1. Open Preview URL above; confirm key flows (CSV import, `/s/{TICKER}/json-api`, dashboard empty state, Ask AI attachment path).
2. Cross-check **View Source** on json-api per `docs/seo/JSON-API-SEO-VERIFICATION.md`.
3. Paste this file (or a screenshot of the filled table) into the growth hub / board pack with **SHA** and **Preview** linked.

---

## Google export issues (Apr 1–18 snapshot) — next steps after prod

These items are **mostly outside** the conversion sprint code path but they explain gaps in the exports you shared (`Reports_snapshot`, `Landing_page`, `Traffic_acquisition`, `Generate_leads` city breakdown, GSC `Countries`).

| Issue | What the export suggested | Next steps |
|--------|---------------------------|------------|
| **Key events / revenue = 0** | Summary cards show no conversions in GA4 for that window | In GA4 **Admin → Events**, mark business events as **Key events** (`purchase`, `paywall_cta_click`, `csv_import_success`, etc.). Link **Google Ads / Merchant** if applicable. Re-export after 48h. |
| **Organic vs product-led traffic** | Strong **Direct** and **`json_api / bridge_cta`** vs **`google / organic`** | Keep UTMs on bridge links; add an **organic landing** experiment (title/meta + above-fold CTA) for top GSC pages. Measure **engaged sessions / session** by channel. |
| **Low engagement landings** | Many `/s/...` sessions with **very short** average engagement | Ship is live: json-api chrome + sticky prompt + dashboard cold-start address part of this. Next: **Core Web Vitals** on those routes, **intent match** (query → H1), and **internal links** to `/dashboard` / import. |
| **CSV completion** | Historical audit cited low success / high errors | Sprint adds **header fuzzy normalization** + alignment guide. Monitor **`csv_import_header_autofix`** and completion ratio in the post window. |
| **Singapore (and “city Singapore”)** | GSC **country** Singapore: few clicks, **avg position ~11**. GA4 **city** Singapore: very high **active users** | Do **not** merge those two metrics: GSC is **organic by country**; GA4 city is **all channels + IP geo** (APAC egress, mobile, etc.). Segment GA4: **city Singapore × session primary channel**. For SEO, treat SG as **long-tail** until position improves. |
| **Spam / odd geos** | Very high CTR from a few small countries | In GA4, exclude **internal IPs** / known bots where possible; in GSC, ignore **trivial click** rows when deciding strategy. |
| **Firebase vs GA4** | Different definitions of “active” | Use **one primary dashboard** (usually GA4) for growth; Firebase for **app-specific** or crash metrics. Align date ranges. |

**Cadence:** After prod deploy, run a **matching 18-day** (or 14-day) window and update the before/after table above; note **deploy date** in the Artifact table.

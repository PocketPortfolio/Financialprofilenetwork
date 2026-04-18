# Conversion sprint — GA4 / Firebase before–after

Use the same **date range length** for baseline vs post-ship windows. Replace placeholders after deploy.

| Artifact | Value |
|----------|--------|
| **Commit SHA (conversion sprint prod)** | `a51e65ac0e9ff0d4190320685ae3ac43576f9314` |
| **Production URL** | `https://www.pocketportfolio.app` |
| **Playbook** | [GOOGLE-EXPORT-GAP-CLOSURE.md](./GOOGLE-EXPORT-GAP-CLOSURE.md) |
| **Baseline window** | e.g. Apr 1–18, 2026 (archive CSVs off-GA4/GSC) |
| **Post window** | Same length, starting day after deploy (update after measurement) |

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

## Google export issues — next steps

Step-by-step checklists, GA4 key-event names, explorations, GSC triage, Singapore segmentation, referral hygiene, and exit criteria live in **[GOOGLE-EXPORT-GAP-CLOSURE.md](./GOOGLE-EXPORT-GAP-CLOSURE.md)**. Update the before/after table in this file after each comparable post-deploy window.

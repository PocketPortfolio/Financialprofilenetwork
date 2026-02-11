# Diagram List — Universal LLM Import Book

Titles and short descriptions for every figure/diagram (Mermaid or ASCII) for re-rendering or styling for print.

| # | Title | Description |
|---|--------|-------------|
| 1 | **CSV → inference → normalized schema (ASCII)** | Three-layer flow: user's CSV with messy headers → schema inference (heuristics + optional LLM) → deterministic parse to NormalizedTrade[]. |
| 2 | **Local-first flow (Mermaid flowchart)** | CSV file → read in browser → parse headers + sample rows → decision: heuristic confidence ≥ 0.9? (yes → use heuristic mapping; no → LLM enabled? → POST /api/ai/map-csv → LLM returns mapping) → apply mapping → genericParse full CSV locally → NormalizedTrade[]. |
| 3 | **LLM-assisted ingestion lifecycle (Mermaid sequence)** | User drops CSV; Browser parses headers + sample rows; Heuristic returns mapping and confidence; alt confidence ≥ 0.9: parse locally and show trades; else LLM enabled: POST to API, get mapping, parse and show trades or REQUIRES_MAPPING; else: show REQUIRES_MAPPING, user confirms, then parse and show trades. |
| 4 | **Local device ↔ Drive ↔ restore (Mermaid flowchart)** | Client (IndexedDB/local state, export file) ↔ Google Drive (pocket_portfolio_db.json); export & upload, create/update, download, import & load; note: Drive stores file only, no schema logic, user owns file. |
| 5 | **Known vs unknown broker decision tree (narrative)** | File dropped → known broker detection → match → dedicated adapter; no match or Smart Import → parseUniversal → infer mapping → confidence ≥ 0.9 and all required? → parse; else REQUIRES_MAPPING → user confirms → parse. |
| 6 | **Data boundaries (table)** | Three rows: Client (file, full CSV, parse, portfolio state, optional Drive token); Server (optional: headers + 3 rows → mapping, no storage); Drive (optional: pocket_portfolio_db.json only, no schema logic). |

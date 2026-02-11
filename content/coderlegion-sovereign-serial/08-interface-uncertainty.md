<!-- CoderLegion: title=The Interface of Uncertainty: Designing Human-in-the-Loop | date=2026-03-06 | tags=ui, human-in-the-loop, csv, mapping, product -->

# The Interface of Uncertainty: Designing Human-in-the-Loop

When the heuristic (or LLM) isn't confident, we don't guess. **We show the mapping UI and let the user confirm or correct.** That's REQUIRES_MAPPING—the interface of uncertainty.

## Production touchpoints

The narrative is consistent across the product. The **CSVImporter** drop zone: "Drag & Drop any Broker CSV" and "Auto-detection for 20+ brokers. Smart Mapping for everything else." When the format is **unknown**, the interstitial tells the user: "We didn't recognize this specific format, but we can still import it. Use Smart Import to map your columns automatically." So the same story—any CSV, auto-detect or Smart Mapping—runs from first impression to the mapping modal, without hiding the fallback.

## Why human-in-the-loop

**Interpretation over oracles.** The LLM suggests "which column is what"; the user can override; the app doesn't "decide" the user's data. Low confidence or missing required fields produce a RequiresMappingResult, so the user confirms or corrects before the final parse. That keeps the pipeline auditable and user-in-control while still allowing zero-click import when the system is confident.

## Benefits that compound

- **Technical:** Single pipeline, offline-friendly, robustness via heuristics + optional LLM + user confirmation.
- **Philosophical:** Data sovereignty (user brings the file), local-first (default is local parse), interpretation over oracles.
- **Financial:** No per-broker API fees; optional LLM cost is small (one request per file); no Plaid or broker API lock-in.

Metrics that matter: funnel (drop → complete import), path split (dedicated vs Universal, auto-apply vs REQUIRES_MAPPING), LLM usage when enabled, and fallback (how often users correct the mapping). Those signals guide synonym additions and prompt tuning—and justify investment in the Universal path.

---

*Part 8 of the **Sovereign Serial**. From [Universal LLM Import](https://www.pocketportfolio.app/book/universal-llm-import).*

**Read the full [Bestseller Edition](https://www.pocketportfolio.app/book/universal-llm-import) or [Try the app](https://www.pocketportfolio.app).**

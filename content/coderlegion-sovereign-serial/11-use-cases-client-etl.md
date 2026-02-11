<!-- CoderLegion: title=Beyond Finance: Use Cases for Client-Side ETL | date=2026-03-18 | tags=etl, csv, use-cases, schema-inference, extensibility -->

# Beyond Finance: Use Cases for Client-Side ETL

Any source that can export CSV can be supported. **The same pipeline applies; only the header vocabulary and locale may differ.**

## Brokers, banks, crypto, tax tools

Traditional brokers (US/UK/EU), banks, crypto exchanges, and tax tools (e.g. Koinly, TurboTax)—all go through the same pipeline. Known brokers can keep dedicated adapters for speed and branding; "unknown" or new brokers go through Universal Import. The production UI surfaces this as "Auto-detection for 20+ brokers. Smart Mapping for everything else."

## Non-financial CSV (generalized pattern)

The pattern "headers + sample → mapping → deterministic parse" is **generic.** Other domains (inventory, time tracking, CRM exports) could use the same idea: a small normalized schema, synonym/LLM mapping, then deterministic row conversion.

**Example: time-tracking CSV.** Standard schema: `date`, `project`, `task`, `hours`, `notes`. User exports from Toggl, Harvest, or a spreadsheet with columns like "Date", "Project Name", "Duration", "Notes". The heuristic would map known synonyms; the LLM could handle "Time Entry Date", "Client", "Billable Hours". The deterministic parse would convert date strings and numeric hours with locale awareness. Only the schema and the synonym list change. That reuse is why the design is a "pattern" as well as an implementation.

## Extensions: adapters, synonyms, prompts

- **Adapters:** New broker adapters can be added to the registry for first-class "known broker" UX; Universal Import remains the fallback.
- **Synonyms:** Community can suggest header synonyms; they're just data. Adding "Settlement Date" under `date` is a one-line change that improves heuristic confidence.
- **Prompts:** Prompt improvements (examples, edge cases) can be shared without code changes to the core parse logic. The response shape (mapping) is fixed, so prompt tuning does not affect the client or the deterministic parse step.

---

*Part 11 of the **Sovereign Serial**. From [Universal LLM Import](https://www.pocketportfolio.app/book/universal-llm-import).*

**Read the full [Bestseller Edition](https://www.pocketportfolio.app/book/universal-llm-import) or [Try the app](https://www.pocketportfolio.app).**

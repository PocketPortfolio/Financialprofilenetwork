<!-- CoderLegion: title=The 3-Row Snapshot: Privacy-Preserving Inference | date=2026-02-25 | tags=privacy, llm, csv, schema-inference, data-minimization -->

# The 3-Row Snapshot: Privacy-Preserving Inference

Sending the full CSV to an API would be a privacy and cost disaster. **We send only headers and three sample rows.** That's enough for the model to infer which column is date, ticker, quantity, price—without ever seeing the user's full history.

## Why three rows?

The mapping task needs column names and a hint of value shapes. One row might be enough for some CSVs but ambiguous when columns have similar value shapes (e.g. quantity vs price). Five or ten rows would increase token count and privacy exposure with diminishing returns. **Three is a compromise:** enough to disambiguate without exposing much. The codebase sends `sampleRows.slice(0, 3)` in the request to the mapping API; the client keeps the full file and runs the parse locally.

## What the API receives (and doesn't)

The mapping endpoint receives:

- **Headers:** The exact column names from the user's CSV.
- **Sample rows:** At most the first 3 rows, as arrays of values keyed by header.

It does *not* receive: the full CSV, account IDs, filenames, or any other PII beyond what's needed to map columns. The response is a single JSON object: standard field names → CSV header names. No storage, no logging of the payload by design.

## Tech stack and model choices

The API contract is stable: headers and sample rows in, mapping out. You can implement the route with any model (OpenAI, local, or another provider) as long as the response is a valid mapping. The client does not care where the mapping came from. Structured output (JSON only, fixed keys) keeps the response parseable; no fine-tuning is required for this narrow, in-distribution task.

---

*Part 5 of the **Sovereign Serial**. From [Universal LLM Import](https://www.pocketportfolio.app/book/universal-llm-import).*

**Read the full [Bestseller Edition](https://www.pocketportfolio.app/book/universal-llm-import) or [Try the app](https://www.pocketportfolio.app).**

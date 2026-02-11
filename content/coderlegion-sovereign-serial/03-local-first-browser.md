<!-- CoderLegion: title=Building Local-First: The Browser as the Server | date=2026-02-18 | tags=local-first, browser, csv, privacy, architecture -->

# Building Local-First: The Browser as the Server

Your users' trade history shouldn't touch your server. **We run the entire import pipeline in the browser.** File read, CSV parse, heuristic mapping, and—when heuristics aren't confident enough—only *headers and three sample rows* go to an API that returns a suggested mapping. The full CSV stays on the user's device.

## End-to-end local execution

Import is designed so that **heavy work runs in the client.** File reading, CSV parsing, heuristic mapping, and (when used) the decision to call an LLM are all in the browser. Only when LLM is enabled and heuristics are low-confidence does the app send **headers and a small number of sample rows** (e.g. first 3 rows) to an API that returns a suggested mapping. The full CSV content is not sent; parsing of the full file stays local.

**Why "headers + 3 rows"?** The mapping task only needs column names and a hint of value shapes (e.g. that the quantity column looks numeric). Three rows are enough for the LLM to disambiguate columns without exposing the user's full history.

## Browser as compute boundary

The browser holds the file, runs the importer package, and maintains portfolio state (e.g. IndexedDB or local state). The server is optional (LLM mapping endpoint) and stateless. No CSV is stored server-side; no broker credentials; no persistent server copy of trades.

**Data never leaving the client (by default):**

- **Default path:** Heuristic mapping only. Headers and sample rows stay in the client; no network call for mapping.
- **Optional LLM path:** Only headers and a few sample rows are sent to the mapping API; the response is a mapping object. The full CSV never leaves the client.
- **Parsing:** Always local. The deterministic parser runs in the client.

![Local-first flow: CSV file to normalized trades; browser does the work.](https://www.pocketportfolio.app/book-assets/figures/figure-02-local-first-flow.svg)

So "data never leaving the client" holds for the full CSV; the only exception is minimal, user-configurable LLM input when that feature is on. For maximum privacy, the LLM path can be disabled and only heuristics plus user-confirmed mapping used.

---

*Part 3 of the **Sovereign Serial**. From [Universal LLM Import](https://www.pocketportfolio.app/book/universal-llm-import).*

**Read the full [Bestseller Edition](https://www.pocketportfolio.app/book/universal-llm-import) or [Try the app](https://www.pocketportfolio.app).**

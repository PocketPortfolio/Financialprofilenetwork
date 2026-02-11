<!-- CoderLegion: title=The Bifurcated Pipeline: Heuristics + LLMs | date=2026-02-20 | tags=llm, schema-inference, heuristics, csv, pipeline -->

# The Bifurcated Pipeline: Heuristics + LLMs

You don't need an LLM for every import. **We run the heuristic first.** Only when confidence is below 0.9 and the feature is enabled do we send headers and three sample rows to an API. The rest—synonym-based mapping, confidence scoring, and the final deterministic parse—stays in the browser. **Two paths, one pipeline.**

## Heuristic vs LLM: when each runs

**Heuristic** runs first, in the client. It uses a synonym dictionary: for each standard field (date, ticker, action, quantity, price), it looks for a header that matches one of the synonyms. Confidence is (number of required fields mapped) / 5. No network call.

**LLM** runs only when confidence < 0.9 and the feature is enabled. The client sends headers and `sampleRows.slice(0, 3)` to the mapping API; the API returns a mapping object. If the LLM call fails, the pipeline falls back to the heuristic mapping (possibly low confidence), and the user may see the mapping UI to confirm or correct. So: heuristic is always the first attempt and the fallback; LLM is an optional boost for the long tail of header names.

## Deterministic vs probabilistic

- **Probabilistic:** Mapping inference. Heuristics and/or LLM produce a proposed mapping. Confidence = (required fields mapped) / 5.
- **Deterministic:** Once a mapping is chosen (by high confidence or user confirmation), parsing is pure: same CSV + same mapping + locale ⇒ same normalized trades. Dates via locale-aware `toISO()`, numbers via `toNumber()`, tickers via `toTicker()`. No randomness.

**Inference is probabilistic; application of the mapping is deterministic.**

## Confidence threshold and REQUIRES_MAPPING

If confidence ≥ 0.9 and all required fields are mapped, the pipeline runs the parse immediately. Otherwise it returns a "requires mapping" result: the UI shows the mapping editor; the user confirms or corrects; then the parse runs locally. The threshold 0.9 means "only auto-apply when we're very sure"; one missing or ambiguous required field keeps the user in the loop. That avoids silent mis-mapping while still allowing zero-click import when the heuristic or LLM is confident.

![LLM-assisted ingestion lifecycle: user, browser, heuristic, API, mapping UI.](https://www.pocketportfolio.app/book-assets/figures/figure-03-llm-lifecycle.svg)

---

*Part 4 of the **Sovereign Serial**. From [Universal LLM Import](https://www.pocketportfolio.app/book/universal-llm-import).*

**Read the full [Bestseller Edition](https://www.pocketportfolio.app/book/universal-llm-import) or [Try the app](https://www.pocketportfolio.app).**

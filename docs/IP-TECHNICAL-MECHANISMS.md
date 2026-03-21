# IP Technical Mechanisms — Codebase Record

This document is the engineering record of the technical mechanisms that support our IP strategy. It describes what the code does, not marketing claims. Keep it accurate and in sync with the implementation.

**Working patent concept:** *System and Method for Privacy-Preserving Cloud Inference via Deterministic Client-Side State Aggregation and Stateless Server-Side Grounding.*

---

## 1. Context engine (sanitization by construction)

**Location:** `app/lib/ai/contextBuilder.ts`

- **Mechanism:** A deterministic pure function `buildPortfolioContext(trades, positions?)` that converts in-memory trade and position data into a single string. The output schema is fixed: lines for total positions count, total trades count, total invested, total current value, total unrealized P/L, then up to 10 "top holdings" lines (ticker, shares, currency, value, allocation %, P/L %). No free-form fields; no raw ledger rows; no PII or account identifiers.
- **Why "sanitization by construction":** The function never receives or emits raw ledger rows. It only composes aggregates and a fixed top-N list. Therefore no scrubbing step can fail; the boundary of what leaves the device is defined by the function’s return type.
- **Call chain:** `app/dashboard/page.tsx` builds context in a `useEffect` via `buildPortfolioContext(displayTrades, positions)` and stores it in `PocketAnalystProvider`; `AskAIModal` sends that string in the request body to `/api/ai/chat` as `context`.

---

## 2. Stateless inference API and live grounding

**Location:** `app/api/ai/chat/route.ts`

- **Payload handling:** The route reads `message`, `context`, and optional `attachedContent` from the request body. These are used only to construct the system prompt and user message for the LLM. There are no database writes, caches, or queues that persist the request payload. Only analytics/quota metadata (e.g. toolUsage, aiUsage) are written; the actual context, message, and attachments are not stored.
- **Live quote injection:** The same route derives symbol hints from the user message (regex + name-to-ticker map), calls the internal `/api/quote` endpoint, and concatenates the returned quote data into the system prompt alongside the client-provided context. One request thus carries both local (client-built) context and server-fetched live data; after the response is streamed, the handler exits and no payload retention occurs.

---

## 3. Truncated-payload schema inference (CSV mapping)

**Locations:**  
`packages/importer/src/universal/` (index, inference, inferColumnMapping, synonyms, genericAdapter);  
`packages/importer/src/io/csvFrom.ts`;  
`app/api/ai/map-csv/route.ts`.

- **Mechanism:** For universal (unknown-broker) import, the client parses the CSV locally to obtain headers and a small number of rows. Only headers and up to a few sample rows (e.g. first 3 for the optional cloud step) are ever sent to the server. The server returns a column mapping (header name → standard field). The client retains the full file and runs the full parse locally using that mapping. Known-broker detection uses only the first 2KB of the file for `detectBroker()`; the full file is never uploaded for detection.
- **Heuristic vs LLM:** The client runs a heuristic mapper first (synonym-based + optional numeric validation). If confidence is below a threshold and the feature flag is set, the client may request a mapping from the cloud (e.g. `POST /api/ai/map-csv` with `headers` and a small `sampleRows` array). The full CSV is never sent. The server endpoint is designed to accept that request and return a mapping; the API contract and client flow support an optional LLM-based mapping (constructive reduction to practice).
- **Current server implementation:** As of this document, `app/api/ai/map-csv/route.ts` implements only heuristic mapping (same logic as the client fallback). The route does not call an external LLM. The architecture and request/response contract are intended to allow substitution of an LLM-based implementation when `ENABLE_LLM_IMPORT` is used; the patent-relevant behavior is the truncated payload (headers + limited rows) for schema resolution and the full parse remaining local.

---

## 4. Document maintenance

- Update this file when the above mechanisms change in code.
- Keep file-level comments in `contextBuilder.ts`, `app/api/ai/chat/route.ts`, and `app/api/ai/map-csv/route.ts` aligned with this record.

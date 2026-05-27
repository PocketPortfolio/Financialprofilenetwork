---
id: TIER1-INFERENCE-BOUNDARY-ANNEX
title: Pocket Analyst — Inference Boundary Technical Annex
status: DILIGENCE_ANNEX
branch: infra/diligence-hardening
last_updated: 2026-05-27
roles: [CSO, AI Architect, Procurement-facing]
---

# Inference Boundary Technical Annex

This annex supports Tier-1 due diligence on the **Split-Brain** architecture: local-first aggregation on the client, stateless inference on the server.

**Calibration SSOT:** `docs/command/claims-vs-codebase-calibration.md`, `docs/IP-TECHNICAL-MECHANISMS.md`.

---

## 1. End-to-end flow

```text
Client memory (trades / positions)
  → buildPortfolioContext()          [fixed schema, no PII]
  → POST /api/ai/chat                [Bearer auth for tier/quota only]
  → LLM prompt (ephemeral)           [stream response]
  → Firestore/KV                     [quota counters + analytics metadata ONLY]
```

---

## 2. Authorization Bearer vs LLM prompt — explicit separation

| Data class | Transport | Enters LLM prompt? | Persisted server-side? |
|------------|-----------|-------------------|------------------------|
| Firebase ID token (`Authorization: Bearer …`) | HTTP header | **No** | **No** (verified, discarded) |
| Decoded `uid` / `email` | Server memory during request | **No** | **Partial** — `uid` in `toolUsage` analytics metadata; `email` used for tier lookup only |
| User `message` | JSON body | **Yes** (user turn) | **No** in Firestore |
| `context` (portfolio aggregate string) | JSON body | **Yes** (system prompt block) | **No** in Firestore |
| `attachedContent` (paid tier) | JSON body | **Yes** (system prompt block) | **No** in Firestore |
| Live quotes | Server-fetched `/api/quote` | **Yes** (system prompt block) | **No** in Firestore |
| Quota counters | Internal | **No** | **Yes** — `aiUsage/{uid}` or KV `aiUsage:{uid}` |

### Code receipts

- Client sends Bearer + body: `app/components/ai/AskAIModal.tsx`
- Server verifies token, extracts `uid`/`email`, builds prompt: `app/api/ai/chat/route.ts`
- Route header contract (stateless w.r.t. portfolio payload):

```typescript
/**
 * Stateless: request payload (message, context, attachedContent) is used only
 * to build the LLM prompt and stream the response. No database write or cache
 * of the payload; only analytics/quota metadata are persisted.
 */
```

### Auditor question: “Does the model know who is asking?”

The LLM receives **no Firebase token**, **no email**, and **no account identifiers** in the prompt. Tier resolution uses auth server-side before prompt construction. Analytics may record `uid` in `toolUsage` — orthogonal to model context and not included in the prompt.

---

## 3. Portfolio context — sanitization by construction

`buildPortfolioContext()` (`app/lib/ai/contextBuilder.ts`) emits only:

- Total positions, trades, invested value, current value, unrealized P/L
- Top 10 holdings (ticker, shares, currency, value, allocation %, P/L %)

It **never** receives or emits raw ledger rows, account numbers, or broker identifiers.

---

## 4. `attachedContent` — user-initiated paid-tier edge case

| Control | Value |
|---------|--------|
| Availability | Founder's Club / Corporate tier only (`isPaid` gate in route) |
| Client cap | Frontend limits attachment size |
| Server cap | `MAX_ATTACHED_CONTENT_LENGTH = 60_000` chars (`route.ts`) |
| User intent | Explicit file attach in Ask AI modal — not automatic egress |
| Claim calibration | Do **not** say “AI never sees your data”; say “bounded, user-approved context” |

Free-tier requests with `attachedContent` receive **403** (`attachment_forbidden`).

---

## 5. Caching and persistence posture

| Mechanism | Setting |
|-----------|---------|
| Route segment | `export const dynamic = 'force-dynamic'` |
| Runtime | `nodejs` (not edge cache of handler) |
| Internal fetches | `cache: 'no-store'` on KV and quote fetches |
| Response stream | `Cache-Control: no-cache` on streamed text |

No Vercel Data Cache or Firestore write stores the request `context`, `message`, or `attachedContent`.

---

## 6. Automated verification

Integration test (Vitest): `tests/unit/ai/chat-inference-boundary.spec.ts`

- Mocks Gemini stream and Firestore
- Injects sentinel strings into `message`, `context`, and `attachedContent`
- **Asserts:** zero sentinel substrings in any Firestore write payload
- **Asserts:** allowed writes limited to `toolUsage` metadata and/or `aiUsage` quota fields
- **Asserts:** sentinel context appears in ephemeral Gemini request body (proves prompt use without persistence)

Run: `npx vitest run tests/unit/ai/chat-inference-boundary.spec.ts`

---

## 7. Approved external phrasing

- Client-side aggregation by construction for LLM context
- No PII or account identifiers on the Pocket Analyst inference path (by design in `contextBuilder.ts`)
- Stateless inference handler for portfolio text — payload not written to portfolio database

## 8. Prohibited phrasing (without legal sign-off)

- “AI never sees your data”
- “Zero server footprint” / “fully local portfolio” (auth users use Firebase for trades)
- “100% secure” / “zero vulnerabilities”

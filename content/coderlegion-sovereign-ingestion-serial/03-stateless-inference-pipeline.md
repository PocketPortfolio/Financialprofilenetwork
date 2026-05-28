---
title: "Part 3: The Stateless Inference Pipeline"
date: "2026-06-08"
tags: ["engineering", "ai", "serverless", "api", "gemini", "finance"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-ingestion-covers/ing-03.png"
series: "Sovereign Ingestion & Stateless Inference"
---

# The Stateless Inference Pipeline: Ephemeral Payloads and Quota Metadata

`POST /api/ai/chat` is Pocket Analyst’s inference hop. The route header in `app/api/ai/chat/route.ts` states the contract plainly:

```typescript
/**
 * Stateless: request payload (message, context, attachedContent) is used only
 * to build the LLM prompt and stream the response. No database write or cache
 * of the payload; only analytics/quota metadata are persisted.
 */
```

**Stateless** here means **stateless with respect to the portfolio context string** — not “the server never touches cloud.”

---

## End-to-end flow (accurate)

```text
Raw client corpus (trades / positions in memory)
  → buildPortfolioContext()     [client, Part 2]
  → bounded string in POST body
  → /api/ai/chat                [build prompt, stream out]
  → optional Firestore/KV quota + analytics metadata only
```

Full engineering record: `docs/IP-TECHNICAL-MECHANISMS.md` (patent-aligned mechanisms, CSV truncation rules, quote injection).

---

## What may persist server-side

<table>
<thead>
<tr>
<th scope="col">Data class</th>
<th scope="col">Typical store</th>
<th scope="col">Purpose</th>
</tr>
</thead>
<tbody>
<tr>
<td>Portfolio <code>context</code> string</td>
<td><strong>Not</strong> written to portfolio DB by this route</td>
<td>Ephemeral prompt input</td>
</tr>
<tr>
<td>Free-tier usage counters</td>
<td>Firestore and/or Vercel KV</td>
<td>Quota enforcement (<code>FREE_TIER_MONTHLY_LIMIT</code>)</td>
</tr>
<tr>
<td>Auth / tier resolution</td>
<td>Firebase Admin</td>
<td>Paid vs free model routing</td>
</tr>
</tbody>
</table>

Paid tiers skip monthly caps; free tier enforces limits — still **not** a ledger warehouse.

---

## Model routing and attachments

The route tries **Gemini** when `GOOGLE_GENERATIVE_AI_API_KEY` is set, with **OpenAI** fallback. `MAX_ATTACHED_CONTENT_LENGTH` caps server-side attachment size (frontend also caps).

**Attachments are a deliberate second boundary:** if the user uploads file text, that is explicit — distinct from the default sanitized snapshot path.

---

## Streaming

We use the **Vercel AI SDK** (`streamText`) for token streaming — UX requirement and operational standard in this codebase (`CLAUDE.md`). The response is generated once per request; there is no server-side conversation memory of portfolio rows in this handler.

---

## Procurement questions this answers

- **Can you prove non-retention of portfolio payload?** → Route comment + IP doc + absence of write calls on `context`.
- **Do you still have cloud?** → Yes: Firebase, KV, LLM APIs, Vercel — calibrated honesty (Part 4).
- **What does the model see?** → Bounded aggregate + user message + optional attachment + server quotes — not “nothing.”

---

*Part 3 of **Sovereign Ingestion & Stateless Inference**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book, explore [Open Portfolio](https://www.openportfolio.co.uk), or [try Pocket Portfolio](https://www.pocketportfolio.app).**

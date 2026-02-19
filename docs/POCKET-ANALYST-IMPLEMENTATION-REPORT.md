# Pocket Analyst (Ask AI) – Implementation Report

**Status:** Production-ready  
**Last updated:** 2025-02

---

## 1. Overview

Pocket Analyst is an in-app AI assistant that answers finance, portfolio, and market questions. It uses a hybrid setup: **client-built portfolio context** plus **server-side LLM** (Gemini primary, OpenAI fallback), with a floating action button (FAB), chat modal, tiered quotas, optional file attachments for paid users, and live quote injection for price questions.

### Features

| Feature | Description |
|--------|-------------|
| **Chat** | Streamed replies, Markdown rendering (bold, lists, links), branded “thinking” state |
| **Context** | Portfolio summary (totals, top holdings) and optional user-attached file (CSV/text) |
| **Live quotes** | Symbol hints extracted from the message; `/api/quote` called server-side; prices injected into model context |
| **Tiers** | Free: 20 questions/month, quota badge, upgrade modal at cap. Paid (Founder’s Club / Corporate): unlimited, file attachments |
| **Models** | Gemini (gemini-1.5-flash / gemini-1.5-pro) tried first; OpenAI (gpt-4o-mini / gpt-4o) fallback |

---

## 2. Architecture

```
User (signed in)
  → Dashboard / layout: PocketAnalystProvider wraps app; dashboard sets portfolioContext + tier
  → AskAIFab (FAB): opens AskAIModal
  → AskAIModal: POST /api/ai/chat (Bearer token, message, context, optional attachedContent)
  → /api/ai/chat: auth → tier → quota (if free) → quote fetch (if symbols) → LLM (Gemini then OpenAI) → stream
  → GET /api/ai/usage: returns used/limit for free tier (badge in modal)
  → Cron: GET /api/cron/ai-usage-reset (1st of month) resets aiUsage docs
```

### Data flow

- **Tier:** Firestore `apiKeysByEmail/{email}` → `tier` (`foundersClub` \| `corporateSponsor` = paid). Set by dashboard/settings from API keys or Stripe.
- **Usage:** Firestore `aiUsage/{uid}` → `usageCount`, `periodStart`, `updatedAt`. Free users only; reset when `periodStart` is older than 30 days or via cron.
- **Portfolio context:** `buildPortfolioContext(trades, positions)` in dashboard → `setPortfolioContext()` → passed into modal and sent as `context` in every chat request.

---

## 3. API Routes

### 3.1 POST /api/ai/chat

| Concern | Implementation |
|--------|----------------|
| **Auth** | `Authorization: Bearer <Firebase ID token>`; verified with Firebase Admin Auth. |
| **Body** | `message` (required), `context` (portfolio string), `attachedContent` (optional, paid only). |
| **Limits** | `attachedContent` capped at 60,000 chars server-side (frontend already caps at 50,000). |
| **Tier** | From `apiKeysByEmail`; paid = `foundersClub` \| `corporateSponsor`. |
| **Quota** | Free: `aiUsage/{uid}` read/updated; 20/month; 30-day rolling window; 429 when exceeded. |
| **Quotes** | Symbols extracted from message (name→ticker map + uppercase 2–5 letter tokens); `GET /api/quote?symbols=...` (same origin); result injected as “Current quote data” in system prompt. |
| **System prompt** | Finance-only analyst; use portfolio context; use quote data for prices; use attached file when present; user message prefixed with “[The user has included a file above; their message refers to it.]” when attachment exists. |
| **Models** | Gemini first (if `GOOGLE_GENERATIVE_AI_API_KEY`): free = `gemini-1.5-flash`, paid = `gemini-1.5-pro`. On failure or missing key, OpenAI (if `OPENAI_API_KEY`): free = `gpt-4o-mini`, paid = `gpt-4o`. |
| **Response** | 200: `text/plain` stream. 400/401/403/429/502/503: JSON `{ error }`. |

### 3.2 GET /api/ai/usage

- **Auth:** Same Bearer token.
- **Response:** Free: `{ used, limit: 20, unlimited: false }`. Paid: `{ used: 0, limit: null, unlimited: true }`. Used for quota badge in modal.

### 3.3 GET /api/cron/ai-usage-reset

- **Schedule:** `0 0 1 * *` (1st of month 00:00 UTC) in `vercel.json`.
- **Auth:** `CRON_SECRET` (Bearer or `x-vercel-cron`).
- **Action:** Resets `usageCount` and `periodStart` for up to 500 `aiUsage` docs. Per-request reset also runs when period has expired.

---

## 4. Frontend Components

| Component | Path | Role |
|-----------|------|------|
| **PocketAnalystProvider** | `app/components/ai/PocketAnalystProvider.tsx` | Context: `portfolioContext`, `tier`. Renders FAB + modal when user exists. |
| **AskAIFab** | `app/components/ai/AskAIFab.tsx` | Floating button (brand amber, Sparkles icon); opens modal. |
| **AskAIModal** | `app/components/ai/AskAIModal.tsx` | Chat UI: messages, Markdown for assistant, “Pocket Analyst is thinking…”, quota badge (free), Add file (CSV/text) for paid, upgrade modal on 429. |
| **contextBuilder** | `app/lib/ai/contextBuilder.ts` | `buildPortfolioContext(trades, positions?)` → string summary for LLM. |

### AskAIModal behaviour

- **Quota:** Fetches `GET /api/ai/usage` when opened; shows “X/20 this month” for free tier; refreshes after each successful send.
- **429 handling:** On 429, shows overlay modal: “Monthly limit reached”, CTA to `/sponsor?utm_source=pocket_analyst&utm_medium=quota_modal&utm_campaign=founders_club`, “Maybe later” to dismiss.
- **Attachment:** Kept in state across messages until user removes it; sent with every request while attached.
- **Markdown:** Assistant messages rendered with `react-markdown` + `remark-gfm`; links open in new tab, styled with brand colour.

---

## 5. Tier & Usage Summary

| Tier | Source | Quota | Attachments | Badge / upgrade modal |
|------|--------|--------|-------------|------------------------|
| Free | Not in `apiKeysByEmail` or tier ≠ foundersClub/corporateSponsor | 20/month, 30-day window | No (403 if sent) | “X/20 this month”; upgrade modal on 429 |
| Paid | `apiKeysByEmail.{email}.tier` = foundersClub \| corporateSponsor | Unlimited | Yes (CSV/text) | No badge; no quota modal |

---

## 6. Models & Providers

| Provider | Env var | Free model | Paid model |
|----------|---------|------------|------------|
| Google (Gemini) | `GOOGLE_GENERATIVE_AI_API_KEY` | gemini-1.5-flash | gemini-1.5-pro |
| OpenAI | `OPENAI_API_KEY` | gpt-4o-mini | gpt-4o |

At least one of the two env vars must be set; otherwise the chat returns 503. Gemini is tried first; OpenAI is used when the key is missing or the Gemini request fails.

---

## 7. Production Readiness

**Production checklist:** See **`docs/POCKET-ANALYST-PROD.md`** for env vars, pre-deploy checklist, post-deploy verification, and troubleshooting.

### 7.1 Security & limits

- Auth: Firebase ID token required for chat and usage.
- Attachments: Paid-only; server cap 60k chars.
- No PII in portfolio context (aggregates and ticker-level only).
- Quote fetch: server-to-server to same origin `/api/quote`.

### 7.2 Environment variables

See `docs/VERCEL-ENV-SUPPORT-ADMIN.md` and `docs/POCKET-ANALYST-PROD.md`. Required for Pocket Analyst:

- **Firebase Admin:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (auth + Firestore for tier and usage).
- **At least one LLM:** `GOOGLE_GENERATIVE_AI_API_KEY` and/or `OPENAI_API_KEY`.
- **Cron (optional):** `CRON_SECRET` for `/api/cron/ai-usage-reset`.
- **Landing video (optional):** `NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL` for the 42s demo on `/landing`.

### 7.3 Firestore

- **apiKeysByEmail/{email}:** `tier` used for paid/unlimited and attachments.
- **aiUsage/{uid}:** `usageCount`, `periodStart`, `updatedAt` for free-tier quota. No special indexes required.
- **toolUsage:** Events with `toolType: 'pocket_analyst'` for admin analytics (questions, errors, quota exceeded, unique users, by tier/provider).

### 7.4 Vercel

- **Cron:** `vercel.json` includes `"/api/cron/ai-usage-reset"` at `0 0 1 * *`.
- **maxDuration:** Chat route uses `maxDuration = 30` (seconds).

### 7.5 Admin analytics

- **`/admin/analytics`** includes a “Pocket Analyst (Ask AI)” section when `toolUsage.pocketAnalyst` is present (questions, last 7 days, unique users, errors, quota exceeded, by tier, by provider). Events are logged from `/api/ai/chat` to Firestore `toolUsage` with `toolType: 'pocket_analyst'`.

---

## 8. File Inventory

| Path | Purpose |
|------|--------|
| `app/api/ai/chat/route.ts` | Chat: auth, tier, quota, quotes, attachments, Gemini/OpenAI, stream |
| `app/api/ai/usage/route.ts` | Usage: used/limit or unlimited |
| `app/api/cron/ai-usage-reset/route.ts` | Monthly reset of aiUsage |
| `app/components/ai/AskAIModal.tsx` | Modal: chat, Markdown, thinking, quota badge, file add, upgrade modal |
| `app/components/ai/AskAIFab.tsx` | FAB |
| `app/components/ai/PocketAnalystProvider.tsx` | Context + FAB + modal wiring |
| `app/lib/ai/contextBuilder.ts` | Portfolio context string |
| `app/dashboard/page.tsx` | Sets `setPortfolioContext`, `setTier` for provider |
| `app/layout.tsx` | Wraps app with `PocketAnalystProvider` |
| `docs/VERCEL-ENV-SUPPORT-ADMIN.md` | Env vars (incl. Pocket Analyst) |
| `vercel.json` | Cron for ai-usage-reset |
| `app/components/landing/AnalystVideo.tsx` | Landing block: “Your Personal Quantitative Analyst” + Cloudinary video (42s trim) + CTAs |
| `app/landing/page.tsx` | Renders `<AnalystVideo />` after Hero |
| `app/styles/brand.css` | `.analyst-video-grid` 2-column at 1024px+ |
| `app/api/admin/analytics/route.ts` | Aggregates `toolType: 'pocket_analyst'` into `toolUsage.pocketAnalyst` |
| `app/admin/analytics/page.tsx` | “Pocket Analyst (Ask AI)” section (questions, errors, quota exceeded, unique users, by tier/provider) |
| `docs/POCKET-ANALYST-PROD.md` | Production checklist: env, pre/post deploy, verification, troubleshooting |

---

## 9. Verification Checklist

- [ ] **Gemini/OpenAI:** At least one key set in Vercel; send a message and confirm streamed reply.
- [ ] **Free tier:** Log in as free user; see “X/20 this month”; use 20 requests (or temporarily lower limit); confirm 429 and upgrade modal.
- [ ] **Paid tier:** User in `apiKeysByEmail` with `tier` = foundersClub or corporateSponsor; no quota badge; can attach file; unlimited requests.
- [ ] **Quotes:** Ask “What is Apple price?” or “how much is btc”; reply includes numeric price from quote data.
- [ ] **Attachment:** Paid user attaches CSV; ask “What do you think of this?”; reply references file content.
- [ ] **Cron:** `CRON_SECRET` set; after 1st of month, confirm cron ran (Vercel dashboard or logs).
- [ ] **Landing video:** Open `/landing`; scroll to “Your Personal Quantitative Analyst”; confirm video block (42s) and “Try Ask AI” / “Watch Demo” work. Set `NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL` (e.g. via `npm run upload-pocket-analyst-cloudinary`) then re-test.
- [ ] **Admin analytics:** Open `/admin/analytics`; confirm “Pocket Analyst (Ask AI)” section appears with questions, unique users, errors, quota exceeded, by tier/provider after some usage.

---

## 10. Summary

Pocket Analyst is implemented end-to-end with auth, tiering, quotas, live quotes, and optional attachments. It is production-ready provided Firebase Admin and at least one LLM key are set; optional cron keeps monthly resets consistent. This document serves as the single reference for architecture, APIs, frontend, and prod verification.

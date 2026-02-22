---
title: "Part 8: Economic Modeling - Sovereign Intelligence"
date: "2026-03-25"
tags: ["engineering", "ai", "cost", "quotas", "firestore", "finance"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "./images/chapter-08-header.png"
series: "Building Sovereign Intelligence"
---

# Economic Modeling: Running a free AI tier without going bankrupt

**Gemini Flash** (free tier): low cost per token; suitable for most portfolio and market questions. **Gemini Pro** (paid): higher capability and cost; for power users. We estimate cost per query (input + output tokens) and per user per month to set quotas and tier limits.

![Figure 8 — Cost/Unit Economics. Flow: User to Check tier to Check quota to Select model to Call API to Increment usage.](./images/si-figure-08-cost-economics.svg)

## Tiered quotas

**Free:** N questions per month (e.g. 20). **Founder's Club / paid:** unlimited (or higher cap). Quotas stored and enforced via Firestore: usage incremented per successful request; reset on a schedule (e.g. monthly). When the user hits the limit, the UI shows a friendly message and optional upgrade CTA.

## Cost per query and break-even

We estimate cost per query as (input tokens + output tokens) times cost per 1K tokens for the chosen model. For Flash, that is typically a fraction of a cent per question. Free tier (e.g. 20 questions/month) is a marketing cost; we cap it so that abuse is limited. Paid tier is priced to cover the marginal cost plus margin.

**Example:** Assume Flash costs 0.075 per 1M input tokens and 0.30 per 1M output tokens (illustrative). A typical request might be 2,000 input tokens and 500 output tokens. Cost per request is about 0.0003. So 20 free questions per user per month is about 0.006 per user per month. At 10,000 free users that is 60/month — a manageable marketing cost.

## Firestore schema for usage and quotas

We store per-user usage in Firestore: userId, tier, periodStart, questionsUsed, optionally lastRequestAt. When a request arrives, we read the document, check if questionsUsed is below quotaForTier(tier), and if so increment and proceed. If the period has rolled over (e.g. new month), we reset questionsUsed to 0. We do not store the content of requests; we only store counts and timestamps. The client can call GET /api/ai/usage to receive remaining, limit, periodEnd for display in the UI.

---

*Part 8 of **Sovereign Intelligence Serial** — adapted from [Sovereign Intelligence: Building Local-First RAG for Finance](https://www.pocketportfolio.app/book/sovereign-intelligence).*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) or [Try the app](https://www.pocketportfolio.app).**

---
title: "Part 4: 4,669 Active Users in 28 Days — Referral Spike on Stateless Infra"
date: "2026-05-01"
tags: ["engineering", "nextjs", "vercel", "firebase", "growth", "finance"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-engineering-covers/se-04.png"
series: "Sovereign Engineering"
---

# Growth Truth: Handling the Referral Spike

When traffic spikes, what breaks first — **routing**, **LLM quotas**, or **database write paths**? Here is how we framed a real referral window against a **stateless** chat surface.

---

## Headline traffic (GA4)

Figures below are from **Google Analytics 4** (Marketing performance) for a fixed **28-day** window. GA4 can revise counts slightly as sessions reconcile; we cite the **exported** values for this slice.

<table>
<thead>
<tr>
<th scope="col">Field</th>
<th scope="col">Value</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Date range</strong></td>
<td><strong>2026-03-06</strong> → <strong>2026-04-02</strong> (28 days)</td>
</tr>
<tr>
<td><strong>Active users</strong></td>
<td><strong>4,669</strong></td>
</tr>
<tr>
<td><strong>New users</strong></td>
<td><strong>4,500</strong></td>
</tr>
</tbody>
</table>

**Two different dials:** GA4 answers “how many people touched the property in this window.” Product-side analytics (referral events, campaign attribution, Stripe-adjacent rollups) answer “how did growth mechanics behave?” They are **complementary**, not interchangeable — and **GA4 active users** are not the same thing as **Firebase Auth** sign-in counts unless you say so explicitly.

---

## Stateless inference and where burst load lands

The app’s **chat** path is **stateless** for portfolio payloads (`/api/ai/chat` — see Part 1). Under spike load, stress concentrates on:

1. **Edge / routing** — session affinity is not the model; **referral survival** is. We **307** apex → `www` so `?ref=` and cookies stay coherent:

```typescript
// middleware.ts — canonical host: apex → www
if (host === 'pocketportfolio.app') {
  url.hostname = 'www.pocketportfolio.app';
  return NextResponse.redirect(url, 307);
}
```

2. **Serverless limits** — `maxDuration = 30` on the chat route; streaming responses; provider rate limits.
3. **Firestore** — quota counters (`aiUsage`), analytics metadata (`toolUsage`), **`referralEvents`** — hot writes, not giant prompt logs.

**Takeaway:** stateless inference keeps the **heaviest sensitive payload** off disk; growth still needs **solid** indexes and **realistic** capacity planning for referrals and quotas.

---

## What tends to fail first

1. **Referral attribution** (middleware, cookies) — if this slips, growth looks “direct only.”
2. **LLM provider** throttling or streaming failures.
3. **Firestore** write contention on high-frequency collections during campaigns.

---

*Part 4 of **Sovereign Engineering**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book or [try the app](https://www.pocketportfolio.app).**

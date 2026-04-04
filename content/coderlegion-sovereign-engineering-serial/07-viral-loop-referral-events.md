---
title: "Part 7: The Viral Loop — Engineering K-Factor Without Portfolio Telemetry"
date: "2026-05-22"
tags: ["engineering", "growth", "firebase", "privacy", "referrals"]
canonical_url: "https://www.pocketportfolio.app/book/sovereign-intelligence"
cover_image: "https://www.pocketportfolio.app/book-assets/sovereign-engineering-covers/se-07.png"
series: "Sovereign Engineering"
---

# Engineering the Viral Loop

We measure **referral codes and events**, not **holdings**. K-factor style thinking applies to **clicks → conversions**, instrumented in Firestore, without reading the user’s portfolio.

---

## Ingest: `POST /api/referral-event`

`app/api/referral-event/route.ts` validates:

- `action`: **`click`** | **`conversion`**
- `referralCode`: required
- optional `source`, `campaign`, `metadata`

Metadata is **sanitized and bounded** (`sanitizeMetadata`: max keys, max string lengths) so events stay small and predictable.

Firestore write:

```typescript
await db.collection('referralEvents').add({
  action,
  referralCode: String(referralCode).slice(0, 64),
  source: source || 'unknown',
  ...(campaignStr ? { campaign: campaignStr } : {}),
  ...(meta ? { metadata: meta } : {}),
  timestamp: Timestamp.now(),
});
```

**No portfolio fields** appear in this schema.

---

## Reward: `POST /api/referral/complete`

`app/api/referral/complete/route.ts` is **authenticated** (Bearer Firebase ID token). It:

- Validates `REF-*` referral code shape (`isValidReferralCode`)
- Resolves `referralIndex` doc
- Enforces **new-account** window (`REFEREE_MAX_ACCOUNT_AGE_MS`)
- Uses **idempotent** claim keys per `(campaign, referee uid)` (`sanitizeCampaignId`)

Default campaign constant comes from `VIRAL_REFERRAL_CAMPAIGN_DEFAULT` in `app/lib/viral/referralCodeServer.ts` — align with **`viral_moment_v1`** in analytics UI.

---

## Attribution plumbing

**Middleware** forces **apex → www** so `?ref=` survives and referral cookies stay on one origin (`pp_referral_code`, landing capture).

---

## Precision on “privacy”

We still store **Firebase UIDs** for auth and **referral codes** for growth. Claim: **loop velocity** does not require **portfolio PII** — not “we store nothing.”

---

*Part 7 of **Sovereign Engineering**.*

**Read the full [Sovereign Intelligence](https://www.pocketportfolio.app/book/sovereign-intelligence) book or [try the app](https://www.pocketportfolio.app).**

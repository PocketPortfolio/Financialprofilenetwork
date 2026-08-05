---
id: OP-CMD-SOVEREIGN-AI-LAUNCH-EMAIL-MANDATE-2026-08-10
title: Sovereign AI launch email — CMO-aligned mandate + superpower prompt
status: TEST_VERIFIED · VISUALS_LOCKED · CLEARED_FOR_PRODUCTION
date: 2026-08-05
cleared: Command Team CMD1+CMD2 visual/legal pass (footer contrast #71717a)
launch: 2026-08-10 14:00 BST (13:00 UTC)
cron: /api/cron/sovereign-ai-launch-blast
copy_ssot: docs/command/sovereign-ai-gtm-final-posts-2026-08-10.md §4
---

# Command mandate — Sovereign AI launch email

**Owners:** Marketing Ops + Engineering  
**Sign-off:** CMO / Org roles (below)  
**Payload:** Legal-cleared email from final posts rev 2 (not CMD 2 HTML with “data on your device”)

---

## Org + CMO feedback (CMD 1 ∩ CMD 2)

| Topic | Verdict |
|-------|---------|
| Full funnel sweep | **GO** — users + priority queue + identity gate |
| Dedup + unsubscribe | **GO** — normalize email, one send, respect `marketingOptIn` / `unsubscribed` / bounced |
| Rate limit + idempotency | **GO** — claim flags + `campaigns/sovereign_ai_launch_20260810` lock; batch sleep |
| Subject / body | **Use Legal-cleared** subject + body from final posts §4. Reject CMD 2 subject emoji pack and “process ledgers locally / data on your device” HTML. |
| Sender | Prefer existing founder from-line (`Abba Lawal \| Pocket Portfolio <abba@…>`) unless ESP requires `hello@` |
| Cron time | **Mon 10 Aug 2026 14:00 BST** (= 13:00 UTC) |
| Collection names | CMD said `priority_queue` / `identity_gate` — **map to real Firestore:** `waitlist`, `waitlistLeads`, `identityGateLeads` (+ Auth `users`; optional `mobileLeads`) |

**CMO:** Momentum signal to waitlist + identity-gate leads is correct GTM. Keep CTA single (“Open Ask AI”), amber terminal design, no DORA/GDPR warranty language, soft-launch footer note. Test to founder inbox before Friday lock.

**Command clearance (2026-08-05):** Test payload verified PASS (personalization, §6b hygiene, hierarchy, CTA). Footer muted raised to `#71717a` per CMD 2 micro-check. Asset locked for Mon 14:00 BST blast.

---

## Superpower prompt (engineering handoff)

```markdown
# SUPER POWER PROMPT: Sovereign AI Launch Email Dispatcher

**Target:** Monday, 10 August 2026 @ 14:00 BST (13:00 UTC)
**Route:** GET /api/cron/sovereign-ai-launch-blast
**Auth:** Authorization: Bearer $CRON_SECRET (or Vercel cron header)
**ESP:** Resend (RESEND_API_KEY, MAIL_FROM / SOVEREIGN_AI_LAUNCH_FROM)

## Objective
Dispatch one Legal-cleared Ask AI Sovereign routing launch email to a **deduplicated** contact surface across Firestore, with campaign lock, claim-before-send, rate limiting, and unsubscribe headers for Auth users.

## Audience (real collections — not CMD pseudonyms)
1. Firebase Auth + `users` (skip `marketingOptIn === false`, unsubscribed, bounced, already sent)
2. `waitlist` (priority queue UI)
3. `waitlistLeads`
4. `identityGateLeads` (identity gate)
5. Optional: `mobileLeads` (`includeMobile=0` to exclude)

Deduplicate on `email.toLowerCase().trim()`. Prefer Auth user record when email appears in both users and a lead collection.

## Copy (do not invent)
- Subject: `New in Ask AI: you control the intelligence route`
- Preheader: `Cloud Auto or OP-Hosted Sovereign — bounded summary only, not raw trades.`
- Body: `lib/marketing/sovereign-ai-launch-email.ts` (mirrors final posts §4)
- Greeting fallback: missing name → `Hi there,`

## Guardrails
- Idempotency doc: `campaigns/sovereign_ai_launch_20260810` — abort if status IN_PROGRESS or COMPLETED
- Per-recipient fields: `sovereignAiLaunchV1EmailClaimAt` / `sovereignAiLaunchV1EmailSentAt`
- Default max sends per invocation: 50 (`limit=` / `SOVEREIGN_AI_LAUNCH_MAX_SENDS`); sleep ~1000ms between sends
- Forbidden claims: laptop-local default, air-gap, “all data stays in browser”, DORA warranties

## Verification
1. Test: `npm run sovereign-ai-launch:send-test -- abbalawal22s@gmail.com Abba`
2. Or: `GET /api/cron/sovereign-ai-launch-blast?test=1&email=abbalawal22s@gmail.com` with CRON_SECRET
3. Dry-run: `?dryRun=1` → report `deduplicatedCount` + `sourceCounts`
4. Live: cron Mon 13:00 UTC; re-invoke with higher `limit` if audience > batch until COMPLETED

## Pre-flight checklist
- [ ] Dedup across users + waitlist + waitlistLeads + identityGateLeads
- [ ] firstName → "there" fallback
- [ ] Founder test render (Gmail / mobile)
- [ ] Cron locked 13:00 UTC Mondays (one-shot via campaign COMPLETED)
- [ ] Eng smoke Ask AI Cloud Auto + Sovereign + wake fallback morning of 10 Aug
```

---

## Ops commands

```bash
# Design/content test (local Resend)
npm run sovereign-ai-launch:send-test -- abbalawal22s@gmail.com Abba

# Dry-run count (prod, after deploy)
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://www.pocketportfolio.app/api/cron/sovereign-ai-launch-blast?dryRun=1"
```

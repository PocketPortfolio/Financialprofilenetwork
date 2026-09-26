---
id: OP-WEEKLY-SNAPSHOT-QUOTA-INCIDENT-2026-09-26
title: Weekly Snapshot Fri miss — Auth RESOURCE_EXHAUSTED · ownership lock
status: ACTIVE
date: 2026-09-26
owners:
  - Marketing (A — lifecycle deliverability / Resend audit)
  - Platform (R — cron health / Auth quota / drain schedule)
  - CPO (C — product value of snapshot / preference UX)
  - CCO (I — retail conversion path must not go dark)
related:
  - docs/marketing/WEEKLY-SNAPSHOT-EMAIL.md
  - docs/command/roles/head-of-marketing.md
  - docs/command/roles/head-of-platform-and-devops.md
  - docs/command/roles/_locks/2026-q3-camilla-growth-hub-lock.md
---

# Incident — Friday Weekly Snapshot did not reach Resend

## What happened (2026-09-25)

| Fact | Detail |
|------|--------|
| Trigger | Vercel Cron **did fire** (`vercel-cron/1.0`) at Fri ~21:00 UTC |
| Result | **500** in ~9s — **no Resend batch** |
| Error | `RESOURCE_EXHAUSTED: Quota exceeded` on Firebase Auth / Identity Toolkit |
| Root cause | Cron called `auth.listUsers` across the **full** user base in one invocation |

Resend was never the scheduler and never the failure point.

## Fix shipped (code)

1. **One Auth page per run** (`listUsers` page size 200) with Firestore cursor `cron_state/weekly_snapshot`
2. Soft-fail **503** on quota (cursor preserved) instead of aborting the week
3. `maxDuration = 300`
4. **Drain window:** Fri 21/22/23 UTC + Sat 09/12 UTC (`vercel.json`)

## Org RACI (do not let this slip)

| Role | Accountability |
|------|----------------|
| **Marketing** | **A** — lifecycle health KPI; confirm Resend `weekly_snapshot` volume each Monday; escalate if zero |
| **Platform** | **R** — cron invocations green; Auth quota; cursor drain completes (`complete: true` in state doc) |
| **CPO** | **C** — product intent of Weekly Snapshot (value email + referral); preference defaults |
| **CCO** | **I** + commercial pressure — retail conversion path (Camilla lock) depends on Marketing+Platform keeping automated Pocket emails alive; CCO flags pipeline risk if lifecycle goes dark |
| **Eng** | Implements batching / instrumentation when Platform escalates |

Per quarterly lock: *Platform keeps Resend, analytics, and cron paths healthy so Marketing can audit conversion.* Marketing owns lifecycle deliverability. CCO does not own MQL execution but **cannot accept silent dark weeks** on the retail conversion assist without escalation.

## Immediate ops (after deploy)

1. Deploy this fix to production
2. Manually `GET /api/cron/weekly-snapshot` with `Authorization: Bearer $CRON_SECRET` once to start drain
3. Confirm Firestore `cron_state/weekly_snapshot` advances `pageToken` / `complete`
4. Confirm Resend tag `weekly_snapshot` receives traffic
5. Marketing: Monday Command note — sent count vs prior Friday

## Failure stop

If a Friday primary slot returns 503 RESOURCE_EXHAUSTED and Sat drain also fails → Platform raises Auth quota in GCP **same day**; Marketing does not wait for the next Friday.

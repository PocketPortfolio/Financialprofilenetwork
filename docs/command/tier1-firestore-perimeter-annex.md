---
id: TIER1-FIRESTORE-PERIMETER
title: Firestore Perimeter — Phase 2 Lockdown Annex
status: DILIGENCE_ANNEX
branch: infra/diligence-hardening
last_updated: 2026-05-27
---

# Firestore Perimeter Lockdown

## Problem

Anonymous `create: if true` on `toolUsage` and `pageViews` allowed any holder of the public Firebase client config to spam analytics collections directly, bypassing API validation.

## Solution

### Rules (`firebase/firestore.rules`)

- `toolUsage`, `pageViews`, `waitlist`, `waitlist_rate_limit` → **`allow write: if false`**
- Production writes use **Firebase Admin SDK** in API routes (rules bypass for Admin).

### API rate limits (`app/lib/server/kv-rate-limit.ts`)

| Route | Bucket | Limit |
|-------|--------|-------|
| `POST /api/waitlist/join` | IP + email hash | 10/hr IP, 5/hr email |
| `POST /api/waitlist/submit` | IP hash | 8/hr |
| `POST /api/tool-usage` | IP hash | 120/min |
| `POST /api/page-views` | IP hash | 180/min |

KV is optional in local dev (fail-open); production requires `KV_REST_API_URL` + `KV_REST_API_TOKEN`.

### Waitlist join path

`/join` form → `saveToWaitlist()` → `POST /api/waitlist/join` → Admin SDK → `waitlist` collection.

No client-side Firestore write for waitlist entries.

## Verification

- `npm run test:inference-boundary` — auth/inference bridge intact
- `npm run e2e:dual-surface` — dual-host smoke (requires dev server)
- Deploy rules: `firebase deploy --only firestore:rules` (human gate)

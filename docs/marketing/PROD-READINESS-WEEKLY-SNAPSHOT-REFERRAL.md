# Production Readiness: Weekly Snapshot + Referral Tracking

**Scope:** Weekly Snapshot email (Trojan Horse), referral event tracking, admin analytics Referrals section.  
**Deploy after:** Vercel env set, Firestore rules deployed (if changed).

---

## 1. Environment (Vercel)

| Variable | Required | Used by |
|----------|----------|--------|
| **CRON_SECRET** | Yes | `/api/cron/weekly-snapshot` (Vercel Cron auth) |
| **RESEND_API_KEY** | Yes | Weekly Snapshot + Stack Reveal emails |
| **EMAIL_ASSET_ORIGIN** | No (default: https://www.pocketportfolio.app) | Email links and referral links in emails |
| **MAIL_FROM** | No | From address (default: Pocket Portfolio &lt;ai@pocketportfolio.app&gt;) |
| **FIREBASE_*** | Yes | Cron (list users, `users/`, `portfolio_snapshots`, `referralEvents`) |

Same as existing Stack Reveal / cron setup. No new secrets.

---

## 2. Vercel Cron

- **Path:** `/api/cron/weekly-snapshot`
- **Schedule:** `0 21 * * 5` (Friday 21:00 UTC)
- **Config:** Already in `vercel.json`. No change needed after deploy.

---

## 3. Firestore

- **Collections used:** `users` (read/update), `portfolio_snapshots` (read), `referralEvents` (write by API, read by admin API).
- **Rules:** `referralEvents` rule added in `firebase/firestore.rules` (read: isAdmin; write: false). Deploy rules if you changed them: `firebase deploy --only firestore:rules`.
- **Index:** Query is `referralEvents` where `timestamp >= startDate`. Single-field range typically works without a composite index. If you see a missing-index error in production, add a single-field index on `timestamp` for `referralEvents`.

---

## 4. Post-deploy checks

1. **Cron:** After first Friday 21:00 UTC, confirm cron ran (Vercel Dashboard → Crons or logs). Optional: trigger once with `GET https://www.pocketportfolio.app/api/cron/weekly-snapshot` with `Authorization: Bearer YOUR_CRON_SECRET`.
2. **Referral tracking:** Open app, click an invite link (or use `/invite` and copy link), then sign up in another session; check `/admin/analytics` → Referrals for clicks and conversions.
3. **Unsubscribe:** Click “Unsubscribe” in a Weekly Snapshot email; confirm only weekly snapshot is turned off (Settings → Email).

---

## 5. Rollback

- **Disable Weekly Snapshot:** In Vercel, remove or disable the cron for `/api/cron/weekly-snapshot`, or set all users’ `weekly_snapshot_enabled` to false (backend script). App and referral tracking continue to work.
- **Referral events:** Stopping `POST /api/referral-event` only stops new events; admin Referrals section will show existing data.

---

## 6. References

- [WEEKLY-SNAPSHOT-EMAIL.md](./WEEKLY-SNAPSHOT-EMAIL.md) — cadence, copy, template.
- [EMAIL-MARKETING-SEQUENCE.md](../EMAIL-MARKETING-SEQUENCE.md) — Stack Reveal (Monday) vs Weekly Snapshot (Friday) cadence.
- [PRINCIPAL-GROWTH-HACKER-IMPLEMENTATION-REPORT.md](./PRINCIPAL-GROWTH-HACKER-IMPLEMENTATION-REPORT.md) — implementation summary and projections.

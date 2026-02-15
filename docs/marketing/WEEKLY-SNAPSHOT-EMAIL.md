# Weekly Snapshot Email (Trojan Horse Referral)

**Status:** Implemented  
**Cadence:** Friday 21:00 UTC (market close; bookends Monday Stack Reveal)  
**Purpose:** Value-first email with embedded referral loop (no standalone "invite" email).

---

## Overview

The **Weekly Portfolio Snapshot** is the "Trojan Horse" for Mode 2 (Referral & Viral): it delivers value (one key number: portfolio % change or "Markets this week") and embeds the referral CTA in the body and footer. Users get a reason to open the email; the share moment is natural (green = "show off your gains", red = "misery loves company").

- **No separate "Invite your friends" email** — referral lives inside this weekly value email to avoid spam and unsubscribes.
- **Referral link** is appended to every Weekly Snapshot and used for the "Share Snapshot" CTA and dynamic footer.

---

## Cadence and trigger

- **Schedule:** Vercel cron `GET /api/cron/weekly-snapshot` runs **Friday 21:00 UTC** (market close). This bookends the Monday Stack Reveal (education) with a Friday results touchpoint, spacing touchpoints by ~4 days to avoid spam fatigue (see `vercel.json`).
- **Eligibility:** Users with `weekly_snapshot_enabled !== false` on `users/{uid}` (default true). Idempotency: at most one send per user per week (`lastWeeklySnapshotSentAt`).

---

## Subject and body variants

| Variant | Subject | Body |
|--------|--------|------|
| **With portfolio data** | "Your portfolio is up 3.2% this week" / "Your portfolio is down 1.1% this week" | One hero number (%), optional "Top gainer: AAPL +5%". Hook: "Beating the market? Share your portfolio snapshot with a friend." CTA: **Share Snapshot** (referral link). |
| **No data** | "Markets this week – Pocket Portfolio" | "Here's your weekly Pocket Portfolio check-in." Hook: "Invite a friend to track their portfolio." CTA: **Share Snapshot** (referral link). |

---

## Dynamic footer (above Unsubscribe)

- **Portfolio green (positive return):** "Show off your gains. Share your public link." → referral link.
- **Portfolio red (negative or zero):** "Misery loves company? Invite a friend to track the dip with you." → referral link.
- **No data:** "Invite a friend to try Pocket Portfolio." → referral link.

The referral link is also repeated in plain text at the very bottom of the email.

---

## Unsubscribe

- Unsubscribe link includes `type=weekly_snapshot`. The `/api/unsubscribe` handler sets `weekly_snapshot_enabled: false` (not the global `marketingOptIn`), so users can opt out of the weekly email only.
- See [EMAIL-MARKETING-SEQUENCE.md](../EMAIL-MARKETING-SEQUENCE.md) for the main Stack Reveal sequence.

---

## Implementation

- **Template:** `lib/weekly-snapshot/email-templates.ts` (subject, HTML, green/red footer).
- **Cron:** `app/api/cron/weekly-snapshot/route.ts` (list users, read `portfolio_snapshots`, compute % change, send via Resend with tag `campaign: weekly_snapshot`).
- **User setting:** `weekly_snapshot_enabled` on `users/{uid}`; toggle in Settings (Email section).
- **Test:** `npm run weekly-snapshot:send-test -- <email>` (sends one test email with mock +2.5% and top gainer AAPL).

---

## Growth Blueprint

This email is the **Weekly Trigger (Trojan Horse)** in **Section 7 – Referral & Viral (Mode 2)** of the Pocket Portfolio Growth Blueprint. Goal: turn passive users into promoters without sending a dedicated "invite" email.

# Support Form (CEO Mandate)

**Status:** Implemented  
**Date:** February 2026

## Summary

When users click **Support** in the app navigation (sidebar), a form modal opens to collect support details and optional attachments. Every submission is **saved to Firestore** (`supportSubmissions`) and is **visible to admins at `/admin/support`**. Email is also sent to **ai@pocketportfolio.app** (or `SUPPORT_EMAIL_TO`) when Resend is configured; if email delivery fails, submissions are still available in admin.

## Implemented pieces

| Item | Location |
|------|----------|
| Modal UI | `app/components/dashboard/SupportFormModal.tsx` |
| API | `POST /api/support` in `app/api/support/route.ts` (persists to Firestore, then sends email) |
| Admin view | `GET /api/admin/support` + `app/admin/support/page.tsx` — admins see all submissions |
| Firestore | `supportSubmissions` collection (read: admin; write: server only) |
| Email helper | `sendSupportEmail()` in `lib/stack-reveal/resend.ts` |
| Nav behavior | `app/components/dashboard/SovereignHeader.tsx` — Support opens modal; admins get "View support" link to `/admin/support` |

## Form fields

- **Email** (required) — prefilled when user is logged in
- **Name** (required) — prefilled when available
- **Subject** (required) — dropdown: Bug, Feature request, Billing, Import / CSV, Other
- **Message** (required) — textarea
- **Attachments** (optional) — up to 5 files, 10MB each, 20MB total (e.g. PDF, images, CSV, TXT, JSON)

## Email delivery

- **To:** `SUPPORT_EMAIL_TO` env (default: ai@pocketportfolio.app). Set to a known-working inbox (e.g. your Gmail) if ai@ does not receive.  
- **From:** `SUPPORT_MAIL_FROM` env (default: `Pocket Portfolio Support <support@pocketportfolio.app>`).  
- **Reply-To:** Submitter’s email  
- **Subject:** `[Support] <user’s subject>`  
- **Body:** HTML with name, email, subject, message, timestamp; attachments are included.  
- **Resend tag:** `support_form`

Requires `RESEND_API_KEY` in env (same as Stack Reveal / Weekly Snapshot). If emails still don’t arrive at ai@, set **SUPPORT_EMAIL_TO** in `.env.local` (e.g. `SUPPORT_EMAIL_TO=you@gmail.com`) and check the Resend dashboard (Emails / Events) for delivery status using the returned email id.

## How to test

1. **In the app:** Run `npm run dev`, sign in, open the nav menu (hamburger), click **Support**. Fill the form and submit. Check ai@pocketportfolio.app inbox (and Resend dashboard for delivery).
2. **API only:** With dev server running, from the project root:
   ```bash
   node scripts/test-support-api.js http://localhost:3000
   ```
   Expect 200 and `{ "success": true }` if Resend is configured; otherwise 500 with an error message.

## Limits

- Max 5 attachments, 10MB per file, 20MB total.
- No server-side rate limit (consider adding by IP or user if needed).

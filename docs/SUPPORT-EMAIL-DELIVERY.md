# Support email delivery to ai@pocketportfolio.app

## How it works

- Support form submissions are **always** sent to **ai@pocketportfolio.app** (hardcoded in `lib/stack-reveal/resend.ts`).
- Resend API is called with `to: ['ai@pocketportfolio.app']`. If Resend returns success and the dashboard shows "Delivered", the message was accepted by the **receiving mail server** for that address.
- **Where you read ai@:** Resend dashboard and **/admin/analytics** only. Outbound emails sent by Resend (including support form emails) to ai@ usually **do not** appear in Resend Inbound or in analytics that show inbound mail—same-account outbound → same address often doesn’t show there. **Use /admin/support as the source of truth** for support requests; all submissions are stored in Firestore and listed there.

## Receiving support emails in the Google client for ai@

For support emails to show up in the **Google client (Gmail/Workspace) for ai@pocketportfolio.app**:

1. **MX must deliver to Google**  
   Resend sends to whatever server the **MX records** for `pocketportfolio.app` say. If MX points to **Resend** (e.g. for Inbound), messages go to Resend’s servers, not to Google—so they won’t appear in the Google inbox for ai@. To receive in Google you need either:
   - **MX for the domain (or for the host that receives ai@) pointing to Google** (Google Workspace setup), or  
   - **Forwarding**: if MX is Resend, configure Resend Inbound (or your current receiver) to **forward** mail for ai@ to your Google address.

2. **Check spam**  
   In the Google mailbox where you read ai@, check **Spam/Junk** for `[Support]` or `support@pocketportfolio.app`.

3. **Guaranteed copy in Gmail**  
   To always have a copy in a Google inbox while MX/forwarding is fixed, set in `.env.local`:
   ```bash
   SUPPORT_EMAIL_TO="abbalawal22s@gmail.com"
   ```
   Restart the dev server. Both ai@ and that Gmail receive each submission.

## If ai@ is not receiving

"Delivered" means delivery to the **server** that handles ai@pocketportfolio.app, not necessarily to a specific inbox. Check:

1. **Where is ai@pocketportfolio.app hosted?** (e.g. Google Workspace, Resend Inbound, catch-all, forwarding.)
2. **Spam/Junk** – Check the spam folder for the ai@ mailbox.
3. **Forwarding** – If ai@ forwards to another address, confirm the forward is active and the destination isn’t filtering.
4. **Same-domain from** – We send **from** `support@pocketportfolio.app` to avoid self-send filtering. If only `ai@` is verified in Resend, set in `.env.local`:
   ```bash
   SUPPORT_MAIL_FROM="Pocket Portfolio <ai@pocketportfolio.app>"
   ```
   Restart the dev server after changing env.

## Get a copy in another inbox

To receive support emails at another address **in addition to** ai@, set in `.env.local`:

```bash
SUPPORT_EMAIL_TO="your@gmail.com"
```

Then both ai@pocketportfolio.app and that address receive each support submission. Restart the dev server after changing.

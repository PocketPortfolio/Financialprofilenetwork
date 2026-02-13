# Stack Reveal Email: Deliverability & Avoiding Spam

## Why emails land in Spam

Common causes:

1. **From address** – `noreply@` is often associated with bulk/marketing and can trigger filters. We send from **`ai@pocketportfolio.app`** (or `MAIL_FROM` if set) for better trust.
2. **Domain authentication** – If SPF/DKIM/DMARC are missing or wrong, providers (e.g. Gmail) are more likely to bin or spam the mail.
3. **Images in Spam** – When a message is in Spam, many clients (including Gmail) **do not load external images** for safety. So the logo can appear broken even if the URL is correct. Moving to Inbox often fixes image loading.
4. **Content and reputation** – Spammy wording, low engagement, or poor sender reputation increase spam placement.

## What we do in code

- **From:** `Pocket Portfolio <ai@pocketportfolio.app>` (override with `MAIL_FROM`).
- **List-Unsubscribe** and **List-Unsubscribe-Post** headers so one-click unsubscribe works (helps with spam scoring).
- Logo via a stable hosted URL (Cloudinary) so when images are allowed, the logo loads.

## What you need to do (Resend + DNS)

1. **Verify the domain in Resend**  
   Resend Dashboard → Domains → add and verify `pocketportfolio.app`. Resend will show the DNS records (SPF, DKIM, etc.) to add.

2. **Add the DNS records**  
   At your DNS host, add the SPF and DKIM (and optionally DMARC) records Resend gives you. Until this is done, many providers will treat the mail as unauthenticated and may put it in Spam.

3. **Send from a verified address**  
   Use a From address on the verified domain. We use `ai@pocketportfolio.app`; ensure that address (or the domain) is allowed in Resend for sending.

4. **Warm up and reputation**  
   New domains and low volume can land in Spam at first. Sending to engaged users and avoiding bounces/complaints helps over time.

## If mail is still in Spam

- Confirm in Resend that the domain shows as **Verified** and that SPF/DKIM pass (e.g. Resend’s sending logs or a test to mail-tester.com).
- Recipients can move the message to Inbox and “Not spam”; that can improve placement for future sends.
- Check Resend’s deliverability or bounce docs for your plan and region.

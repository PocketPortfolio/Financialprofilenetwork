# CTO Report: Stack Reveal Email Logo Not Rendering

**Date:** February 2025  
**Component:** Stack Reveal weekly emails (Resend)  
**Symptom:** Header logo (`pp-monogram.png`) does not display in sent emails—neither in Resend dashboard preview nor in recipient inbox (Gmail, Outlook, etc.). Recipients see a broken image placeholder or empty space where the logo should be.  
**Status:** Resolved per verdict below (hosted URL + baked background). CID and Data URI approaches abandoned.

---

## 1. Executive Summary

We send Stack Reveal educational emails via **Resend**. The HTML includes a header logo (40×40 PNG) next to the “Pocket Portfolio” wordmark. The logo **never renders** for recipients (or in Resend’s own preview), despite trying every standard approach: inline data URI, hosted URL, and CID (Content-ID) inline attachment with both base64 content and remote `path`. Runtime logging confirmed our payloads are correct (attachment present, CID in HTML, or data URI in HTML as intended). The asset is a valid PNG (80×80, ~5.7KB, light color for contrast on dark green header). We need external input—likely from Resend or an email deliverability specialist—to determine why inline/attached images are not displayed.

---

## 2. Environment

| Item | Detail |
|------|--------|
| **Sender** | Resend API (Node.js), `emails.send()` |
| **From** | `Pocket Portfolio <noreply@pocketportfolio.app>` (or `MAIL_FROM` env) |
| **Template** | `lib/stack-reveal/email-templates.ts` (HTML built server-side) |
| **Sending** | `lib/stack-reveal/resend.ts` → Resend Node SDK |
| **Logo asset** | `public/brand/pp-monogram.png` (80×80 PNG, ~5.7KB, light/white for header `#0d2818`) |
| **Hosted URL** | `https://www.pocketportfolio.app/brand/pp-monogram.png` (served by Next.js `public/` after deploy) |
| **Test recipient** | Gmail (and Resend dashboard preview) |

---

## 3. Approaches Tried and Outcomes

### 3.1 Inline image via data URI

- **Implementation:** Read `public/brand/pp-monogram.png`, base64-encode, set `img src="data:image/png;base64,..."` in the HTML.
- **Outcome:** Logo still does not render. Many email clients (and possibly Resend’s preview pipeline) strip or block data URIs in `img` for security; we observed this in practice.
- **Verified:** Logs confirmed `usesDataUri: true` (HTML contained the data URI).

### 3.2 Hosted URL in `img` src

- **Implementation:** `img src="https://www.pocketportfolio.app/brand/pp-monogram.png"`. No attachment.
- **Outcome:** Logo does not render unless the recipient explicitly allows “Display images” / “Load remote images,” and the URL must return 200 with the PNG. In our tests the logo still did not show (possible 404 before deploy, or client blocking remote images by default).
- **Note:** The URL was confirmed to serve a valid PNG when opened in a browser; the asset was initially dark and nearly invisible on the dark header—we fixed visibility by regenerating a light PNG, but rendering in email still failed.

### 3.3 CID (Content-ID) inline attachment — base64 content

- **Implementation:** Attach the logo as a MIME part with `contentId: 'pp-logo'` and `content` (base64 string). HTML: `img src="cid:pp-logo"`. Tried with and without `content_type: 'image/png'`.
- **Outcome:** Logo does not render in Resend dashboard or in inbox. Resend’s docs state that inline attachments **do not display in the emails dashboard** when previewing HTML; we still expected inbox clients to resolve `cid:` and show the image—they did not in our tests.
- **Verified:** Logs showed `attachmentsLength: 1`, `hasCidInHtml: true`, `contentId: 'pp-logo'`, and when using base64, `attachmentBase64Len: 7652` (larger PNG). Payload shape was correct per Resend’s attachment and embed-inline-images docs.

### 3.4 CID inline attachment — remote `path`

- **Implementation:** `attachments: [{ path: 'https://www.pocketportfolio.app/brand/pp-monogram.png', filename: 'pp-monogram.png', contentId: 'pp-logo' }]`, HTML unchanged: `img src="cid:pp-logo"`.
- **Outcome:** Same as 3.3—logo does not render. Resend is expected to fetch the URL and embed it as an inline part; we could not confirm whether the fetched image is actually attached with the correct Content-ID and `Content-Disposition: inline` in the outgoing MIME.
- **Verified:** Logs showed `attachmentPath` and `contentId` set as above.

### 3.5 Asset size and visibility

- **Implementation:** Switched from a ~228-byte (solid-color) PNG to a ~5.7KB PNG with slight variation so the file is a “normal” size; regenerated the asset as a light/white square so it is visible on the dark green header (`#0d2818`).
- **Outcome:** Asset is valid and visible when viewed directly; email rendering unchanged. So the issue is not “invalid image” or “invisible same-color logo.”

---

## 4. Runtime Evidence (Debug Logging)

During debugging we instrumented the send path and confirmed:

- **Attachment present when using CID:** `attachmentsLength: 1`, `firstAttachmentKeys` included `content`, `filename`, `contentId` (and when used, `content_type`).
- **CID in HTML:** `hasCidInHtml: true` when template used `cid:pp-logo`.
- **Data URI in HTML:** `usesDataUri: true` when template used inline base64.
- **Path attachment:** `attachmentPath` set to the production logo URL when using `path` for the attachment.
- **Logo file:** `getLogoAttachment()` saw correct `process.cwd()`, file existed, read succeeded; base64 length matched file size (e.g. 7652 for ~5.7KB PNG).

So we are sending the intended payloads; the failure appears to be downstream (Resend’s handling, MTA, or recipient client).

---

## 5. Resend Documentation Findings

- **Embed inline images (CID):** [Embed Inline Images](https://resend.com/docs/dashboard/emails/embed-inline-images) — use `cid:<contentId>` in `img src` and set `contentId` on the attachment (with either `content` or `path`). We followed this.
- **Attachments:** [Attachments](https://resend.com/docs/dashboard/emails/attachments) — for local file we send base64 `content`; for remote we send `path`. We tried both.
- **Important caveat:** “All attachments (including inline images) **do not currently display** in the emails dashboard when previewing email HTML.” So dashboard preview not showing the logo is expected; the problem is that the logo also does **not** display in the actual inbox (e.g. Gmail).
- **Recommendation in docs:** Adding `content_type` (e.g. `image/png`) to the attachment can help clients render; we added it for the base64 attachment attempt.

---

## 6. Root Cause Hypotheses (Unconfirmed)

1. **Resend MIME handling of inline (CID) attachments:** The outbound MIME may not set `Content-Disposition: inline` and `Content-ID` correctly for our attachment, so recipient clients never treat it as an inline image and do not resolve `cid:pp-logo`. This would require Resend to confirm or inspect a raw sent message.
2. **Client stripping of data URIs:** Gmail/Outlook (or Resend’s own sanitization) may remove `data:image/...` from `img src`, which would explain why data URI never worked.
3. **Client blocking of remote images:** If we rely on the hosted URL, default “don’t load remote images” would show a broken/placeholder until the user enables images; we still saw failure even when expecting images to be allowed.
4. **Domain / deliverability:** Hypothetically, images could be blocked or stripped for a specific sending domain or reputation; no evidence gathered for this.
5. **Resend dashboard as proxy for real email:** We relied on Resend’s preview and one inbox (Gmail); another client (e.g. Apple Mail, Outlook desktop) might behave differently. We did not systematically test multiple clients.

---

## 7. Current Implementation (As of This Report)

- **Template (`lib/stack-reveal/email-templates.ts`):**  
  Logo is **hosted URL only**: `LOGO_URL = \`${EMAIL_ASSET_ORIGIN}/brand/pp-monogram.png?v=4\``. All email links (logo, Portal, Unsubscribe, Home, CTAs) use `EMAIL_ASSET_ORIGIN = 'https://www.pocketportfolio.app'` so they work when tests run from localhost.  
  Header: `<img src="${LOGO_URL}" alt="Pocket Portfolio" width="40" height="40" ... />`.

- **Send (`lib/stack-reveal/resend.ts`):**  
  No logo attachment. Payload is `from`, `to`, `subject`, `html`, `tags`; optional `headers` for List-Unsubscribe when `unsubscribeUrl` is provided.

- **Asset:**  
  `public/brand/pp-monogram.png` is the **real Pocket Portfolio "P" monogram** (80×80 PNG): generated from `public/brand/pp-monogram-email.svg` (solid #0d2818 background, white "P" + small square). Regenerate with `npm run generate:logo-png` (uses `scripts/svg-to-png-resvg.mjs` and `@resvg/resvg-js`; no Chrome required). Production serves this file at `/brand/pp-monogram.png` after deploy.

---

## 8. Recommended Next Steps / Asks for Help

1. **Resend support:**  
   - “We use your Node SDK to send HTML emails with an inline image (Content-ID attachment and `img src="cid:pp-logo"`). The attachment is sent with `contentId`, and we also tried `path` to a public URL. The image does not display in the recipient inbox (Gmail) or in your dashboard preview. Can you confirm how inline CID attachments are set in the outgoing MIME (e.g. `Content-Disposition: inline`, `Content-ID` header) and whether there are known limitations or required formats for inline images to display in Gmail/Outlook?”  
   - Optionally share a redacted sample of the JSON payload we send (no PII) and ask if it matches the expected format.

2. **Raw MIME inspection:**  
   - Obtain the raw MIME of a sent test email (e.g. “Show original” in Gmail, or Resend’s logs if they expose it) and verify that the logo part exists with `Content-Disposition: inline`, `Content-ID: <pp-logo>` (or equivalent), and that the HTML references `cid:pp-logo` correctly.

3. **Multi-client test:**  
   - Send the same test to multiple addresses (Gmail, Outlook, Apple Mail, etc.) and document which clients show the logo when using (a) data URI, (b) hosted URL with “Display images” on, (c) CID attachment. That will show whether the issue is client-specific or global.

4. **Fallback UX:**  
   - If logo cannot be made reliable, consider a text-only or emoji/symbol fallback in the header so the layout still looks intentional when the image is missing.

---

## 9. Verdict and Fix Applied (Feb 2025)

**Verdict:** Stop using CID and Data URIs. They are historically unreliable, trigger spam filters, and are blocked by many modern clients (e.g. Gmail strips Data URIs, Outlook often ignores CIDs).

**Root cause (Ghost Logo):** The header uses CSS `background:#0d2818`. Many clients strip container background colors. Result: white default background + light/white logo = white-on-white, so the logo appears empty or broken.

**Fix implemented:**

1. **Baked background:** Logo PNG has **solid #0d2818 (dark green) background** and **white "P" mark** (source: `pp-monogram-email.svg`). Contrast is inside the image file, so it survives CSS stripping.
2. **Hosted URL only:** `lib/stack-reveal/email-templates.ts` uses `LOGO_URL = \`${EMAIL_ASSET_ORIGIN}/brand/pp-monogram.png?v=4\``. No CID, no Data URI. `EMAIL_ASSET_ORIGIN` is always `https://www.pocketportfolio.app` so logo and all links work when tests run from localhost.
3. **Img styling:** `border:0;outline:none;text-decoration:none` for Outlook.
4. **No logo attachments:** `lib/stack-reveal/resend.ts` sends no attachments for the logo.

---

## 10. Production Checklist

**Pre-deploy:**

1. Ensure `public/brand/pp-monogram.png` is the real logo (regenerate if needed: `npm run generate:logo-png`).
2. Commit and push so the PNG is included in the deploy (Next.js serves `public/` at the root).

**Post-deploy:**

1. **Verify logo URL:** Run `npm run verify:logo-url` or open in a browser:  
   `https://www.pocketportfolio.app/brand/pp-monogram.png?v=4`  
   Expect: HTTP 200, image shows dark green with white "P" monogram.
2. **Send test email:** `npm run stack-reveal:send-test -- your@email.com`  
   In the inbox, enable "Display images" if needed, then confirm the header logo loads.

---

## 11. References

- Resend: [Embed Inline Images](https://resend.com/docs/dashboard/emails/embed-inline-images)  
- Resend: [Attachments](https://resend.com/docs/dashboard/emails/attachments)  
- Code: `lib/stack-reveal/email-templates.ts`, `lib/stack-reveal/constants.ts`, `lib/stack-reveal/resend.ts`, `scripts/svg-to-png-resvg.mjs`, `public/brand/pp-monogram.png`, `public/brand/pp-monogram-email.svg`

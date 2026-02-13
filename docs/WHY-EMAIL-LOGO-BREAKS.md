# Why the Stack Reveal Email Logo Breaks

## Root cause (from raw .eml, Feb 2025)

Inspection of a received email (`.eml`) showed:

- The **HTML correctly** uses `<img src="cid:logo-image">`.
- The **logo is attached** as a MIME part with the PNG in base64.
- The image part is sent with **`Content-Disposition: attachment`** and **no `Content-ID` header**.

So the client never associates the attachment with `cid:logo-image` and shows a broken image. Resend/SES was not setting `Content-ID` and `Content-Disposition: inline` when we used `path` (remote URL). We now send the logo as **base64 `content`** with `contentId` (and `content_id`) so the backend can set the MIME headers correctly. We send the logo as **base64 with contentId** so Resend sets Content-ID and inline. We use **Content-ID format `logo-image@pocketportfolio.app`** for better Gmail compatibility. No text "P" fallback (CEO requirement: professional logo only).

---

## What we know (runtime evidence)

1. **The logo URL works when requested directly.**  
   Hitting `https://www.pocketportfolio.app/api/email-logo` (with or without `?t=...`) from a browser or script returns **200**, **Content-Type: image/png**, **~1427 bytes**, and a **valid PNG**. So the server and proxy are correct.

2. **The same image works from Cloudinary.**  
   Using the Cloudinary URL directly in the email (`img src="https://res.cloudinary.com/.../pp-monogram.png"`) still produced a broken/empty image in Gmail. So the problem is not “our domain is blocked and Cloudinary would fix it.”

3. **Per-email cache-bust didn’t fix it.**  
   Each email uses a unique logo URL (`?t=<timestamp>`). So a previously cached failure for “the” logo URL is unlikely.

4. **The other codebase uses the same approach.**  
   They use a plain hosted Cloudinary URL in a standard `<img>`, no proxy, no special Resend options. They don’t have a Gmail-specific fix; if Gmail blocked or broke that URL, they’d see the same issue.

## Why the logo is breaking (most likely causes)

We never got a response from Gmail’s image proxy or saw the exact HTML/MIME the client receives, so we can’t pin it to a single cause. The plausible explanations are:

### 1. Gmail (or the client) isn’t loading the image

- **“Display images” / “Load images”** is off, so the client never requests the URL and shows a placeholder.
- **Gmail’s image proxy** requests our URL and gets a different response (e.g. 403, timeout, or HTML) than when we probe from a browser/script — e.g. different User-Agent, IP, or cookies so our app or Vercel behaves differently.
- **Sender/domain reputation** — Gmail may block or delay external images for some senders; we can’t confirm this from code alone.

### 2. The HTML or URL is changed in transit

- **Resend or an MTA** rewrites image URLs (e.g. to a tracking proxy). If that proxy then fails or strips the image, we’d see a broken logo even though our HTML is correct.
- **Quoted-printable (QP) encoding** could, in theory, break the URL if a soft line break is inserted in a bad place. Our current img line is ~102 chars (logo URL + tag), so QP will wrap it. In standard QP decoding the URL should reassemble correctly; a buggy client could still corrupt it.

### 3. Client strips or blocks the image

- Some clients block **same-domain** images in email (to avoid tracking). Our proxy is on the same domain as the “From” domain; that might trigger blocking.
- **Content-Security-Policy** or other security headers could block the image in some clients; our middleware skips `/api/*`, so our route doesn’t add CSP, but the host or CDN could.

## What we’ve ruled out

- **Broken or empty response from our proxy** — ruled out by direct requests (200, valid PNG).
- **Wrong logo URL in the HTML we send** — H8 logs show the correct URL (proxy or Cloudinary) in the built HTML.
- **“Just use Cloudinary”** — we tried; logo still didn’t render.
- **Cached failure for one fixed URL** — we tried per-email `?t=timestamp`; still broken.

## Practical takeaway

The logo breaks because **the email client (e.g. Gmail) is not showing the image** when it loads the email. We don’t get a different response from our server for that client, so the cause is either:

- **Client-side:** “Display images” off, or the client (or its proxy) blocking/altering the request or the URL, or reputation.
- **Pipeline:** Something between our send and the inbox (Resend, MTA, or encoding) changing the img or the URL so the client requests the wrong thing or gets a failure.

To go further you’d need to:

- Inspect the **raw MIME** of a received email (e.g. “Show original” in Gmail) and confirm the `<img src="...">` URL is exactly what we send and that it’s not rewritten.
- Check **Vercel function logs** when the recipient opens the email (or when Gmail’s proxy requests the logo URL) to see status code and response for that request.
- Add a **visible fallback** (e.g. “P” or “Pocket Portfolio” in the header) so when the image doesn’t load, the header still looks intentional.

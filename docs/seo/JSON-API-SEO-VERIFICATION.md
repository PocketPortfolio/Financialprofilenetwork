# JSON API page — SEO verification (artifact checklist)

Run these checks on a **Vercel Preview** URL before promoting to production after json-api layout changes.

## 1. View Page Source (no JavaScript)

1. Open `https://<preview-host>/s/<ticker>/json-api` (e.g. tickers with stable content: `spy`, `nse`).
2. **View Page Source** (not DevTools Elements).
3. Confirm:
   - Primary **textual** content (title, description, internal links) is present in HTML.
   - Structured data `<script type="application/ld+json">` is present when configured for that route.
   - A **`<noscript><pre>`** block in [`app/s/[symbol]/json-api/page.tsx`](../../app/s/[symbol]/json-api/page.tsx) exposes a **static JSON sample** when ticker API data is available at render time (supplements the client `JsonApiLivePreview` which still receives `initialHistorySample` from the server when data exists).
   - The page returns **200** and meaningful static HTML for crawlers.

## 2. Google Search Console — URL Inspection

1. Property: `https://www.pocketportfolio.app` (or staging property if used).
2. **URL Inspection** → enter full json-api URL for 2 tickers (e.g. top GSC landing URLs from Pages report).
3. Confirm **Crawl** succeeds and **Indexing** is allowed (no unexpected “Blocked” or “Soft 404”).
4. Save screenshots / export for the Growth Hub pack.

## 3. Regression guardrails

- No **hard modal** that removes JSON or replaces the main response for `Googlebot` user agent.
- Sticky UI (e.g. `JsonApiStickyPrompt`) must be **non-blocking** overlays; primary article content remains in the document.

## 4. Optional — Rich Results Test

Use [Rich Results Test](https://search.google.com/test/rich-results) on the same URLs if Dataset / FAQ schema is in scope for that template.

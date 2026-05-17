# OG Image — V2 Handover & Implementation Report

**Status:** Implemented, validated locally. Ready for deploy.
**Cache-buster:** `v=5` (forces all social platforms to re-scrape after deploy).
**Supersedes:** `OG-IMAGE-FIX-SUMMARY.md`, `OG-IMAGE-FIX-TEST-GUIDE.md`.

---

## 1. Audit — what was actually broken

We had **shipped link previews that read as "blank / corrupted"** across iOS Messages, WhatsApp, X, LinkedIn, Facebook. Three independent failures stacked:

| # | Severity | Location | Defect |
|---|---|---|---|
| 1 | CRITICAL | `app/api/og/route.tsx` | Off-brand design — indigo `#6366f1` / violet `#8b5cf6` title on a near-white `#f1f5f9 → #e2e8f0` gradient, with content confined to a tiny floating white card. Violates `CLAUDE.md` ("No Generic Fintech Blue", "Primary Accent Amber `#f59e0b`", "Terminal / Pro Reference Manual"). At thumbnail size the card disappears into a pale square — exactly the "generic poor look" reported. |
| 2 | CRITICAL | `app/layout.tsx` | `apple-touch-icon` was an **SVG** (`/brand/pp-maskable.svg`). iOS does **not** render SVG for `apple-touch-icon`, so iMessage / Safari Share Sheet fell back to a generic placeholder thumbnail. |
| 3 | HIGH | `app/blog/[slug]/page.tsx`, `app/live/page.tsx`, `app/dashboard/page.tsx` | OG fallbacks pointed to **SVGs** (`og-base.svg`, `preview-live.svg`, `preview-dashboard.svg`). Facebook, LinkedIn, iMessage and WhatsApp all silently reject SVG OG images. |
| 4 | MEDIUM | `app/api/og/route.tsx` | Stream-piped `imageResponse.body` into a fresh `Response`, which dropped `Content-Length` (chunked-encoded). WhatsApp's scraper has been observed to reject chunked OG responses. |
| 5 | MEDIUM | `app/lib/seo/meta.ts` | Missing `og:image:type` (`image/png`) and `og:image:secure_url`. Strict scrapers (LinkedIn) flag images without explicit MIME / secure URL. |
| 6 | LOW | All meta refs | `v=3` already cached on FB / X / LinkedIn — required a new `v=` to force re-scrape after redesign. |

---

## 2. Strategy

1. **Redesign `/api/og`** brand-correct + thumbnail-resilient (full-bleed dark surface, amber accent, edge-to-edge type, brand mark).
2. **Fix Apple link previews** — switch `apple-touch-icon` to PNG (`/icon-192.png`, `/icon-512.png`).
3. **Eliminate SVG OG references** everywhere (blog fallback, blog JSON-LD, live, dashboard).
4. **Header hardening** — buffer the PNG and set `Content-Length` explicitly.
5. **Metadata hardening** — add `og:image:type`, `og:image:secure_url`, keep `twitter:image:alt`.
6. **Cache-buster bump** `v=3 → v=5` so platforms re-scrape on next deploy.
7. **Local validation** before deploy (headers, byte count, PNG signature, brand colour sampling).
8. **Lint + typecheck gate** per `CLAUDE.md` operational rule before commit.

---

## 3. Implementation — files changed

| File | Change |
|---|---|
| `app/api/og/route.tsx` | Full redesign: dark `#0b0d10` surface, amber `#f59e0b` accent, brand monogram, large left-aligned title, terminal grid backdrop, host band with status dot. Buffered PNG with explicit `Content-Length`. Title length adapts (104px → 84px when long). |
| `app/layout.tsx` | `apple-touch-icon` switched from SVG to **PNG** (192×192 + 512×512). Added PNG icon variants alongside SVG. Added `og:image:secure_url` + `og:image:type` to legacy openGraph branch. |
| `app/lib/seo/meta.ts` | `siteConfig.ogImage` → `…&v=5`. `generateMetadata()` now emits `secureUrl` and `type: 'image/png'` on the OpenGraph image object. |
| `app/components/SEOHead.tsx` | Default `ogImage` → `…&v=5`. Now updates `og:image:secure_url` + `og:image:type` client-side too. |
| `app/blog/[slug]/page.tsx` | SVG fallback removed. Both the `openGraph.images` fallback and the JSON-LD `image` fallback now point to a per-post `/api/og?title=…&description=…&v=5` URL. |
| `app/live/page.tsx` | `ogImage` → `/api/og?title=Live Market Data…&v=5`. |
| `app/dashboard/page.tsx` | `ogImage` → `/api/og?title=Dashboard&description=Your Portfolio, Local-First&v=5`. |
| `app/join/page.tsx` | `ogImage` cache-buster bumped to `v=5`, description aligned to brand. |
| `app/book/sovereign-intelligence/page.tsx` | `v=5` + `secureUrl` + `type: 'image/png'`. |
| `app/book/universal-llm-import/page.tsx` | `v=5` + `secureUrl` + `type: 'image/png'`. |

---

## 4. Pre-deploy validation (executed locally on `localhost:3001`)

### Endpoint headers — verified with `curl -D -`

```
HTTP/1.1 200 OK
content-type: image/png
content-length: 60042              ← was missing/chunked before
cache-control: public, max-age=31536000, immutable
x-content-type-options: nosniff
access-control-allow-origin: *
```

### PNG validity

```
width: 1200  height: 630  bytes: 60042
PNG signature: 89 50 4E 47 0D 0A 1A 0A   ← valid
```

### Brand colour sample (in-image)

```
PP monogram tile (88,86)  → #f59e0b   ← brand Amber, exact
Surface (180,360)         → #0b0d10   ← brand --bg, exact
```

### Homepage HTML now emits

```
<link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png">
<link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png">
<meta property="og:image"            content=".../api/og?...&v=5">
<meta property="og:image:secure_url" content=".../api/og?...&v=5">
<meta property="og:image:type"       content="image/png">
<meta property="og:image:width"      content="1200">
<meta property="og:image:height"     content="630">
<meta property="og:image:alt"        content="Pocket Portfolio — Sovereign Local-First Wealth Tracker">
<meta name="twitter:card"            content="summary_large_image">
<meta name="twitter:image"           content=".../api/og?...&v=5">
```

### Gates (per `CLAUDE.md` operational rule)

```
tsc --noEmit       → exit 0 (clean)
npm run lint       → "No ESLint warnings or errors"
```

---

## 5. Deploy checklist

1. **Commit & push** the file changes above to `main`. Vercel auto-deploys.
2. **Wait for production deploy** to complete.
3. **Hit the endpoint directly** to warm/verify in prod:
   - `https://www.pocketportfolio.app/api/og?title=Pocket%20Portfolio&description=Sovereign%20Local-First%20Wealth%20Tracker&v=5`
   - Expect: 200, `content-type: image/png`, `content-length` present, brand-correct dark/amber image.
4. **Force re-scrape on each platform** (the `v=5` query is the key — old `v=3` URLs will continue to be cached by social platforms; only links containing the new URL will repreview correctly):
   - **Facebook / WhatsApp / Instagram:** [Sharing Debugger](https://developers.facebook.com/tools/debug/) → enter `https://www.pocketportfolio.app` → **Scrape Again**.
   - **X / Twitter:** [Card Validator](https://cards-dev.twitter.com/validator) → enter URL → **Preview card**.
   - **LinkedIn:** [Post Inspector](https://www.linkedin.com/post-inspector/) → enter URL → **Inspect**.
   - **iMessage / Apple:** there is no manual cache-buster; share the link in a fresh chat OR append a benign `?refresh=1` once. Apple link previews honour `apple-touch-icon` (now PNG) and `og:image` (now brand-correct).
5. **Spot-check the routes that previously emitted SVG OG**:
   - `/live`, `/dashboard`, `/blog/<any-slug>` — paste each into the FB Sharing Debugger and confirm `og:image` resolves to `/api/og?...&v=5` and renders.

---

## 6. Post-deploy verification (production)

Run the existing helper from the repo root:

```powershell
node scripts/verify-og-image.js
```

Expected output:

- `OG image endpoint is working` (200 + `image/png`)
- `OG image meta tag is correct` (contains `/api/og` and `v=` cache-buster)
- `Twitter image meta tag is correct`

Then **visually** confirm in each platform's debugger that the rendered preview shows the **dark + amber + monogram** card — not the old indigo/white.

---

## 7. Why this works (architectural note)

This stays consistent with our brand & operational doctrine:

- **Local-first sovereignty** is unaffected — the OG endpoint is a **stateless render**: input is the public title/description query, output is a deterministic PNG. No user data, no IndexedDB, no Drive. Compatible with the Sovereign Intelligence stance.
- **Brand law** is now enforced *in the artefact itself*, not just in the app shell — the link preview is the first impression and now matches the Terminal / Pro Reference Manual aesthetic with `--accent-warm` (`#f59e0b`).
- **Compatibility with strict scrapers** (WhatsApp, LinkedIn) is fixed at the protocol layer (Content-Length, og:image:type, og:image:secure_url) rather than relying on platform leniency.

---

## 8. Rollback

If the new image misbehaves on a platform we haven't tested:

1. `git revert <commit>` will restore the previous route + meta.
2. Old `v=3` URLs are still served (we did not remove the route), so previously-cached previews on social platforms continue to display — they're just the old design.
3. There is no DB migration, no destructive change, nothing to undo beyond the revert.

---

**Owner:** CTO / Systems Architect / Head of Marketing & Branding.
**Risk:** Low — pure static-render + meta change, gated by lint + typecheck.
**Blast radius:** Marketing surface only. App runtime unchanged.

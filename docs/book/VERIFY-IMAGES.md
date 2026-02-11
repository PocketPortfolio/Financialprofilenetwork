# Verifying book images

## Check that asset files exist and their dimensions

From the repo root:

```bash
npm run book:verify-assets
```

This lists:

- **docs/book/assets/chapter-headers/** — PNGs; reports width×height. `1×1` = placeholder (replace with real art).
- **docs/book/figures/** — SVGs (figures 2–5).
- **public/book-assets/** — Copied assets used by the web app.

**Current state (from last run):** All 11 chapter-header PNGs are 1×1 placeholders (70 bytes each). The four SVG figures exist and have content. The web app serves from `public/book-assets/` after `npm run book:copy-assets`.

## Why we're not using AI for these images

- **Chapter headers and figures** are static files: PNGs and SVGs in the repo. The app does not generate or alter them; it only references `/book-assets/...`.
- **Placeholders:** The PDF build (`npm run book:pdf`) creates 1×1 transparent PNGs so the PDF never shows broken images. Replace those files in `docs/book/assets/chapter-headers/` with your final art, then run `npm run book:copy-assets` (or rely on `npm run build`, which runs it).
- **Optional later:** You could add a step (e.g. script or CI) that uses an image API or AI to generate placeholder or final art; that would be separate from the current book page, which only displays whatever files are in `public/book-assets/`.

## Red box / content not showing

With **rehype-raw** enabled, the book page was hitting an error (red ErrorBoundary box) and content/images did not show. With **rehype-raw** disabled, the page renders without the red box, but raw HTML in the manuscript (callouts, `<div class="figure-hero">`, raw `<table>`) is escaped as text. Fixing that will require either making the rehype pipeline and custom components safe for that HTML or converting those blocks to non-raw markup so rehype-raw is not required.

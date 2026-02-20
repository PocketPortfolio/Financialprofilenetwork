#!/usr/bin/env node
'use strict';
/**
 * Verify book page and image assets are reachable (no browser required).
 * Usage: BASE_URL=http://localhost:3001 node scripts/verify-book-images.js
 */
const base = process.env.BASE_URL || 'http://127.0.0.1:3001';

async function get(url) {
  const res = await fetch(url, { redirect: 'follow' });
  return { url, status: res.status, ok: res.ok };
}

async function main() {
  const checks = [];
  const baseUrl = (p) => base + p;

  // Both book pages
  for (const slug of ['universal-llm-import', 'sovereign-intelligence']) {
    const pageRes = await fetch(baseUrl(`/book/${slug}`), { redirect: 'follow' });
    const html = await pageRes.text();
    checks.push({ name: `page /book/${slug}`, status: pageRes.status, ok: pageRes.ok });
    if (slug === 'universal-llm-import') {
      checks.push({
        name: 'universal-llm-import contains figure refs',
        ok: /figures\/figure-\d+-.*\.svg/.test(html),
      });
    } else {
      checks.push({
        name: 'sovereign-intelligence contains si-figure refs',
        ok: /figures\/si-figure-\d+-.*\.svg/.test(html),
      });
    }
  }

  // Covers and figures (both books)
  const assets = [
    '/book-assets/assets/covers/sovereign-intelligence-cover.svg',
    '/book-assets/assets/covers/universal-llm-import-cover.svg',
    '/book-assets/figures/figure-02-local-first-flow.svg',
    '/book-assets/figures/si-figure-01-data-chasm.svg',
    '/book-assets/assets/chapter-headers/chapter-01-header.svg',
  ];
  for (const p of assets) {
    const r = await get(baseUrl(p));
    checks.push({ name: p, status: r.status, ok: r.ok });
  }

  const failed = checks.filter((c) => !c.ok);
  if (failed.length) {
    console.error('Failed checks:', failed);
    process.exit(1);
  }
  console.log('All book image checks passed:', checks.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

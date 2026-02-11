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
  const pageUrl = `${base}/book/universal-llm-import`;
  const pageRes = await fetch(pageUrl, { redirect: 'follow' });
  const html = await pageRes.text();

  checks.push({ name: 'book page', status: pageRes.status, ok: pageRes.ok });
  checks.push({
    name: 'page contains chapter SVG ref',
    ok: /chapter-headers\/chapter-\d+-header\.svg/.test(html),
  });
  checks.push({
    name: 'page contains figures SVG ref',
    ok: /figures\/figure-\d+-.*\.svg/.test(html),
  });

  const assets = [
    '/book-assets/assets/chapter-headers/chapter-01-header.svg',
    '/book-assets/figures/figure-02-local-first-flow.svg',
  ];
  for (const path of assets) {
    const r = await get(base + path);
    checks.push({ name: path, status: r.status, ok: r.ok });
  }

  const failed = checks.filter((c) => !c.ok);
  if (failed.length) {
    console.error('Failed checks:', failed);
    process.exit(1);
  }
  console.log('All checks passed:', checks.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Smoke-check key B2B/B2C routes return 200 (dev server on :3001).
 * Usage: node scripts/audit-surface-links.mjs
 */
const POCKET = 'http://localhost:3001';
/** Node on Windows may not resolve open.localhost — use Host header against localhost. */
const OPEN_FETCH = (path, init = {}) =>
  fetch(`${POCKET}${path}`, {
    ...init,
    headers: { ...init.headers, Host: 'open.localhost:3001' },
  });

const pocketPaths = ['/', '/blog', '/for/advisors', '/architecture', '/designchallenge'];
const openPaths = [
  '/',
  '/architecture',
  '/designchallenge',
  '/blog',
  '/tier1designpartner',
  '/learn/sovereign-stack',
];
const openRedirects = ['/features/google-drive-sync', '/dashboard'];

async function check(label, url, expectRedirect) {
  try {
    const res = await fetch(url, { redirect: expectRedirect ? 'manual' : 'follow' });
    const ok = expectRedirect
      ? res.status >= 300 && res.status < 400
      : res.status >= 200 && res.status < 400;
    console.log(`${ok ? '✓' : '✗'} ${label} ${res.status} ${url}`);
    return ok;
  } catch (e) {
    console.log(`✗ ${label} ERR ${url} — ${e.message}`);
    return false;
  }
}

async function main() {
  let pass = 0;
  let total = 0;
  for (const p of pocketPaths) {
    total++;
    if (await check('Pocket', `${POCKET}${p}`, false)) pass++;
  }
  for (const p of openPaths) {
    total++;
    try {
      const res = await OPEN_FETCH(p);
      const ok = res.status >= 200 && res.status < 400;
      console.log(`${ok ? '✓' : '✗'} Open ${res.status} ${p} (Host: open.localhost)`);
      if (ok) pass++;
    } catch (e) {
      console.log(`✗ Open ERR ${p} — ${e.message}`);
    }
  }
  for (const p of openRedirects) {
    total++;
    try {
      const res = await OPEN_FETCH(p, { redirect: 'manual' });
      const ok = res.status >= 300 && res.status < 400;
      console.log(`${ok ? '✓' : '✗'} Open→Pocket redirect ${res.status} ${p}`);
      if (ok) pass++;
    } catch (e) {
      console.log(`✗ Open→Pocket redirect ERR ${p}`);
    }
    total++;
  }
  const asset = await OPEN_FETCH('/book-assets/figures/si-figure-02-hybrid-architecture.svg');
  total++;
  const assetOk = asset.ok;
  console.log(`${assetOk ? '✓' : '✗'} Open static asset ${asset.status}`);
  if (assetOk) pass++;

  console.log(`\n${pass}/${total} checks passed`);
  process.exit(pass === total ? 0 : 1);
}

main();

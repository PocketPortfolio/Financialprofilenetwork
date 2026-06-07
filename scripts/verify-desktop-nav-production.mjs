/**
 * Production-readiness probe for CMD-UI-NAV-2026-06-07 desktop rail.
 * Run while dev server is up: node scripts/verify-desktop-nav-production.mjs
 */
import puppeteer from 'puppeteer';
import { existsSync } from 'fs';
import { join } from 'path';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001';
const APP_ROOT = join(process.cwd(), 'app');

const EXPECTED_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Holdings', href: '/positions' },
  { label: 'Watchlist', href: '/watchlist' },
  { label: 'Import CSV', action: 'import-modal' },
  { label: 'Import', href: '/import' },
  { label: 'Live Market Data', href: '/live' },
  { label: 'Tax Converters', href: '/tools' },
  { label: 'JSON API Directory', href: '/s/directory' },
  { label: 'Settings', href: '/settings' },
  { label: 'Support', action: 'support-modal' },
  { label: 'Developer Utility', href: '/sponsor' },
];

function routeExists(href) {
  if (href.startsWith('/admin/')) {
    return existsSync(join(APP_ROOT, 'admin', href.replace('/admin/', ''), 'page.tsx'));
  }
  if (href === '/s/directory') {
    return existsSync(join(APP_ROOT, 's', 'directory', 'page.tsx'));
  }
  return existsSync(join(APP_ROOT, href.replace(/^\//, ''), 'page.tsx'));
}

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.setCacheEnabled(false);

await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle2', timeout: 90000 });
await page.evaluate(() => {
  localStorage.setItem('pp-desktop-nav-open', 'true');
  for (const id of ['data', 'tools', 'account', 'admin']) {
    sessionStorage.setItem(`pp-desktop-nav-section-${id}`, 'true');
  }
});
await page.reload({ waitUntil: 'networkidle2', timeout: 90000 });
await page.waitForSelector('.pp-dashboard-shell', { timeout: 30000 });

const layout = await page.evaluate(() => {
  const html = document.documentElement;
  const body = document.body;
  const main = document.querySelector('.pp-dashboard-main');
  const row = document.querySelector('.pp-dashboard-shell-row');
  const scrollers = [];
  const walk = (el) => {
    if (!(el instanceof HTMLElement)) return;
    const oy = getComputedStyle(el).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
      scrollers.push({ tag: el.tagName.toLowerCase(), className: el.className.slice(0, 60) });
    }
    for (const child of el.children) walk(child);
  };
  walk(document.documentElement);
  return {
    htmlOverflow: getComputedStyle(html).overflowY,
    bodyOverflow: getComputedStyle(body).overflowY,
    htmlScrolls: html.scrollHeight > html.clientHeight + 1,
    bodyScrolls: body.scrollHeight > body.clientHeight + 1,
    rowHeight: row?.clientHeight ?? 0,
    mainHeight: main?.clientHeight ?? 0,
    scrollers,
  };
});

const navLinks = await page.evaluate(() => {
  const nav = document.querySelector('aside[aria-label="Desktop navigation"] nav');
  if (!nav) return { links: [], buttons: [] };
  return {
    links: [...nav.querySelectorAll('a')].map((a) => ({
      label: a.textContent?.trim() ?? '',
      href: a.getAttribute('href') ?? '',
    })),
    buttons: [...nav.querySelectorAll('button')].map((b) => ({
      label: b.textContent?.trim() ?? '',
    })),
  };
});

const httpChecks = [];
for (const expected of EXPECTED_LINKS) {
  if (expected.href) {
    const res = await page.goto(`${BASE}${expected.href}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    httpChecks.push({ href: expected.href, status: res?.status() ?? 0, routeFile: routeExists(expected.href) });
  }
}

const failures = [];

if (layout.htmlOverflow !== 'hidden' || layout.bodyOverflow !== 'hidden') {
  failures.push('document scroll lock failed (html/body must be overflow:hidden)');
}
if (layout.htmlScrolls || layout.bodyScrolls) {
  failures.push('document still scrolls (double scrollbar root cause)');
}
if (layout.rowHeight < 200) {
  failures.push(`shell row collapsed (${layout.rowHeight}px) — nav will not stay fixed`);
}
if (layout.mainHeight < 200) {
  failures.push(`main viewport collapsed (${layout.mainHeight}px)`);
}
if (layout.scrollers.length > 1) {
  failures.push(`multiple scroll containers: ${JSON.stringify(layout.scrollers)}`);
}
if (layout.scrollers.length === 0) {
  failures.push('main viewport is not scrollable — dashboard content may be clipped');
}

for (const expected of EXPECTED_LINKS) {
  if (expected.href) {
    const found = navLinks.links.find((l) => l.href === expected.href);
    if (!found) failures.push(`missing nav link href ${expected.href} (${expected.label})`);
  } else if (expected.action) {
    const found = navLinks.buttons.some((b) => b.label.includes(expected.label));
    if (!found) failures.push(`missing nav action ${expected.label}`);
  }
}

for (const check of httpChecks) {
  if (!check.routeFile) failures.push(`route file missing for ${check.href}`);
  if (check.status >= 400) failures.push(`${check.href} returned HTTP ${check.status}`);
}

console.log(JSON.stringify({ layout, navLinks, httpChecks, failures }, null, 2));
await browser.close();

if (failures.length > 0) {
  console.error('\nFAILED:', failures.join('\n'));
  process.exit(1);
}

console.log('\nPASSED: desktop nav production readiness probe');

/**
 * Dashboard onboarding tour probe (post CMD-UI-NAV + tutorial realignment).
 * Run while server is up: node scripts/verify-dashboard-tour.mjs
 */
import puppeteer from 'puppeteer';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

const failures = [];

async function runViewport(width, label) {
  await page.setViewport({ width, height: 900 });
  await page.goto(`${BASE}/dashboard?forceTour=true`, { waitUntil: 'networkidle2', timeout: 90000 });

  await page.waitForSelector('.driver-popover', { timeout: 45000 });

  const popover = await page.evaluate(() => {
    const title = document.querySelector('.driver-popover-title')?.textContent?.trim() ?? '';
    const desc = document.querySelector('.driver-popover-description')?.textContent?.trim() ?? '';
    return { title, desc };
  });

  if (!popover.title.includes('terminal header')) {
    failures.push(`${label}: first step title unexpected: ${popover.title}`);
  }
  if (/Pulitzer|Morning Brief/i.test(`${popover.title} ${popover.desc}`)) {
    failures.push(`${label}: deprecated Client Brief copy detected`);
  }

  const hooks = await page.evaluate((isDesktop) => {
    const q = (sel) => !!document.querySelector(sel);
    return {
      header: q('[data-tour="sovereign-header"]'),
      toggle: q('[data-tour="nav-menu-toggle"]'),
      rail: q('[data-tour="desktop-nav-rail"]'),
      tabBar: q('[data-tour="mobile-tab-bar"]'),
      importDeck: q('[data-tour="data-input-deck"], #add-trade'),
      expectedRail: isDesktop,
      expectedTabBar: !isDesktop,
    };
  }, width >= 768);

  if (!hooks.header || !hooks.toggle || !hooks.importDeck) {
    failures.push(`${label}: missing core tour hooks ${JSON.stringify(hooks)}`);
  }
  if (hooks.expectedRail && !hooks.rail) {
    failures.push(`${label}: desktop rail hook missing`);
  }
  if (hooks.expectedTabBar && !hooks.tabBar) {
    failures.push(`${label}: mobile tab bar hook missing`);
  }
}

await runViewport(1280, 'desktop');
await runViewport(390, 'mobile');

console.log(JSON.stringify({ failures }, null, 2));
await browser.close();

if (failures.length > 0) {
  console.error('\nFAILED:', failures.join('\n'));
  process.exit(1);
}

console.log('\nPASSED: dashboard tour probe');

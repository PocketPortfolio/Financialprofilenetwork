#!/usr/bin/env node
/**
 * Capture live /dashboard at retina scale for retail terminal plate.
 * Out: docs/seed/pocket-design-plates/pocket-portal-terminal-hd-v4.png
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs/seed/pocket-design-plates/pocket-portal-terminal-hd-v4.png');
const URL = process.env.PLATE_URL || 'http://localhost:3001/dashboard';
const W = Number(process.env.PLATE_W || 1920);
const H = Number(process.env.PLATE_H || 1080);
const SCALE = Number(process.env.PLATE_SCALE || 2);

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: SCALE,
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.waitForTimeout(2000);
  // Kill onboarding / coachmarks that pollute marketing plates
  for (const label of ['Skip', 'Close', 'Got it', 'Dismiss', 'Next']) {
    const btn = page.getByRole('button', { name: label }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(400);
    }
  }
  // Escape any remaining modal/tour
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(800);
  // Prefer main app shell if present
  const clipTarget = page.locator('main, [data-testid="dashboard"], body').first();
  await clipTarget.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {});
  await page.screenshot({
    path: OUT,
    type: 'png',
    fullPage: false,
  });
  await browser.close();
  const { default: sharp } = await import('sharp');
  const meta = await sharp(OUT).metadata();
  console.log(`wrote ${OUT}`);
  console.log(`size ${meta.width}x${meta.height}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Phase 2 prep — Pocket B2C surface smoke (localhost dev host).
 * Verifies operational continuity on the consumer terminal during hardening.
 */
import { test, expect } from '@playwright/test';

test.describe('Pocket B2C surface smoke', () => {
  test('home page loads with Pocket identity', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
    // Pocket landing should not 404; title or hero present
    await expect(page).toHaveTitle(/Pocket Portfolio/i);
  });

  test('advisor funnel route is reachable on Pocket host', async ({ page }) => {
    const res = await page.goto('/for/advisors');
    expect(res?.status()).toBe(200);
  });

  test('tools index is Pocket-only (200 on localhost)', async ({ page }) => {
    const res = await page.goto('/tools');
    expect(res?.status()).toBe(200);
  });

  test('B2B architecture path redirects toward Open canonical (middleware)', async ({
    page,
  }) => {
    const res = await page.goto('/architecture', { waitUntil: 'commit' });
    // Local dev: 301/307/308 to open.localhost or production Open host
    expect(res?.status()).toBeGreaterThanOrEqual(300);
    expect(res?.status()).toBeLessThan(400);
    const location = res?.headers()['location'] ?? '';
    expect(location).toMatch(/open\.(localhost|portfolio)/i);
  });
});

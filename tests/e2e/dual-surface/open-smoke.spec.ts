/**
 * Phase 2 prep — Open Portfolio B2B surface smoke (open.localhost dev host).
 * Run under the dual-surface-open Playwright project.
 */
import { test, expect } from '@playwright/test';

test.describe('Open B2B surface smoke', () => {
  test('home page loads on Open host', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('architecture page is native to Open surface', async ({ page }) => {
    const res = await page.goto('/architecture');
    expect(res?.status()).toBe(200);
  });

  test('design challenge route resolves', async ({ page }) => {
    const res = await page.goto('/designchallenge');
    expect(res?.status()).toBe(200);
  });

  test('consumer dashboard redirects to Pocket canonical', async ({ page }) => {
    const res = await page.goto('/dashboard', { waitUntil: 'commit' });
    expect(res?.status()).toBeGreaterThanOrEqual(300);
    expect(res?.status()).toBeLessThan(400);
    const location = res?.headers()['location'] ?? '';
    expect(location).toMatch(/pocketportfolio\.app|localhost:3001/i);
  });

  test('unknown consumer path returns B2B not-found (not Pocket leak)', async ({ page }) => {
    const res = await page.goto('/this-route-should-not-exist-on-open', {
      waitUntil: 'domcontentloaded',
    });
    expect(res?.status()).toBe(404);
  });
});

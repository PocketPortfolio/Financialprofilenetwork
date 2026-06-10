/**
 * CMD-UI-SPONSOR-2026-06-10 — Sponsor route Pocket host boundary checks.
 * Project: dual-surface-pocket (localhost:3001)
 */
import { test, expect } from '@playwright/test';

test.describe('Sponsor route — Pocket B2C host boundary', () => {
  test('Pocket host serves sponsor without Open-only 404', async ({ page }) => {
    const res = await page.goto('/sponsor');
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('tab', { name: 'For investors' })).toBeVisible();
  });

  test('Pocket host does not use Open brand header chrome', async ({ page }) => {
    await page.goto('/sponsor');
    await expect(page.locator('header.open-brand-header')).toHaveCount(0);
  });
});

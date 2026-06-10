/**
 * CMD-UI-SPONSOR-2026-06-10 — Sponsor persona tabs E2E (Open B2B surface).
 * Project: dual-surface-open (open.localhost:3001)
 */
import { test, expect } from '@playwright/test';

test.describe('Sponsor persona tabs — Open B2B surface', () => {
  test('loads /sponsor with investors tab active by default', async ({ page }) => {
    const res = await page.goto('/sponsor');
    expect(res?.status()).toBe(200);

    await expect(page.getByRole('tab', { name: 'For investors' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.locator('#sponsor-panel-investors')).toBeVisible();
    await expect(page.getByText('Unlimited API calls forever')).toBeVisible();
    await expect(page.getByRole('button', { name: /Join Monthly/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Join Annual/i })).toBeVisible();
  });

  test('does not show removed WebOne block or implementation meta-copy', async ({ page }) => {
    await page.goto('/sponsor');
    await expect(page.getByText('Discovery Partner')).toHaveCount(0);
    await expect(page.getByText(/mixed-tier carousel/i)).toHaveCount(0);
  });

  test('lazy-mounts developers pane only after tab click', async ({ page }) => {
    await page.goto('/sponsor');
    await expect(page.locator('#sponsor-panel-developers')).toHaveCount(0);

    await page.getByRole('tab', { name: 'For developers' }).click();
    await expect(page.locator('#sponsor-panel-developers')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Universal Data Engine' })).toBeVisible();
    await expect(page.getByText('Unlimited API Access:')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subscribe Monthly ($5/mo)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subscribe Annual ($200/yr)' })).toBeVisible();
  });

  test('lazy-mounts institutions pane only after tab click', async ({ page }) => {
    await page.goto('/sponsor');
    await expect(page.locator('#sponsor-panel-institutions')).toHaveCount(0);

    await page.getByRole('tab', { name: 'For institutions' }).click();
    await expect(page.locator('#sponsor-panel-institutions')).toBeVisible();
    await expect(page.getByText('White Label Features:')).toBeVisible();
    await expect(page.getByText('Corporate Perks:')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Book a Discovery Call' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subscribe Monthly ($100/mo)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subscribe Annual ($1,000/yr)' })).toBeVisible();
  });

  test('?tier=corporate deep link opens institutions pane on load', async ({ page }) => {
    await page.goto('/sponsor?tier=corporate');
    await expect(page.getByRole('tab', { name: 'For institutions' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.locator('#sponsor-panel-institutions')).toBeVisible();
    await expect(page.getByText('Corporate Ecosystem')).toBeVisible();
  });

  test('?tier=founder deep link opens investors pane on load', async ({ page }) => {
    await page.goto('/sponsor?tier=founder');
    await expect(page.getByRole('tab', { name: 'For investors' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByText('Permanent "Founder" badge')).toBeVisible();
  });

  test('?tier=developer-utility deep link opens developers pane on load', async ({ page }) => {
    await page.goto('/sponsor?tier=developer-utility');
    await expect(page.getByRole('tab', { name: 'For developers' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.locator('#sponsor-panel-developers')).toBeVisible();
    await expect(page.getByText('Developer Benefits:')).toBeVisible();
  });

  test('uses Open Portfolio chrome on Open host', async ({ page }) => {
    await page.goto('/sponsor');
    await expect(page.locator('header.open-brand-header')).toBeVisible();
    await expect(page.locator('header.open-brand-header')).toContainText(/Open Portfolio/i);
  });
});

import { test, expect } from '@playwright/test';

test('renders health card on dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Price Pipeline Health')).toBeVisible();
  await expect(page.getByText('YAHOO')).toBeVisible();
});

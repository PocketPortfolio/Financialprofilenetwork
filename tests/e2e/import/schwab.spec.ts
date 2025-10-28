import { test, expect } from '@playwright/test';

test('Schwab → successful import', async ({ page }) => {
  await page.goto('/dashboard');
  await page.setInputFiles('input[type="file"]', 'tests/fixtures/csv/schwab.csv');
  await page.getByRole('button', { name: /preview/i }).click();
  await expect(page.getByText(/Broker:\s*schwab/i)).toBeVisible();
  await page.getByRole('button', { name: /confirm import/i }).click();
  await expect(page.getByText(/Imported \d+ trades from schwab/i)).toBeVisible();
});







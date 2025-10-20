import { test, expect } from '@playwright/test';

test('IBKR Flex → successful import', async ({ page }) => {
  await page.goto('/dashboard');
  await page.setInputFiles('input[type="file"]', 'tests/fixtures/csv/ibkr_flex.csv');
  await page.getByRole('button', { name: /preview/i }).click();
  await expect(page.getByText(/Broker:\s*ibkr_flex/i)).toBeVisible();
  await page.getByRole('button', { name: /confirm import/i }).click();
  await expect(page.getByText(/Imported \d+ trades from ibkr_flex/i)).toBeVisible();
});



import { test, expect } from '@playwright/test';

test('Trading212 → successful import', async ({ page }) => {
  await page.goto('/dashboard');
  await page.setInputFiles('input[type="file"]', 'tests/fixtures/csv/trading212.csv');
  await page.getByRole('button', { name: /preview/i }).click();
  await expect(page.getByText(/Broker:\s*trading212/i)).toBeVisible();
  await page.getByRole('button', { name: /confirm import/i }).click();
  await expect(page.getByText(/Imported \d+ trades from trading212/i)).toBeVisible();
});







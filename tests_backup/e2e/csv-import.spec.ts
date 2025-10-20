import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('CSV Import', () => {
  test('should navigate to CSV playground', async ({ page }) => {
    await page.goto('/app/static/openbrokercsv');
    
    await expect(page.getByText('CSV', { exact: false })).toBeVisible();
  });

  test('should parse pasted CSV content', async ({ page }) => {
    await page.goto('/app');
    
    // Assuming CSV playground is integrated
    const csvInput = page.locator('textarea[aria-label*="CSV"]').first();
    if (await csvInput.isVisible()) {
      const sampleCsv = `Date,Symbol,Quantity,Price
2024-01-15,AAPL,10,150.25`;
      
      await csvInput.fill(sampleCsv);
      await page.getByRole('button', { name: /parse/i }).click();
      
      await expect(page.getByText('Parse Results')).toBeVisible();
      await expect(page.getByText('AAPL')).toBeVisible();
    }
  });

  test('should show errors for invalid CSV', async ({ page }) => {
    await page.goto('/app');
    
    const csvInput = page.locator('textarea[aria-label*="CSV"]').first();
    if (await csvInput.isVisible()) {
      const invalidCsv = `Date,Symbol
2024-01-15,AAPL`;
      
      await csvInput.fill(invalidCsv);
      await page.getByRole('button', { name: /parse/i }).click();
      
      await expect(page.getByText('Error', { exact: false })).toBeVisible();
    }
  });

  test('should detect duplicate trades', async ({ page }) => {
    await page.goto('/app');
    
    const csvInput = page.locator('textarea[aria-label*="CSV"]').first();
    if (await csvInput.isVisible()) {
      const duplicateCsv = `Date,Symbol,Quantity,Price
2024-01-15,AAPL,10,150.25
2024-01-15,AAPL,10,150.25`;
      
      await csvInput.fill(duplicateCsv);
      await page.getByRole('button', { name: /parse/i }).click();
      
      await expect(page.getByText('duplicate', { exact: false })).toBeVisible();
    }
  });
});


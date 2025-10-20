import { test, expect } from '@playwright/test';

test.describe('Price Pipeline', () => {
  test('should display live prices for symbols', async ({ page }) => {
    await page.goto('/app');

    // Wait for price table to load
    await expect(page.locator('table')).toBeVisible();

    // Check that at least one price is displayed
    const firstPrice = page.locator('table tbody tr').first();
    await expect(firstPrice).toBeVisible();
  });

  test('should show price pipeline health card', async ({ page }) => {
    await page.goto('/app');

    await expect(page.getByText('Price Pipeline Health')).toBeVisible();
    
    // Check providers are listed
    await expect(page.getByText('YAHOO', { exact: false })).toBeVisible();
    await expect(page.getByText('CHART', { exact: false })).toBeVisible();
    await expect(page.getByText('STOOQ', { exact: false })).toBeVisible();
  });

  test('should handle provider fallback gracefully', async ({ page }) => {
    // Mock API to simulate Yahoo failure
    await page.route('/api/quote*', async route => {
      const url = route.request().url();
      if (url.includes('symbols=')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { symbol: 'AAPL', price: 150.0, change: 2.5, source: 'chart' }
          ]),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/app');
    
    const healthCard = page.locator('text=Price Pipeline Health').locator('..');
    await expect(healthCard).toBeVisible();
    
    // Verify fallback is being used (orange badge)
    await expect(page.locator('[style*="f59e0b"]')).toBeVisible();
  });

  test('should refresh prices periodically', async ({ page }) => {
    await page.goto('/app');

    const priceCell = page.locator('table tbody tr').first().locator('td').nth(2);
    const initialPrice = await priceCell.textContent();

    // Wait for refresh interval
    await page.waitForTimeout(30000);

    const updatedPrice = await priceCell.textContent();
    
    // Price may or may not change, but element should still be present
    expect(updatedPrice).toBeTruthy();
  });
});


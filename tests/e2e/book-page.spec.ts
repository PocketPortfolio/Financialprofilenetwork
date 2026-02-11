import { test, expect } from '@playwright/test';

test.describe('Book page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/book/universal-llm-import');
  });

  test('loads and shows book content', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByText('Part I: The Case for Universal Import').first()).toBeVisible();
  });

  test('chapter header images render (SVG)', async ({ page }) => {
    const chapterImg = page.locator('img[src*="chapter-headers"][src*=".svg"]').first();
    await chapterImg.waitFor({ state: 'visible', timeout: 15000 });
    await expect(chapterImg).toBeVisible();
    const box = await chapterImg.boundingBox();
    expect(box).toBeTruthy();
    expect((box?.width ?? 0)).toBeGreaterThan(50);
    expect((box?.height ?? 0)).toBeGreaterThan(20);
  });

  test('figure SVGs render', async ({ page }) => {
    const figureImg = page.locator('img[src*="figures/"][src*=".svg"]').first();
    await figureImg.waitFor({ state: 'visible', timeout: 15000 });
    await expect(figureImg).toBeVisible();
    const box = await figureImg.boundingBox();
    expect(box).toBeTruthy();
    expect((box?.width ?? 0)).toBeGreaterThan(50);
    expect((box?.height ?? 0)).toBeGreaterThan(20);
  });
});

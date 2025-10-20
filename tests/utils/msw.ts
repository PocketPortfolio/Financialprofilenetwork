import { Page } from '@playwright/test';

/**
 * MSW helper for Playwright tests
 * Use this to enable Mock Service Worker in tests
 */
export async function setupMSW(page: Page, handlers: any[] = []) {
  await page.addInitScript(() => {
    (window as any).__enableMSW__ = true;
  });
  
  // Additional MSW setup can go here
  return page;
}


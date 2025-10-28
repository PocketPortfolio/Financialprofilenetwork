import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  globalSetup: './tests/global-setup.ts',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], timezoneId: 'UTC' }
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'], timezoneId: 'UTC' }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], timezoneId: 'UTC' }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], timezoneId: 'UTC' }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
});








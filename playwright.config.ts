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
    // Phase 2 diligence: dual-host regression (dev: open.localhost vs localhost)
    {
      name: 'dual-surface-pocket',
      testMatch: /dual-surface\/pocket.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PLAYWRIGHT_POCKET_URL || 'http://localhost:3001',
        timezoneId: 'UTC',
      },
    },
    {
      name: 'dual-surface-open',
      testMatch: /dual-surface\/open.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PLAYWRIGHT_OPEN_URL || 'http://open.localhost:3001',
        timezoneId: 'UTC',
      },
    },
    {
      name: 'chromium-desktop',
      testMatch: /^(?!.*dual-surface\/).+\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], timezoneId: 'UTC' }
    },
    {
      name: 'chromium-mobile',
      testMatch: /^(?!.*dual-surface\/).+\.spec\.ts$/,
      use: { ...devices['Pixel 5'], timezoneId: 'UTC' }
    },
    {
      name: 'firefox',
      testMatch: /^(?!.*dual-surface\/).+\.spec\.ts$/,
      use: { ...devices['Desktop Firefox'], timezoneId: 'UTC' }
    },
    {
      name: 'webkit',
      testMatch: /^(?!.*dual-surface\/).+\.spec\.ts$/,
      use: { ...devices['Desktop Safari'], timezoneId: 'UTC' }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: (process.env.CI ? 180 : 120) * 1000
  }
});








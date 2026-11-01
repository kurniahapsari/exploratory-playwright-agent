import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Production site: one retry absorbs its occasional error page; retried passes are reported as flaky.
  retries: process.env.CI ? 2 : 1,
  // kumparan's WAF answers bursts of parallel requests with HTTP 403.
  workers: Number(process.env.WORKERS ?? 2),
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    testIdAttribute: 'data-qa-id',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
  },
  projects: [
    {
      name: 'desktop-chrome',
      testIgnore: /mobile\//,
      use: { ...devices['Desktop Chrome'], baseURL: 'https://kumparan.com' },
    },
    {
      name: 'mobile-chrome',
      testIgnore: /desktop\//,
      use: { ...devices['Pixel 7'], baseURL: 'https://m.kumparan.com' },
    },
  ],
});

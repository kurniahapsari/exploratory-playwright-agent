import { test as base, expect } from '@playwright/test';

/**
 * Shared environment for agent-generated tests: ads and analytics are blocked (they shift the layout
 * and intercept clicks on kumparan), and the over-the-page ad modal is closed if it still appears.
 * Every test imports `test`/`expect` from here instead of '@playwright/test'.
 */
const THIRD_PARTY_NOISE =
  /doubleclick\.net|googlesyndication\.com|googletagservices\.com|googletagmanager\.com|google-analytics\.com|adservice\.google\.|imasdk\.googleapis\.com|amazon-adsystem\.com|criteo\.(com|net)|taboola\.com|outbrain\.com|scorecardresearch\.com|chartbeat\.(com|net)|hotjar\.com|clarity\.ms|connect\.facebook\.net|onesignal\.com/;

export const test = base.extend<{ isMobile: boolean }>({
  context: async ({ context }, use) => {
    await context.route(THIRD_PARTY_NOISE, (route) => route.abort('blockedbyclient'));
    await use(context);
  },
  page: async ({ page }, use) => {
    await page.addLocatorHandler(page.getByTestId('otp-ads-close-modal-btn'), (close) => close.click());
    await use(page);
  },
});

export { expect };

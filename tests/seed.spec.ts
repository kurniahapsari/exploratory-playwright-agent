import { expect, test } from './fixtures';

// Seed for the Playwright agents: opens the project's site (kumparan.com or m.kumparan.com)
// as a guest, with ads blocked, and waits until the header has rendered.
test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('hd-logo').first()).toBeVisible();
  });
});

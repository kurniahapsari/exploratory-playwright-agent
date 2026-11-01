// spec: specs/kumparan-desktop.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Home', () => {
  test('TC-HOME-002 Desktop channel bar: clicking "Bisnis" opens /channel/bisnis with stories', async ({ page }) => {
    // 1. Navigate to `/` and locate the channel bar
    await page.goto('/');
    const channelBar = page.getByTestId('main-menu');
    await expect(channelBar).toBeVisible();

    // 2. Locate the Bisnis link (channel links have no data-qa-id and are named "Loading" until the menu hydrates)
    const bisnisLink = channelBar.getByRole('link', { name: 'Bisnis', exact: true });
    await expect(bisnisLink).toBeVisible();
    await expect(bisnisLink).toHaveAttribute('href', '/channel/bisnis');

    // 3. Click the Bisnis link
    await bisnisLink.click();
    await expect(page).toHaveURL('/channel/bisnis');
    await expect(page).toHaveTitle('Berita Bisnis Hari Ini Terkini - kumparan');

    // 4. Check the channel heading.
    // The `<h1 data-qa-id="channel-title">` is now an SEO-only heading: it is rendered with `font-size: 0` (0px tall),
    // so Playwright treats it as hidden and `toBeVisible()` can never pass (the channel is shown to users through the
    // "kumparanBISNIS" header logo instead). Assert that it is attached and carries the channel name, the same way the
    // mobile plan handles its SEO-only H1s.
    const channelTitle = page.getByTestId('channel-title');
    await expect(channelTitle).toBeAttached();
    await expect(page.getByRole('heading', { level: 1, includeHidden: true })).toHaveCount(1);
    await expect(channelTitle).toHaveText('Bisnis');

    // 5. Check the channel stories
    const headlineCards = page.getByTestId('headline-card');
    await expect.poll(() => headlineCards.count()).toBeGreaterThanOrEqual(1);
    const firstHeadlineTitle = headlineCards.first().getByTestId('title');
    await expect(firstHeadlineTitle).toBeVisible();
    await expect(firstHeadlineTitle).toHaveText(/\S/);
    await expect.poll(() => page.getByTestId('trending-story-item').count()).toBeGreaterThanOrEqual(1);
  });
});

// spec: specs/kumparan-mobile.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Home (mobile only)', () => {
  test('TC-HOME-004 The header navigation strip Trending item opens /trending with stories (no bottom navigation exists on the mobile site)', async ({ page }) => {
    // 1. Navigate to `/`, wait for the first headline card and locate the Trending item of the navigation strip
    // (requested as a bottom navigation item, but m.kumparan.com has no bottom navigation for a guest)
    await page.goto('/');
    await expect(page.getByTestId('headline-card').first().getByTestId('title')).toBeVisible();
    const trendingNav = page.getByTestId('nb-trending');
    await expect(trendingNav).toHaveCount(1);
    await expect(trendingNav).toBeVisible();
    await expect(trendingNav).toHaveText('Trending');
    await expect(trendingNav).toHaveAttribute('href', '/trending');
    await expect(page).toHaveURL('/');

    // 2. Click the Trending item
    await trendingNav.click();
    await expect(page).toHaveURL('/trending');
    await expect(page).toHaveTitle('Kumpulan Berita Trending dalam Minggu Ini - kumparan');
    // The H1 is `display: none` on mobile, so it is asserted by text only (never toBeVisible / getByRole)
    const heading = page.locator('h1');
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveText('Trending');

    // 3. Wait for the list and check the container
    const items = page.getByTestId('news-item');
    await expect(items.first().getByTestId('title')).toBeVisible();
    const storiesCard = page.getByTestId('trending-stories-card');
    await expect(storiesCard).toHaveCount(1);
    await expect(storiesCard).toBeVisible();
    await expect.poll(() => items.count()).toBeGreaterThanOrEqual(1);
    const titles = await items.getByTestId('title').allInnerTexts();
    expect(titles).toHaveLength(await items.count());
    for (const title of titles) {
      expect(title.trim()).not.toBe('');
      expect(title).not.toContain('Sedang memuat');
    }

    // 4. Inspect the first story (never hardcode its title: the list changes every few minutes)
    const first = items.first();
    await expect(first.getByTestId('title')).toBeVisible();
    await expect(first.getByTestId('title')).toHaveText(/\S/);
    await expect(first.getByTestId('image')).toBeVisible();
    await expect(first.getByTestId('author-name')).toHaveText(/\S/);
    await expect(first.getByTestId('card-footer-date')).toHaveText(/\S/);
    await expect(first.locator('a').first()).toHaveAttribute('href', /^\/[^/]+\/.+-[A-Za-z0-9]+$/);

    // 5. Check the category chips (none is clicked)
    const allTab = page.getByTestId('tab-semua');
    await expect(allTab).toBeVisible();
    await expect(allTab).toHaveText('Semua');
    await expect.poll(() => page.getByTestId('tab-item').count()).toBeGreaterThanOrEqual(1);
    await expect(page).toHaveURL('/trending');
  });
});

// spec: specs/kumparan-search.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Search', () => {
  test('TC-SRCH-004 Clicking a popular search term on /search opens results for that term', async ({ page, isMobile }) => {
    // 1. Open the search landing: `page.goto('/')`, then click the search entry point
    await page.goto('/');
    const searchInput = page.getByTestId('input-search');
    if (isMobile) {
      // The mobile header has no search box: the search icon opens the /search landing page
      await page.getByTestId('hd-search').click();
    } else {
      await searchInput.click();
    }
    await expect(page).toHaveURL(/\/search$/);
    const popularSection = page.getByTestId('popular-search-section');
    await expect(popularSection).toBeVisible();
    await expect(popularSection).toContainText('Pencarian populer');
    const popularList = page.getByTestId('popular-list');
    await expect.poll(() => popularList.count()).toBeGreaterThanOrEqual(1);
    await expect(page.getByTestId('story-result-card')).toHaveCount(0);

    // 2. Read the first popular term and its link
    const firstPopular = popularList.first();
    // The list first renders "Sedang memuat" skeletons without href: wait until the real term is in
    await expect(firstPopular).toHaveAttribute('href', /^\/search\/.+/);
    await expect(firstPopular.getByTestId('label-popular-list')).not.toHaveText(/Sedang memuat/);
    const term = (await firstPopular.getByTestId('label-popular-list').innerText()).trim();
    expect(term).not.toBe('');
    const href = await firstPopular.getAttribute('href');
    expect(decodeURIComponent(href ?? '')).toBe(`/search/${term}`);

    // 3. Click the first popular term
    await firstPopular.click();
    await expect(page).toHaveURL((url) => decodeURIComponent(url.pathname) === `/search/${term}`);
    // The results heading is the visible `page-title` on desktop; on mobile it is a hidden (display: none) H1
    if (isMobile) {
      await expect(page.locator('h1')).toHaveText('Hasil Pencarian');
    } else {
      await expect(page.getByTestId('page-title')).toHaveText('Hasil Pencarian');
    }
    await expect(searchInput).toHaveValue(term);
    await expect(page.getByTestId('story-result-card').first()).toBeVisible();
    await expect(page.getByTestId('story-not-found')).toHaveCount(0);
  });
});

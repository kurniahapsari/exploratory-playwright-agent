// spec: specs/kumparan-mobile.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Search (mobile only)', () => {
  test('TC-SRCH-008 The header search icon opens /search and searching jokowi lists results', async ({ page }) => {
    // 1. Navigate to `/`, wait for the first headline card and locate the header search icon
    await page.goto('/');
    await expect(page.getByTestId('headline-card').first().getByTestId('title')).toBeVisible();
    const searchIcon = page.getByTestId('hd-search');
    // The mobile homepage has no search box: this is the flow difference from desktop
    await expect(page.getByTestId('input-search')).toHaveCount(0);
    await expect(searchIcon).toHaveCount(1);
    await expect(searchIcon).toBeVisible();
    await expect(searchIcon).toHaveAttribute('href', '/search');

    // 2. Click the search icon
    await searchIcon.click();
    await expect(page).toHaveURL('/search');
    const input = page.getByTestId('input-search');
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    await expect(input).toHaveAttribute('placeholder', 'Cari di sini...');
    await expect(input).toHaveValue('');
    const popularSection = page.getByTestId('popular-search-section');
    await expect(popularSection).toBeVisible();
    await expect(popularSection).toContainText('Pencarian populer');
    // Popular terms rotate, so only the shape of the first link is checked
    const popularLinks = page.getByTestId('popular-list');
    await expect.poll(() => popularLinks.count()).toBeGreaterThanOrEqual(1);
    await expect(popularLinks.first()).toHaveAttribute('href', /^\/search\//);
    await expect(page.getByTestId('story-result-card')).toHaveCount(0);
    await expect(page.getByTestId('story-not-found')).toHaveCount(0);

    // 3. Click the input, fill `jokowi` and press Enter
    await input.click();
    await input.fill('jokowi');
    await input.press('Enter');
    await expect(page).toHaveURL('/search/jokowi');
    // The H1 is `display: none` on mobile and there is no `page-title` id, so it is asserted by text only
    await expect(page.locator('h1')).toHaveText('Hasil Pencarian');
    await expect(input).toHaveValue('jokowi');

    // 4. Wait for the results
    const cards = page.getByTestId('story-result-card');
    await expect(cards.first()).toBeVisible();
    await expect.poll(() => cards.count()).toBeGreaterThanOrEqual(1);
    await expect(page.getByTestId('story-not-found')).toHaveCount(0);
    const cardCount = await cards.count();
    await expect(cards.getByTestId('title')).toHaveCount(cardCount);
    await expect(cards.getByTestId('author-name')).toHaveCount(cardCount);
    await expect(cards.getByTestId('card-footer-date')).toHaveCount(cardCount);
    const titles = await cards.getByTestId('title').allInnerTexts();
    for (const title of titles) {
      expect(title.trim()).not.toBe('');
    }
    expect(titles.some((title) => /jokowi/i.test(title))).toBe(true);
    // The first card links to an article (not clicked)
    await expect(cards.first().locator('a').first()).toHaveAttribute('href', /^\/[^/]+\/.+-[A-Za-z0-9]+$/);

    // 5. Check the search controls
    const storyTab = page.getByTestId('tab-story');
    await expect(storyTab).toBeVisible();
    await expect(storyTab).toHaveText('Konten');
    const relevanceSort = page.getByTestId('relevant-active');
    await expect(relevanceSort).toBeVisible();
    await expect(relevanceSort).toHaveText('Relevansi');
    const newestSort = page.getByTestId('newest-non-active');
    await expect(newestSort).toBeVisible();
    await expect(newestSort).toHaveText('Terbaru');
    await expect(page).toHaveURL('/search/jokowi');
  });
});

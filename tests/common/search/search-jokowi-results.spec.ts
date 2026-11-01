// spec: specs/kumparan-desktop.plan.md (desktop) and specs/kumparan-mobile.plan.md (mobile differences)
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Search', () => {
  test('TC-SRCH-001 Searching "jokowi" lists results whose titles mention Jokowi', async ({ page, isMobile }) => {
    // 1. Navigate to `/`, click the search input, fill `jokowi` and press Enter
    await page.goto('/');
    const searchInput = page.getByTestId('input-search');
    if (isMobile) {
      // The mobile header has no search box: the search icon opens the /search landing page first
      await page.getByTestId('hd-search').click();
    } else {
      await searchInput.click();
    }
    // Both entry points move the SPA to the /search landing page before the query is typed
    await expect(page).toHaveURL(/\/search$/);
    await searchInput.click();
    await searchInput.fill('jokowi');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/\/search\/jokowi$/);
    // The results heading is the visible `page-title` on desktop; on mobile it is a hidden (display: none) H1
    if (isMobile) {
      await expect(page.locator('h1')).toHaveText('Hasil Pencarian');
    } else {
      await expect(page.getByTestId('page-title')).toHaveText('Hasil Pencarian');
    }
    await expect(searchInput).toHaveValue('jokowi');

    // 2. Wait for the results list
    const cards = page.getByTestId('story-result-card');
    await expect(cards.first()).toBeVisible();
    await expect.poll(() => cards.count()).toBeGreaterThanOrEqual(1);
    await expect(page.getByTestId('story-not-found')).toHaveCount(0);

    // 3. Read all result titles: one title per card and every title mentions Jokowi
    const cardCount = await cards.count();
    const titles = cards.getByTestId('title');
    await expect(titles).toHaveCount(cardCount);
    await expect(titles).toHaveText(Array.from({ length: cardCount }, () => /jokowi/i));

    // 4. Check the search controls
    const storyTab = page.getByTestId('tab-story');
    await expect(storyTab).toBeVisible();
    await expect(storyTab).toHaveText('Konten');
    const relevanceSort = page.getByTestId('relevant-active');
    await expect(relevanceSort).toBeVisible();
    await expect(relevanceSort).toHaveText('Relevansi');
  });
});

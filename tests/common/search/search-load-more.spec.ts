// spec: specs/kumparan-search.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Search', () => {
  test('TC-SRCH-006 Scrolling to the end of the results appends the next page', async ({ page, isMobile }) => {
    // 1. Open the search landing, fill `jokowi` and press Enter
    await page.goto('/');
    const searchInput = page.getByTestId('input-search');
    if (isMobile) {
      // The mobile header has no search box: the search icon opens the /search landing page
      await page.getByTestId('hd-search').click();
    } else {
      await searchInput.click();
    }
    await expect(page).toHaveURL(/\/search$/);
    await searchInput.fill('jokowi');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/\/search\/jokowi$/);
    const cards = page.getByTestId('story-result-card');
    await expect(cards).toHaveCount(10);
    // `ft-loadmore` is attached under the list but has zero height (it is not "visible" for Playwright)
    const loadMore = page.getByTestId('ft-loadmore');
    await expect(loadMore).toBeAttached();

    // 2. Scroll to the end of the list so the load-more control appends the next page.
    // The button cannot be clicked (0x0 box on both sites); the next page loads when the list end is reached.
    // On desktop the window scrolls, on mobile the scroll container is the `main` element.
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
      const main = document.querySelector('main');
      main?.scrollTo(0, main.scrollHeight);
    });
    await expect(cards).toHaveCount(20);
    await expect(cards.getByTestId('title')).toHaveCount(20);
    await expect(page).toHaveURL(/\/search\/jokowi$/);
  });
});

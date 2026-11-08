// spec: specs/kumparan-search.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Search', () => {
  test('TC-SRCH-007 The clear (x) button empties the query and an empty Enter stays on /search', async ({ page, isMobile }) => {
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
    await expect(page.getByTestId('story-result-card').first()).toBeVisible();
    const clearButton = page.getByTestId('right-add-on');
    await expect(clearButton).toBeVisible();

    // 2. Click the clear (x) button
    await clearButton.click();
    await expect(page).toHaveURL(/\/search$/);
    await expect(searchInput).toHaveValue('');
    await expect(searchInput).toBeFocused();
    await expect(clearButton).toHaveCount(0);
    await expect(page.getByTestId('popular-search-section')).toBeVisible();
    await expect(page.getByTestId('story-result-card')).toHaveCount(0);
    if (!isMobile) {
      // The search landing has a visible heading on desktop only
      await expect(page.getByTestId('page-title')).toHaveText('Pencarian');
    }

    // 3. Press Enter in the empty input
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByTestId('popular-search-section')).toBeVisible();
    await expect(page.getByTestId('story-result-card')).toHaveCount(0);
    await expect(page.getByTestId('story-not-found')).toHaveCount(0);
  });
});

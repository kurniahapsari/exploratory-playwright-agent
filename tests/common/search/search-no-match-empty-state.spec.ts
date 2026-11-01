// spec: specs/kumparan-desktop.plan.md (desktop) and specs/kumparan-mobile.plan.md (mobile differences)
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Search', () => {
  test('TC-SRCH-002 Searching "zxqvbnmlkjhg12345" shows the empty state "Story tidak ditemukan"', async ({ page, isMobile }) => {
    // 1. Navigate to `/`, fill the search input with the no-match query and press Enter
    await page.goto('/');
    const searchInput = page.getByTestId('input-search');
    if (isMobile) {
      // The mobile header has no search box: the search icon opens the /search landing page first
      await page.getByTestId('hd-search').click();
      await expect(page).toHaveURL(/\/search$/);
    }
    await searchInput.fill('zxqvbnmlkjhg12345');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/\/search\/zxqvbnmlkjhg12345$/);
    // The results heading is the visible `page-title` on desktop; on mobile it is a hidden (display: none) H1
    if (isMobile) {
      await expect(page.locator('h1')).toHaveText('Hasil Pencarian');
    } else {
      await expect(page.getByTestId('page-title')).toHaveText('Hasil Pencarian');
    }

    // 2. Check the empty state container
    const notFound = page.getByTestId('story-not-found');
    await expect(notFound).toBeVisible();
    await expect(notFound.getByText('Story tidak ditemukan')).toBeVisible();
    await expect(notFound.getByText('Sudah benarkah story yang dicari?')).toBeVisible();

    // 3. Check that no results are rendered
    await expect(page.getByTestId('story-result-card')).toHaveCount(0);

    // 4. Check that the search UI is still usable
    await expect(searchInput).toHaveValue('zxqvbnmlkjhg12345');
    await expect(page.getByTestId('tab-story')).toBeVisible();
  });
});

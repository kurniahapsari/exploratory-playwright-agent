// spec: specs/kumparan-search.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Search', () => {
  test('TC-SRCH-005 Switching the sort to "Terbaru" makes it the active sort and keeps results', async ({ page, isMobile }) => {
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
    // The results heading is the visible `page-title` on desktop; on mobile it is a hidden (display: none) H1
    if (isMobile) {
      await expect(page.locator('h1')).toHaveText('Hasil Pencarian');
    } else {
      await expect(page.getByTestId('page-title')).toHaveText('Hasil Pencarian');
    }
    const cards = page.getByTestId('story-result-card');
    await expect(cards.first()).toBeVisible();
    await expect(page.getByTestId('relevant-active')).toBeVisible();
    await expect(page.getByTestId('relevant-active')).toHaveText('Relevansi');
    await expect(page.getByTestId('newest-non-active')).toBeVisible();
    await expect(page.getByTestId('newest-non-active')).toHaveText('Terbaru');

    // 2. Click "Terbaru"
    await page.getByTestId('newest-non-active').click();
    // The ids swap after the click while the texts stay the same
    await expect(page.getByTestId('newest-active')).toBeVisible();
    await expect(page.getByTestId('newest-active')).toHaveText('Terbaru');
    await expect(page.getByTestId('relevant-non-active')).toBeVisible();
    await expect(page.getByTestId('relevant-non-active')).toHaveText('Relevansi');
    await expect(page.getByTestId('relevant-active')).toHaveCount(0);
    await expect(page.getByTestId('newest-non-active')).toHaveCount(0);
    await expect(page).toHaveURL(/\/search\/jokowi$/);
    await expect(searchInput).toHaveValue('jokowi');
    await expect.poll(() => cards.count()).toBeGreaterThanOrEqual(1);
    await expect(page.getByTestId('story-not-found')).toHaveCount(0);
    // Every card still has a non-empty date
    const cardCount = await cards.count();
    const dates = cards.getByTestId('card-footer-date');
    await expect(dates).toHaveCount(cardCount);
    await expect(dates).toHaveText(Array.from({ length: cardCount }, () => /\S/));
  });
});

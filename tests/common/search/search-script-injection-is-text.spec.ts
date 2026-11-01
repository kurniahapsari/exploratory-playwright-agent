// spec: specs/kumparan-desktop.plan.md (desktop) and specs/kumparan-mobile.plan.md (mobile differences)
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Search', () => {
  test('TC-SRCH-003 Searching "<script>alert(1)</script>" is treated as text (no dialog, empty state)', async ({ page, isMobile }) => {
    const payload = '<script>alert(1)</script>';

    // 1. Navigate to `/` and register a dialog listener BEFORE searching
    const dialogs: string[] = [];
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });
    await page.goto('/');
    const searchInput = page.getByTestId('input-search');
    if (isMobile) {
      // The mobile header has no search box: the search icon opens the /search landing page first
      await expect(page.getByTestId('hd-search')).toBeVisible();
      await page.getByTestId('hd-search').click();
      await expect(page).toHaveURL(/\/search$/);
    }
    await expect(searchInput).toBeVisible();

    // 2. Fill the search input with the literal payload and press Enter
    await searchInput.fill(payload);
    await searchInput.press('Enter');
    await expect(page).toHaveURL((url) => decodeURIComponent(url.pathname) === `/search/${payload}`);
    // The results heading is the visible `page-title` on desktop; on mobile it is a hidden (display: none) H1
    if (isMobile) {
      await expect(page.locator('h1')).toHaveText('Hasil Pencarian');
    } else {
      await expect(page.getByTestId('page-title')).toHaveText('Hasil Pencarian');
    }

    // 3. Check the empty state
    const notFound = page.getByTestId('story-not-found');
    await expect(notFound).toBeVisible();
    await expect(notFound).toContainText('Story tidak ditemukan');
    await expect(page.getByTestId('story-result-card')).toHaveCount(0);

    // 4. Check that the payload was kept as plain text
    await expect(searchInput).toHaveValue(payload);

    // 5. Check that nothing was executed or injected. The empty state has already rendered, so any
    // synchronous execution of the payload would have happened; no fixed sleep is used.
    expect(dialogs).toEqual([]);
    // Playwright text filters skip <script> elements, so the script content is read with evaluateAll
    await expect
      .poll(() => page.locator('script').evaluateAll((scripts) => scripts.filter((s) => s.textContent?.trim() === 'alert(1)').length))
      .toBe(0);
    const main = page.getByTestId(isMobile ? 'main-content' : 'main-section');
    await expect(main).toBeVisible();
    await expect(main.locator('script')).toHaveCount(0);
  });
});

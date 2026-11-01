// spec: specs/kumparan-desktop.plan.md (desktop) and specs/kumparan-mobile.plan.md (mobile differences)
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Home', () => {
  test('TC-HOME-001 Homepage loads its core sections (logo, search input, story cards)', async ({ page, isMobile }) => {
    // 1. Navigate to `/` as a guest
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page).toHaveTitle('kumparan.com - Bicara Fakta Lewat Berita');

    // 2. Locate the logo (two elements share this id on desktop, so .first() avoids a strict-mode violation)
    await expect(page.getByTestId('hd-logo').first()).toBeVisible();

    // 3. Locate the search box
    if (isMobile) {
      // The mobile header has no search box: it has a search icon link to /search and the burger menu
      const searchIcon = page.getByTestId('hd-search');
      await expect(searchIcon).toBeVisible();
      await expect(searchIcon).toHaveAttribute('href', '/search');
      await expect(page.getByTestId('burger-menu')).toBeVisible();
      await expect(page.getByTestId('input-search')).toHaveCount(0);
    } else {
      const searchInput = page.getByTestId('input-search');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeEnabled();
      await expect(searchInput).toHaveAttribute('placeholder', 'Cari di sini...');
      await expect(searchInput).toHaveValue('');
    }

    // 4. Wait for the feed to hydrate (mobile has no `news-item` on the homepage: it uses `headline-card`)
    const cards = page.getByTestId(isMobile ? 'headline-card' : 'news-item');
    const firstCard = cards.first();
    const firstTitle = firstCard.getByTestId('title');
    await expect(cards.first()).toBeVisible();
    await expect(firstTitle).toBeVisible();
    await expect(firstTitle).toHaveText(/\S/);
    await expect(firstTitle).not.toContainText('Sedang memuat');

    // 5. Inspect the first story card
    await expect(firstCard.getByTestId('image')).toBeVisible();
    await expect(firstCard.getByTestId('author-name')).toHaveText(/\S/);
    await expect(firstCard.getByTestId('card-footer-date')).toHaveText(/\S/);

    // 6. Check that the feed holds more than one story
    await expect.poll(() => cards.count()).toBeGreaterThanOrEqual(2);
  });
});

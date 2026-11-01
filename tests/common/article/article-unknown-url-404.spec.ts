// spec: specs/kumparan-desktop.plan.md (desktop) and specs/kumparan-mobile.plan.md (mobile differences)
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Article', () => {
  test('TC-ART-004 An unknown article URL shows the 404 page "Maaf, halaman tidak ditemukan"', async ({ page, isMobile }) => {
    // 1. Navigate to a URL that cannot exist (deliberately a non-existent article, not a real one)
    const unknownPath = '/kumparannews/artikel-yang-tidak-pernah-ada-zzzzzz-28Uxxxxxxxx';
    const response = await page.goto(unknownPath);
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(404);
    await expect(page).toHaveURL(unknownPath);

    // 2. Check the not-found block
    const notFound = page.getByTestId('not-found-page');
    await expect(notFound).toBeVisible();
    await expect(notFound.getByText('Maaf, halaman tidak ditemukan')).toBeVisible();
    await expect(notFound.getByText('Tapi tenang, masih banyak konten menarik lainnya')).toBeVisible();

    // 3. Check the recovery link
    const backToHome = page.getByTestId('back-to-home');
    await expect(backToHome).toBeVisible();
    await expect(backToHome).toHaveText('Lihat konten lain');
    await expect(backToHome).toHaveAttribute('href', '/');

    // 4. Check that no article is rendered and the site chrome is intact
    await expect(page.getByTestId('story-title')).toHaveCount(0);
    if (isMobile) {
      // The mobile header has no search box: it shows the search icon and the burger menu
      await expect(page.getByTestId('hd-search')).toBeVisible();
      await expect(page.getByTestId('burger-menu')).toBeVisible();
    } else {
      await expect(page.getByTestId('input-search')).toBeVisible();
    }
  });
});

// spec: specs/kumparan-mobile.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Home (mobile only)', () => {
  test('TC-HOME-003 The burger menu opens a sidebar with Masuk, Beranda and Trending; the close button hides it', async ({ page }) => {
    // 1. Navigate with the default wait for `load` (a burger click before hydration is silently lost, so no
    // `waitUntil: 'domcontentloaded'`), then wait for the page content
    await page.goto('/');
    const firstHeadlineTitle = page.getByTestId('headline-card').first().getByTestId('title');
    await expect(firstHeadlineTitle).toBeVisible();
    const burger = page.getByTestId('burger-menu');
    await expect(burger).toBeVisible();
    await expect(burger).toBeEnabled();
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('hd-search')).toBeVisible();

    // 2. Check the closed baseline. The sidebar is pre-rendered off-canvas and Playwright still reports it as
    // visible, so open/closed is asserted with viewport intersection instead of visibility.
    const masuk = page.getByTestId('label-list-item-masuk');
    const beranda = page.getByTestId('label-list-item-beranda');
    const trending = page.getByTestId('label-list-item-trending');
    const closeButton = page.getByTestId('close-sidebar');
    const sidebar = page.getByRole('region', { name: 'navigation side' });
    for (const locator of [masuk, beranda, trending, closeButton, sidebar]) {
      await expect(locator).toHaveCount(1);
    }
    for (const locator of [masuk, beranda, trending, closeButton]) {
      await expect(locator).not.toBeInViewport();
    }

    // 3. Click the burger button
    await burger.click();
    await expect(masuk).toBeInViewport();
    await expect(masuk).toHaveText('Masuk');
    await expect(beranda).toBeInViewport();
    await expect(beranda).toHaveText('Beranda');
    await expect(beranda).toHaveAttribute('href', '/');
    await expect(trending).toBeInViewport();
    await expect(trending).toHaveText('Trending');
    await expect(trending).toHaveAttribute('href', '/trending');
    await expect(sidebar.getByRole('heading', { name: 'Menu', level: 2 })).toBeInViewport();
    await expect(closeButton).toBeInViewport();
    await expect(closeButton).toBeEnabled();
    await expect(page).toHaveURL('/');

    // 4. Click the close button (no menu item is clicked and nobody is logged in)
    await closeButton.click();
    for (const locator of [masuk, beranda, trending, closeButton]) {
      await expect(locator).not.toBeInViewport();
    }
    await expect(burger).toBeVisible();
    await expect(burger).toBeEnabled();
    await expect(page).toHaveURL('/');
    // A trial click succeeds only if the semi-transparent backdrop no longer covers the page
    await firstHeadlineTitle.click({ trial: true });

    // 5. Click the burger button once more: the menu can be re-opened
    await burger.click();
    await expect(masuk).toBeInViewport();
  });
});

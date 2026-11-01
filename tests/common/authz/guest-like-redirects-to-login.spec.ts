// spec: specs/kumparan-desktop.plan.md (desktop) and specs/kumparan-mobile.plan.md (mobile differences)
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Authorization', () => {
  test('TC-AUTHZ-001 A guest clicking Like on an article is redirected to /login', async ({ page, isMobile }) => {
    // 1. Navigate to `/`, wait for the first card to hydrate and open it (never hardcode an article URL)
    await page.goto('/');
    const firstTitle = page.getByTestId(isMobile ? 'headline-card' : 'news-item').first().getByTestId('title');
    await expect(firstTitle).toBeVisible();
    await expect(firstTitle).not.toContainText('Sedang memuat');
    await expect(firstTitle).toHaveText(/\S/);
    await firstTitle.click();
    await expect(page.getByTestId('story-title')).toBeVisible();

    // 2. Check the like button before acting
    const likeButton = page.getByTestId('btn-like');
    await expect(likeButton).toBeVisible();
    await expect(likeButton).toBeEnabled();

    // 3. Click Like as a guest (not logged in)
    await likeButton.click();
    await expect(page).toHaveURL(/\/login$/);

    // 4. Check the login page (no login is attempted and the Cloudflare widget is not touched)
    await expect(page.getByTestId('input-email')).toBeVisible();
    await expect(page.getByTestId('input-password')).toBeVisible();
    const submitButton = page.getByTestId('btn-save');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
    await expect(
      page.getByText('Login dulu biar bisa komen, bikin konten, langganan kumparanPLUS dan atur notifikasi konten favoritmu. Yuk!'),
    ).toBeVisible();
  });
});

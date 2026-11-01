// spec: specs/kumparan-desktop.plan.md (works unchanged on mobile, see specs/kumparan-mobile.plan.md)
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Authentication', () => {
  test('TC-AUTH-006 /login: invalid email "bukan-email" shows "Harus diisi dengan format email"', async ({ page }) => {
    // 1. Navigate to `/login`
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login$/);
    const emailInput = page.getByTestId('input-email');
    const passwordInput = page.getByTestId('input-password');
    const submitButton = page.getByTestId('btn-save');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
    await expect(page.getByTestId('input-email-errorMessage')).toHaveCount(0);

    // 2. Fill the email with `bukan-email` and press Tab to blur the field
    await emailInput.fill('bukan-email');
    await emailInput.press('Tab');
    await expect(emailInput).toHaveValue('bukan-email');

    // 3. Check the validation message
    const emailError = page.getByTestId('input-email-errorMessage');
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveText('Harus diisi dengan format email');

    // 4. Check the rest of the form (no password typed, Masuk not clicked, Cloudflare widget untouched)
    await expect(submitButton).toBeDisabled();
    await expect(page.getByTestId('input-password-errorMessage')).toHaveCount(0);
    await expect(page).toHaveURL(/\/login$/);
  });
});

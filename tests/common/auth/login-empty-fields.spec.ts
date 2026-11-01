// spec: specs/kumparan-desktop.plan.md (works unchanged on mobile, see specs/kumparan-mobile.plan.md)
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Authentication', () => {
  test('TC-AUTH-007 /login: empty email and password show "Tidak boleh kosong" and "Masuk" stays disabled', async ({ page }) => {
    // 1. Navigate to `/login`
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login$/);
    const emailInput = page.getByTestId('input-email');
    const passwordInput = page.getByTestId('input-password');
    const submitButton = page.getByTestId('btn-save');
    const emailError = page.getByTestId('input-email-errorMessage');
    const passwordError = page.getByTestId('input-password-errorMessage');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeDisabled();
    await expect(emailError).toHaveCount(0);
    await expect(passwordError).toHaveCount(0);

    // 2. Click the empty email field and Tab (focus moves to the password field), then Tab again without typing
    await emailInput.click();
    await emailInput.press('Tab');
    await passwordInput.press('Tab');
    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');

    // 3. Check the email validation
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveText('Tidak boleh kosong');

    // 4. Check the password validation
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toHaveText('Tidak boleh kosong');

    // 5. Check the form submit button (not clicked; the Cloudflare widget is untouched)
    await expect(submitButton).toHaveText('Masuk');
    await expect(submitButton).toBeDisabled();
    await expect(page).toHaveURL(/\/login$/);
  });
});

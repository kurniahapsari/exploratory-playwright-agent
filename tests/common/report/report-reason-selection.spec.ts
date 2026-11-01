// spec: specs/kumparan-desktop.plan.md (desktop) and specs/kumparan-mobile.plan.md (mobile differences)
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Report', () => {
  test('TC-RPT-002 Choosing a reason enables "Laporkan"; choosing another reason unchecks the first', async ({ page, isMobile }) => {
    if (isMobile) {
      // Mobile only: the Video Story promo overlay can appear while the article is scrolled and blocks clicks.
      // The shared fixture does not close it, so close it here whenever it shows up.
      const promoCta = page.getByRole('button', { name: 'Jelajahi Sekarang' });
      const promoClose = page
        .locator("div:has(> * button:has-text('Jelajahi Sekarang'))")
        .getByRole('button').filter({ has: page.getByTestId('close') });
      // The promo can re-render or dismiss itself while it is being closed; an unbounded click on the detached close
      // button would block every following action until the test ends, so the handler gives up after 3s.
      await page.addLocatorHandler(promoCta, async () => {
        await promoClose.click({ timeout: 3_000 }).catch(() => {});
      });
    }

    const reasonCheckbox = (index: number) => page.getByTestId(`radio-btn-option-report-${index}`).getByRole('checkbox');
    const submitButton = page.getByTestId('btn-report');

    // 1. Navigate to `/`, open the first card and click the report link in the article footer (never hardcode an article URL)
    await page.goto('/');
    const firstTitle = page.getByTestId(isMobile ? 'headline-card' : 'news-item').first().getByTestId('title');
    await expect(firstTitle).toBeVisible();
    await expect(firstTitle).not.toContainText('Sedang memuat');
    await expect(firstTitle).toHaveText(/\S/);
    await firstTitle.click();
    await expect(page.getByTestId('story-title')).toBeVisible();
    await page.getByTestId('story-footer').getByTestId('btn-report').click();
    await expect(page.getByTestId('radio-btn-option-report-0')).toBeVisible();
    await expect(submitButton).toBeDisabled();

    // 2. Click the first reason label
    await page.getByTestId('radio-btn-option-report-0').click();
    await expect(reasonCheckbox(0)).toBeChecked();
    for (const index of [1, 2, 3, 4, 5]) {
      await expect(reasonCheckbox(index)).not.toBeChecked();
    }
    await expect(submitButton).toBeEnabled();

    // 3. Click the second reason label: the selection is exclusive
    await page.getByTestId('radio-btn-option-report-1').click();
    await expect(reasonCheckbox(1)).toBeChecked();
    await expect(reasonCheckbox(0)).not.toBeChecked();
    for (const index of [2, 3, 4, 5]) {
      await expect(reasonCheckbox(index)).not.toBeChecked();
    }
    await expect(submitButton).toBeEnabled();

    // 4. Stop here: "Laporkan" is never clicked, so nothing is submitted.
    // The same form is shown at `/report/story/<slug>` or, when the app rewrites the URL, at `<article>/full`
    // (both observed with the same form on screen, on desktop and on mobile; which one depends on the scroll state at click time).
    await expect(page).toHaveURL(/\/(report\/story\/.+|full)$/);
    await expect(page.getByText(/berhasil|terima kasih|dilaporkan/i)).toHaveCount(0);
  });
});

// spec: specs/kumparan-desktop.plan.md (desktop) and specs/kumparan-mobile.plan.md (mobile differences)
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Report', () => {
  test('TC-RPT-001 "Laporkan tulisan" opens the report form with 6 reasons and a disabled "Laporkan" button', async ({ page, isMobile }) => {
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

    // 1. Navigate to `/`, wait for the first card to hydrate, store its title, then open it (never hardcode an article URL)
    await page.goto('/');
    const firstTitle = page.getByTestId(isMobile ? 'headline-card' : 'news-item').first().getByTestId('title');
    await expect(firstTitle).toBeVisible();
    await expect(firstTitle).not.toContainText('Sedang memuat');
    await expect(firstTitle).toHaveText(/\S/);
    const cardTitle = (await firstTitle.innerText()).trim();
    await firstTitle.click();
    await expect(page.getByTestId('story-title')).toBeVisible();

    // 2. Scroll to the article footer and locate the report link (scoped: `btn-report` also exists in the share dialog and on the form)
    const reportLink = page.getByTestId('story-footer').getByTestId('btn-report');
    await reportLink.scrollIntoViewIfNeeded();
    await expect(reportLink).toBeVisible();
    await expect(reportLink).toHaveText('Laporkan tulisan');
    await expect(reportLink).toHaveAttribute('href', /^\/report\/story\//);
    const reportHref = await reportLink.getAttribute('href');

    // 3. Click the report link
    await reportLink.click();
    // Wait for the form first: scrolling the mobile article already rewrites its URL to `<article>/full`,
    // so a URL assertion made before the form is visible could pass on that stale URL.
    const firstReason = page.getByTestId('radio-btn-option-report-0');
    await expect(firstReason).toBeVisible();
    // The same form is shown at two URLs, on desktop and on mobile alike: the link's own `/report/story/<slug>`,
    // or `<article>/full` when the app rewrites it. Observed on desktop: after `scrollIntoViewIfNeeded()` on the footer
    // the URL stays `/report/story/<slug>`; clicking the link without scrolling first ends at `<article>/full`.
    await expect(page).toHaveURL((url) => url.pathname === reportHref || url.pathname.endsWith('/full'));
    await expect(page.getByText('Laporkan Konten')).toBeVisible();
    await expect(
      page.getByText('Tim kumparan akan menggunakan laporan kamu untuk melakukan pengecekan terhadap konten ini.'),
    ).toBeVisible();

    // 4. Check the reported article card
    const main = page.getByTestId(isMobile ? 'main-content' : 'main-section');
    await expect(main.getByTestId('news-item').getByTestId('title')).toHaveText(cardTitle);

    // 5. Check the reasons
    await expect(page.getByTestId(/^radio-btn-option-report-/)).toHaveCount(6);
    const reasons = [
      'Spam, Komersial, atau Iklan',
      'Memiliki unsur pornografi',
      'Membahayakan atau menjurus tindakan berbahaya',
      'Mengandung konten kekerasan',
      'Menyinggung SARA',
      'Lainnya',
    ];
    for (const [index, reason] of reasons.entries()) {
      const option = page.getByTestId(`radio-btn-option-report-${index}`);
      await expect(option).toHaveText(reason);
      await expect(option.getByRole('checkbox')).not.toBeChecked();
    }

    // 6. Check the buttons (the "Laporkan" submit button is never clicked)
    const cancelButton = page.getByTestId('btn-cancel');
    await expect(cancelButton).toBeVisible();
    await expect(cancelButton).toHaveText('Batal');
    await expect(cancelButton).toBeEnabled();
    const submitButton = page.getByTestId('btn-report');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveText('Laporkan');
    await expect(submitButton).toBeDisabled();
  });
});

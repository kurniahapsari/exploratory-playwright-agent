// spec: specs/kumparan-desktop.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Share', () => {
  test('TC-SHR-003 The vertical-dots button in the article share bar opens "Bagikan" with WhatsApp, Facebook, X, Line, Salin', async ({ page }) => {
    // 1. Navigate to `/`, wait for the first card to hydrate and open it (never hardcode an article URL)
    await page.goto('/');
    const firstTitle = page.getByTestId('news-item').first().getByTestId('title');
    await expect(firstTitle).toBeVisible();
    await expect(firstTitle).not.toContainText('Sedang memuat');
    await expect(firstTitle).toHaveText(/\S/);
    await firstTitle.click();
    const storyTitle = page.getByTestId('story-title');
    await expect(storyTitle).toBeVisible();
    const modal = page.getByTestId('modal');
    await expect(modal).toHaveCount(0);
    const articleUrl = page.url();

    // 2. Click the vertical-dots icon in the share bar (scoped: the header "Lainnya" trigger shares the id)
    await page.getByTestId('share-wrapper').getByTestId('more-vertical').click();
    await expect(modal).toBeVisible();

    // 3. Check the dialog header
    await expect(modal.getByTestId('title')).toHaveText('Bagikan');
    await expect(modal.getByTestId('btn-close-modal')).toBeVisible();

    // 4. Check the five share options (none is clicked)
    const shareButtons = ['share-whatsapp', 'share-fb', 'share-twitter', 'share-line', 'share-copy-clipboard'];
    for (const testId of shareButtons) {
      const shareButton = modal.getByTestId(testId);
      await expect(shareButton).toBeVisible();
      await expect(shareButton).toBeEnabled();
    }
    for (const caption of ['WhatsApp', 'Facebook', 'X', 'Line', 'Salin']) {
      const captionText = modal.getByText(caption, { exact: true });
      await expect(captionText).toHaveCount(1);
      await expect(captionText).toBeVisible();
    }

    // 5. Check the extra link in the dialog (not clicked)
    const reportLink = modal.getByTestId('btn-report');
    await expect(reportLink).toBeVisible();
    await expect(reportLink).toHaveText('Laporkan Tulisan');

    // 6. Close the dialog
    await modal.getByTestId('btn-close-modal').click();
    await expect(modal).toHaveCount(0);
    await expect(page).toHaveURL(articleUrl);
    await expect(storyTitle).toBeVisible();
  });
});

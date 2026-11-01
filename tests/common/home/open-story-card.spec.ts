// spec: specs/kumparan-desktop.plan.md (desktop) and specs/kumparan-mobile.plan.md (mobile differences)
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Home', () => {
  test('TC-HOME-005 Opening a story card shows the same article (H1 equals the card title)', async ({ page, isMobile }) => {
    // 1. Navigate to `/` and wait for the first card (mobile has no `news-item` on the homepage: it uses `headline-card`)
    await page.goto('/');
    const firstTitle = page.getByTestId(isMobile ? 'headline-card' : 'news-item').first().getByTestId('title');
    await expect(firstTitle).toBeVisible();
    await expect(firstTitle).not.toContainText('Sedang memuat');
    await expect(firstTitle).toHaveText(/\S/);

    // 2. Read and store the card title (never hardcode an article title or URL)
    const cardTitle = (await firstTitle.innerText()).trim();
    expect(cardTitle.length).toBeGreaterThan(0);

    // 3. Click the card title
    await firstTitle.click();
    await expect(page).toHaveURL(/^https:\/\/[^/]+\/[^/]+\/.+-[A-Za-z0-9]+$/);
    const storyTitle = page.getByTestId('story-title');
    await expect(storyTitle).toBeVisible();

    // 4. Compare the article heading with the card
    await expect(storyTitle).toHaveText(cardTitle);
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(cardTitle);
    const escapedTitle = cardTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(page).toHaveTitle(new RegExp(escapedTitle));
  });
});

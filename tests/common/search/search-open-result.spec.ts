// spec: specs/kumparan-search.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Search', () => {
  test('TC-SRCH-009 Opening a search result shows the same article (H1 equals the card title)', async ({ page, isMobile }) => {
    // 1. Open the search landing, fill `jokowi` and press Enter
    await page.goto('/');
    const searchInput = page.getByTestId('input-search');
    if (isMobile) {
      // The mobile header has no search box: the search icon opens the /search landing page
      await page.getByTestId('hd-search').click();
    } else {
      await searchInput.click();
    }
    await expect(page).toHaveURL(/\/search$/);
    await searchInput.fill('jokowi');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/\/search\/jokowi$/);
    await expect(page.getByTestId('story-result-card').first()).toBeVisible();

    // 2. Read the first card title
    const firstTitle = page.getByTestId('story-result-card').first().getByTestId('title');
    await expect(firstTitle).toBeVisible();
    const cardTitle = (await firstTitle.innerText()).trim();
    expect(cardTitle).not.toBe('');
    expect(cardTitle).toMatch(/jokowi/i);

    // 3. Click the first card title
    await firstTitle.click();
    // Article path (not /search): https://<host>/<publisher>/<slug>-<id>
    await expect(page).toHaveURL(/^https:\/\/[^/]+\/[^/]+\/.+-[A-Za-z0-9]+$/);
    const storyTitle = page.getByTestId('story-title');
    await expect(storyTitle).toBeVisible();
    await expect(storyTitle).toHaveText(cardTitle);
  });
});

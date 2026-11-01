// spec: specs/kumparan-desktop.plan.md (desktop) and specs/kumparan-mobile.plan.md (mobile differences)
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Article', () => {
  test('TC-ART-001 Article page shows title, channel, author, publish date (WIB), body and the like/comment/share bar', async ({ page, isMobile }) => {
    // 1. Navigate to `/`, wait for the first card to hydrate, store its title, then open it (never hardcode an article URL)
    await page.goto('/');
    const firstTitle = page.getByTestId(isMobile ? 'headline-card' : 'news-item').first().getByTestId('title');
    await expect(firstTitle).toBeVisible();
    await expect(firstTitle).not.toContainText('Sedang memuat');
    await expect(firstTitle).toHaveText(/\S/);
    const cardTitle = (await firstTitle.innerText()).trim();
    await firstTitle.click();
    await expect(page).toHaveURL(/^https:\/\/[^/]+\/[^/]+\/.+-[A-Za-z0-9]+$/);
    const storyTitle = page.getByTestId('story-title');
    await expect(storyTitle).toBeVisible();

    // 2. Check the title
    await expect(storyTitle).toHaveText(cardTitle);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

    // 3. Check the channel breadcrumb link
    const channelName = page.getByTestId('channel-name');
    await expect(channelName).toBeVisible();
    await expect(channelName).toHaveText(/\S/);
    await expect(channelName).toHaveAttribute('href', /^\/channel\/[a-z0-9-]+$/);

    // 4. Check the author
    const authorName = page.getByTestId('story-author').getByTestId('author-name');
    await expect(authorName).toBeVisible();
    await expect(authorName).toHaveText(/\S/);

    // 5. Check the publish date (time zone suffix is WIB)
    const publishDate = page.getByTestId('publish-date');
    await expect(publishDate).toBeVisible();
    await expect(publishDate).toHaveText(/^\d{1,2} \p{L}+ \d{4} \d{2}:\d{2} WIB$/u);

    // 6. Check the body
    await expect(page.getByTestId('article-main')).toBeVisible();
    const paragraphs = page.getByTestId('story-paragraph');
    await expect.poll(() => paragraphs.count()).toBeGreaterThanOrEqual(1);
    await expect(paragraphs.first()).toHaveText(/\S/);

    // 7. Check the engagement bar (on mobile it is a fixed bar at the bottom of the screen)
    const likeButton = page.getByTestId('btn-like');
    await expect(likeButton).toBeVisible();
    await expect(likeButton).toBeEnabled();
    await expect(likeButton).toHaveText(/\S/);
    const commentLink = page.getByTestId('btn-comment');
    await expect(commentLink).toBeVisible();
    await expect(commentLink).toHaveText(/\S/);
    await expect(commentLink).toHaveAttribute('href', /\/response\//);
    const shareWrapper = page.getByTestId('share-wrapper');
    await expect(shareWrapper).toBeVisible();
    await expect(shareWrapper.getByTestId('sosmed-whatsapp-white')).toBeVisible();
    await expect(shareWrapper.getByTestId('copy-circle')).toBeVisible();
    await expect(shareWrapper.getByTestId('more-vertical')).toBeVisible();
  });
});

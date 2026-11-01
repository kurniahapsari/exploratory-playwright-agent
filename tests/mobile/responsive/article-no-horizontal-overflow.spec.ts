// spec: specs/kumparan-mobile.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Responsive (mobile only)', () => {
  test('TC-RSP-001 An article page has no horizontal overflow at the phone viewport', async ({ page }) => {
    // The Video Story promo overlay can appear while the article is scrolled and blocks clicks.
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

    // 1. Open an article from the first headline card (never hardcode an article URL)
    await page.goto('/');
    const firstTitle = page.getByTestId('headline-card').first().getByTestId('title');
    await expect(firstTitle).toBeVisible();
    await firstTitle.click();
    await expect(page).toHaveURL(/^https:\/\/[^/]+\/[^/]+\/.+-[A-Za-z0-9]+$/);
    await expect(page.getByTestId('story-title')).toBeVisible();

    // 2. Check the phone viewport precondition
    const vw = page.viewportSize()!.width;
    expect(vw).toBeLessThanOrEqual(480);
    await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(vw);

    // 3. Let the layout settle: scroll in 700px steps until the article footer is in the viewport, then back to the top.
    // The page sets `scroll-behavior: smooth` on <html>, so the steps use `behavior: 'instant'`; otherwise every step
    // restarts a smooth-scroll animation and the page barely moves. The URL is not asserted here: scrolling rewrites it.
    const storyFooter = page.getByTestId('story-footer');
    await expect(async () => {
      await page.evaluate(() => window.scrollBy({ top: 700, behavior: 'instant' }));
      await expect(storyFooter).toBeInViewport({ timeout: 250 });
    }).toPass({ timeout: 30_000 });
    await expect(storyFooter).toBeVisible();
    await expect.poll(() => page.getByTestId('story-paragraph').count()).toBeGreaterThanOrEqual(1);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    // 4. Measure the document (necessary but not sufficient: the article container clips its children)
    const metrics = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      bsw: document.body.scrollWidth,
      iw: window.innerWidth,
    }));
    expect(metrics.sw).toBeLessThanOrEqual(metrics.cw);
    expect(metrics.bsw).toBeLessThanOrEqual(metrics.cw);
    expect(metrics.iw).toBe(vw);

    // 5. Check the layout blocks. `hd-notification` is not in the plan's list here: the mobile article header
    // renders only `burger-menu`, `hd-logo` and `hd-search` (the notification icon exists on the homepage only).
    const blockIds = [
      'story-title',
      'story-author',
      'article-main',
      'story-footer',
      'burger-menu',
      'hd-search',
      'btn-like',
      'btn-comment',
      'share-wrapper',
    ];
    for (const id of blockIds) {
      // Right after the jump back to the top the fixed like/comment/share bar is laid out as 0x0 for a moment
      // (its `boundingBox()` is then `null`), so wait until the block is really rendered before measuring it.
      const block = page.getByTestId(id);
      await expect(block, `${id} is rendered`).toBeVisible();
      const box = await block.boundingBox();
      expect(box, `${id} has a bounding box`).not.toBeNull();
      expect(box!.x, `${id} left edge`).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width, `${id} right edge`).toBeLessThanOrEqual(vw);
    }

    // 6. Scan every descendant of the article body (not the whole `main-content`, which holds clipped carousels by design)
    const articleMain = page.getByTestId('article-main');
    const countOffenders = () =>
      articleMain.evaluate((root) => {
        const clientWidth = document.documentElement.clientWidth;
        return [...root.querySelectorAll('*')].filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && (rect.right > clientWidth + 1 || rect.left < -1);
        }).length;
      });
    await expect.poll(countOffenders).toBe(0);
    const mediaRightEdges = await articleMain.evaluate((root) =>
      [...root.querySelectorAll('img, figure, iframe, video, table')].map((element) => element.getBoundingClientRect().right),
    );
    // The media check is vacuous when the article has no media, so the count is recorded
    test.info().annotations.push({ type: 'media-count', description: String(mediaRightEdges.length) });
    for (const right of mediaRightEdges) {
      expect(right).toBeLessThanOrEqual(vw + 1);
    }

    // 7. Guard against a vacuous pass: inject a 600px-wide probe (local DOM change only) and prove the scan can fail
    await articleMain.evaluate((root) => {
      const probe = document.createElement('div');
      probe.id = 'overflow-probe';
      probe.style.cssText = 'width:600px;height:10px';
      root.appendChild(probe);
    });
    await expect.poll(countOffenders).toBe(1);
    // The document-level numbers do not move, because an ancestor with overflow-x hidden swallows the overflow
    const probed = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(probed.sw).toBeLessThanOrEqual(probed.cw);
    await page.locator('#overflow-probe').evaluate((element) => element.remove());
    await expect(page.locator('#overflow-probe')).toHaveCount(0);
    await expect.poll(countOffenders).toBe(0);
  });
});

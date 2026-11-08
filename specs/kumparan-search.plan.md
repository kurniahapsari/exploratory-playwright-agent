# kumparan.com Search Test Plan (guest, desktop + mobile)

## Application Overview

Additional Search scenarios for kumparan.com (project `desktop-chrome`, baseURL https://kumparan.com) and m.kumparan.com (project `mobile-chrome`, Pixel 7, baseURL https://m.kumparan.com), explored as a logged-out guest on 2026-11-08. Seed: `tests/seed.spec.ts`. They extend TC-SRCH-001/002/003 (`specs/kumparan-desktop.plan.md`) and TC-SRCH-008 (`specs/kumparan-mobile.plan.md`); none of those is repeated here.

Every scenario below behaves the same on both sites, so every file lives in `tests/common/search/` and runs in both projects. The only differences are the entry flow and the results heading, handled with the `isMobile` fixture exactly as in the existing common search specs.

## Conventions
- Import `test` and `expect` from `../../fixtures` (blocks ads, closes the ad modal). Destructure `isMobile` where the flow differs.
- `testIdAttribute` is `data-qa-id`: use `page.getByTestId(...)`.
- Web-first assertions only. No `waitForTimeout`; use `expect.poll` for counts.
- Search terms and popular terms rotate: never hardcode a popular term or an article title/URL. `jokowi` is a stable query with many results.
- Entry to the search landing `/search`:
  - desktop: `page.goto('/')`, click `input-search` in the header (the SPA moves to `/search`).
  - mobile: `page.goto('/')`, click `hd-search` (link, href `/search`). The mobile homepage has no `input-search`.
- Results heading: desktop `page.getByTestId('page-title')` has text `Hasil Pencarian`; mobile has no `page-title` and the H1 is `display: none`, so use `await expect(page.locator('h1')).toHaveText('Hasil Pencarian')`.
- Search landing heading (desktop only): `page-title` has text `Pencarian`. On mobile the landing has no H1.

## data-qa-id used (verified on both sites)
- `/search` landing: `input-search` (placeholder `Cari di sini...`, empty, autofocused), `popular-search-section` (contains `Pencarian populer`), `popular-list` (10 links, href `/search/<term>`; terms may contain spaces, e.g. `/search/kekerasan seksual oleh pelatih lari`, so compare URLs with `decodeURIComponent`), `label-popular-list` (term label inside each link). No `story-result-card`, no `story-not-found`, no `right-add-on`.
- `/search/<query>` results: `input-search` keeps the query; `right-add-on` = the clear (x) button inside the input (icon `x-circle`), only present while the input has text; tabs `tab-story` (Konten) ... ; sort links `relevant-active` / `newest-non-active` by default. After clicking Terbaru the ids SWAP to `relevant-non-active` / `newest-active` (texts stay `Relevansi` / `Terbaru`, URL does not change). `story-result-card` (10 per page) each with `title`, `author-name`, `card-footer-date` and a link to the article (`/<publisher>/<slug>-<id>`; the `title` is inside that link). `ft-loadmore` = a BUTTON under the list with no text and a 0x0 box (Playwright sees it as not visible, so it cannot be clicked); reaching the end of the list by scrolling appends the next 10 cards (10 -> 20) and the element stays.

## Observed, not tested
- Pressing Enter on a whitespace-only query (`"   "`) navigates to `/search/%20%20%20` and shows 10 results instead of staying on the landing or showing an empty state. Product decision unclear, so no test asserts it.

## Test Scenarios

### 1. Search

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-SRCH-004 Clicking a popular search term on /search opens results for that term

**File:** `tests/common/search/search-popular-term.spec.ts`

**Steps:**
  1. Open the search landing: `page.goto('/')`, then on mobile click `page.getByTestId('hd-search')`, on desktop click `page.getByTestId('input-search')`.
    - expect: `await expect(page).toHaveURL(/\/search$/)`.
    - expect: `page.getByTestId('popular-search-section')` is visible and contains text `Pencarian populer`.
    - expect: `page.getByTestId('popular-list')` count is at least 1 (10 observed).
    - expect: `page.getByTestId('story-result-card')` count is 0.
  2. Read the first popular term and its link: `const firstPopular = page.getByTestId('popular-list').first()`; `const term = (await firstPopular.getByTestId('label-popular-list').innerText()).trim()`; read its `href`.
    - expect: `term` is non-empty and the href equals `/search/${term}` (do not hardcode the term).
  3. Click `firstPopular`.
    - expect: the decoded URL path equals `/search/${term}` (`await expect(page).toHaveURL(url => decodeURIComponent(url.pathname) === \`/search/${term}\`)`).
    - expect: results heading `Hasil Pencarian` (desktop `page-title`, mobile hidden `h1`).
    - expect: `page.getByTestId('input-search')` has value `term`.
    - expect: `page.getByTestId('story-result-card').first()` is visible and `story-not-found` count is 0.

#### 1.2. TC-SRCH-005 Switching the sort to "Terbaru" makes it the active sort and keeps results

**File:** `tests/common/search/search-sort-newest.spec.ts`

**Steps:**
  1. Open the search landing (same entry as 1.1), fill `input-search` with `jokowi` and press Enter.
    - expect: URL matches `/\/search\/jokowi$/` and the results heading is `Hasil Pencarian`.
    - expect: `story-result-card` first is visible.
    - expect: `page.getByTestId('relevant-active')` is visible with text `Relevansi`; `page.getByTestId('newest-non-active')` is visible with text `Terbaru`.
  2. Click `page.getByTestId('newest-non-active')`.
    - expect: `page.getByTestId('newest-active')` is visible with text `Terbaru`.
    - expect: `page.getByTestId('relevant-non-active')` is visible with text `Relevansi`.
    - expect: `page.getByTestId('relevant-active')` and `page.getByTestId('newest-non-active')` have count 0.
    - expect: URL still matches `/\/search\/jokowi$/` and `input-search` still has value `jokowi`.
    - expect: `story-result-card` count is at least 1 and `story-not-found` count is 0.
    - expect: every result card still has a non-empty `card-footer-date` (`cards.getByTestId('card-footer-date')` count equals the card count).

#### 1.3. TC-SRCH-006 Scrolling to the end of the results appends the next page

**File:** `tests/common/search/search-load-more.spec.ts`

**Steps:**
  1. Open the search landing (same entry as 1.1), fill `input-search` with `jokowi` and press Enter.
    - expect: URL matches `/\/search\/jokowi$/`.
    - expect: `const cards = page.getByTestId('story-result-card')` reaches count 10 (`await expect(cards).toHaveCount(10)`).
    - expect: `page.getByTestId('ft-loadmore')` is attached (`toBeAttached()`). It is a 0x0 infinite-scroll sentinel, not a clickable button (corrected by the generator on 2026-11-08).
  2. Scroll to the end of the list: the window on desktop, the `main` element (to its full `scrollHeight`) on mobile. Scrolling only the last card into view did not trigger the load on mobile.
    - expect: `cards` reaches count 20 (`await expect(cards).toHaveCount(20)`).
    - expect: every card has a `title` (`cards.getByTestId('title')` count 20).
    - expect: URL still matches `/\/search\/jokowi$/`.

#### 1.4. TC-SRCH-007 The clear (x) button empties the query and an empty Enter stays on /search

**File:** `tests/common/search/search-clear-and-empty-submit.spec.ts`

**Steps:**
  1. Open the search landing (same entry as 1.1), fill `input-search` with `jokowi` and press Enter.
    - expect: URL matches `/\/search\/jokowi$/` and `story-result-card` first is visible.
    - expect: `page.getByTestId('right-add-on')` (clear button) is visible.
  2. Click `page.getByTestId('right-add-on')`.
    - expect: URL matches `/\/search$/`.
    - expect: `input-search` has value `''` and is focused (`toBeFocused()`).
    - expect: `right-add-on` count is 0.
    - expect: `popular-search-section` is visible; `story-result-card` count is 0.
    - expect (desktop only): `page-title` has text `Pencarian`.
  3. Press Enter in the empty input (`await page.getByTestId('input-search').press('Enter')`).
    - expect: URL still matches `/\/search$/` (no search runs).
    - expect: `popular-search-section` still visible, `story-result-card` count 0, `story-not-found` count 0.

#### 1.5. TC-SRCH-009 Opening a search result shows the same article (H1 equals the card title)

**File:** `tests/common/search/search-open-result.spec.ts`

**Steps:**
  1. Open the search landing (same entry as 1.1), fill `input-search` with `jokowi` and press Enter.
    - expect: URL matches `/\/search\/jokowi$/` and `story-result-card` first is visible.
  2. Read the first card: `const firstTitle = page.getByTestId('story-result-card').first().getByTestId('title')`; `const cardTitle = (await firstTitle.innerText()).trim()`.
    - expect: `cardTitle` is non-empty and matches `/jokowi/i`.
  3. Click `firstTitle`.
    - expect: URL matches `/^https:\/\/[^/]+\/[^/]+\/.+-[A-Za-z0-9]+$/` (article path, not /search).
    - expect: `page.getByTestId('story-title')` is visible and has text `cardTitle`.

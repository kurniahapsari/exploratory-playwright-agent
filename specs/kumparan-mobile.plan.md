# kumparan.com Mobile Guest Test Plan (Task A workbook subset, mobile)

## Application Overview

Scope: m.kumparan.com explored as a logged-out (guest) user with the `mobile-chrome` project (Pixel 7 emulation: 412x839 CSS px, device pixel ratio 2.625, touch, baseURL https://m.kumparan.com, locale id-ID, timezone Asia/Jakarta). Seed: `tests/seed.spec.ts`. Explored on 2026-10-31. This plan does two things: (1) the section "Common scenarios on mobile" records, for every scenario of `specs/kumparan-desktop.plan.md` that lives under `tests/common/`, whether it works unchanged on the mobile site and which locators or flow steps differ; (2) the Test Scenarios below add four mobile-only cases under `tests/mobile/<area>/`.

## Read this first: requested versus found
- TC-HOME-004 was requested as "the bottom navigation 'Trending' item opens /trending". m.kumparan.com has NO bottom navigation bar for a guest at the Pixel 7 viewport. Checked on `/`, `/trending`, `/search`, `/search/jokowi`, `/channel/bisnis` and an article page, at scroll top, middle, bottom and after scrolling back up: nothing nav-like is anchored to the bottom. The only bottom-anchored UI is (a) on article pages a fixed bar holding like, comment and share (`btn-like`, `btn-comment`, `share-wrapper`, no Trending item) and (b) a 1px sticky-ad strip. The "Trending" entries that do exist are `nb-trending` (in the horizontally scrollable navigation strip directly under the header: Breaking News, Video Story, Audio Story, Trending, then the channels) and `label-list-item-trending` (inside the burger sidebar, covered by TC-HOME-003). TC-HOME-004 is therefore written against `nb-trending` and retitled to say so. If a bottom navigation exists in another context (native app, logged-in user, other viewport), re-point only the click locator; every assertion after the click stays valid.

## Conventions for every test in this plan
- All desktop-plan conventions apply unchanged: import `test` and `expect` from the shared fixtures (`tests/mobile/<area>/x.spec.ts` uses `import { test, expect } from '../../fixtures';`), `testIdAttribute` is `data-qa-id` so locators are `page.getByTestId('<data-qa-id>')`, fresh guest session per test, never log in, never submit a comment or a report (never click `Laporkan`), never touch the Cloudflare Turnstile widget on /login, no hardcoded article URL (open the first story card of the homepage), do not assert on console errors, `workers` stays 2.
- File placement: scenarios valid for both sites go to `tests/common/<area>/`; mobile-only scenarios go to `tests/mobile/<area>/` (the `mobile-chrome` project ignores `desktop/`, the `desktop-chrome` project ignores `mobile/`). Areas used here: `home`, `search`, `responsive`.
- First story card on mobile: `page.getByTestId('headline-card').first().getByTestId('title')`. `news-item` does NOT exist on the mobile homepage (count 0). The first headline card is server-rendered with its real title at first paint (the `Sedang memuat` skeletons are in lower sections), but keep the guard: title visible, non-empty, no `Sedang memuat`.
- Navigation: use the default `await page.goto('/')` (waits for the `load` event). Never use `waitUntil: 'domcontentloaded'` or `'commit'` before interacting with the header: the header is server-rendered and a click on `burger-menu` right after `domcontentloaded` was silently lost in 4 of 5 loads, whereas after `load` it opened in 16 of 16 loads.
- Playwright visibility is not the same as on-screen for off-canvas UI: the closed burger sidebar keeps `visibility: visible` and a non-empty box at x -280..0, so `isVisible()` is true while it is closed. Use `toBeInViewport()` / `not.toBeInViewport()` for open/closed state of the sidebar (verified: every sidebar item has intersection ratio 0 when closed and 1 when open).
- Several H1 headings are `display: none` on mobile (SEO-only): the `/trending` H1 `Trending`, the search results H1 `Hasil Pencarian`, and the homepage H1. `toBeVisible()` and `getByRole('heading')` do not find them. Assert them with `await expect(page.locator('h1')).toHaveText('...')` (works on hidden elements) and never with `toBeVisible()`.
- Video Story promo modal (mobile only): a full-viewport overlay with the text `Video Story / Nikmati informasi menarik dan lengkap dalam format video vertical!` and a button `Jelajahi Sekarang` appears after real scrolling (observed in a fresh context: homepage on the first wheel scroll after about 6 to 8 seconds on the page; article page after about 7 wheel steps, close to the article end; not seen after 8 to 10 seconds of idling). It blocks clicks (a trial click on `burger-menu` fails while it is shown), its container has no data-qa-id, and it is shown only once per browser storage. The shared fixture handles only `otp-ads-close-modal-btn`, not this one. Any mobile test that scrolls with the mouse wheel should register, before scrolling: `const promoCta = page.getByRole('button', { name: 'Jelajahi Sekarang' }); const promoClose = page.locator("div:has(> * button:has-text('Jelajahi Sekarang'))").locator('button:has([data-qa-id="close"])'); await page.addLocatorHandler(promoCta, () => promoClose.click());` (verified in exploration: the `promoClose` locator resolves to exactly 1 button, clicking it removes the overlay and header clicks work again). Recommended: add this handler to the `page` fixture in `tests/fixtures.ts` so common and mobile specs both get it. Not fully characterised: one run that scrolled only with `scrollIntoViewIfNeeded` did not show it, but that run reused a storage-cleared context, so treat programmatic scrolling as unproven either way.
- Article URLs are rewritten while scrolling on mobile: `<article>` becomes `<article>/1`, `/2`, `/3`, `/4`, and finally `<article>/full` (observed while scrolling a single article). Assert the article URL only right after the click from the homepage, never after scrolling.

## data-qa-id inventory (verified on m.kumparan.com, mobile, guest)
Header (all pages; one sticky header: a 64px top bar plus a navigation strip)
- `burger-menu` (button that opens the sidebar; 40x40 at the top-left; inner icon `hamburger-menu`), `hd-logo` (1 element on mobile, a full-width 412x64 wrapper around the logo link to `/`; desktop has 2), `hd-search` (link, href `/search`, 40x40, inner icon `search`), `hd-notification` (link `/notifications`). The mobile header has NO `input-search`, `hd-login`, `hd-home`, `hd-theme`, `create-story`, `main-menu`.
- Navigation strip (scrolls horizontally, so later items are partly off-screen; Playwright auto-scrolls on click): `nb-top-news` (Breaking News, /breakingnews), `nb-video-story` (Video Story, no href), `nb-audio-story` (/audio-story), `nb-trending` (Trending, href `/trending`), then 10 channel links that all share `topnav` (News, Bisnis, Tekno, Entertainment, Otomotif, Food & Travel, Bola & Sports, Woman, Mom, Bolanita), e.g. `page.getByTestId('topnav').filter({ hasText: /^Bisnis$/ })` has href `/channel/bisnis`.
Burger sidebar (always in the DOM, parked off-canvas; region `page.getByRole('region', { name: 'navigation side' })` is a `<section>` without data-qa-id)
- Heading `Menu` (h2), `close-sidebar` (button 32x32 at x 227, y 8 when open, inner icon `close`; the id `close` is also used by the sticky-ad close button and the promo modal, so never use `getByTestId('close')` unscoped), `anchor-login-wrapper` (li) containing `label-list-item-masuk` (an `<a>` without href, text `Masuk`), `label-list-item-berlangganan` (/subscription), `list-item-card` (3: Mode Gelap toggle, Informasi Kerja Sama, ...), `label-list-item-beranda` (href `/`), `label-list-item-video story` (/video-story), `label-list-item-audio story` (/audio-story), `label-list-item-trending` (href `/trending`), `label-list-item-kabar daerah`, `label-list-item-galeri foto`, `label-list-item-opini & cerita`, `label-list-item-peringkat penulis`, channel items `label-list-item-<channel>`, social links `label-list-item-instagram|facebook|tiktok|youtube|whatsapp|x`. Some ids contain spaces or ampersands (use the exact string). Pinned-topic entries (`label-list-item-sumatera pulih ` with a trailing space, `label-list-item-green initiative`) are editorial and change: never rely on them. Open sidebar geometry (839px high viewport): `Masuk` y 48, `Beranda` y 274, `Trending` y 554, each 280x56, backdrop `rgba(0,0,0,0.5)` full screen without data-qa-id (exists only while open).
Homepage `/`
- `main-content` (MAIN; there is NO `main-section`), `homepage`, `headline-carousel` > `carousel-slide` (5) > `headline-card` (5, a horizontal carousel, 272px wide each; only the first is fully on screen) each with `image`, `title`, `avatar`, `author-name`, `verified-round`, `card-footer-date`; `promoted-links-section` > `promoted-topic` (3), `polling-section` > `polling-card` (6), `video-story-section` > `video-story-card` (10), `trending-section` > `trending-story-item` (5, rendered lazily), lazily rendered `news-card` feed. NO `news-item` on the homepage.
Search landing `/search` (reached from `hd-search`)
- `input-search` (text input, placeholder `Cari di sini...`, empty, autofocused on arrival), `left-add-on` (search icon), `popular-search-section` (label `Pencarian populer`) > `popular-list` (10 links, href `/search/<term>`; terms rotate, observed `projo`, `budi arie`, `google`). No result cards and no `story-not-found` here.
Search results `/search/<query>`
- `input-search` (keeps the query; `right-add-on` with `x-circle` clear icon), H1 `Hasil Pencarian` (hidden, NO `page-title`), tabs `tab-story` (Konten), `tab-video-story`, `tab-kumparan_plus`, `tab-topic`, `tab-user`, `tab-publisher`, sort `relevant-active` (Relevansi) and `newest-non-active` (Terbaru), `story-result-card` (10) each with `title`, `avatar`, `author-name`, `verified-round`, `card-footer-date`, `image`; `ft-loadmore` (button); empty state `story-not-found` (texts `Story tidak ditemukan` and `Sudah benarkah story yang dicari?` have no data-qa-id; contains an `image`).
Trending `/trending` (title `Kumpulan Berita Trending dalam Minggu Ini - kumparan`)
- H1 `Trending` (hidden, no data-qa-id), `tab-semua` (Semua), `tab-item` (10 channel chips: News, Entertainment, Mom, Food & Travel, Tekno, Otomotif, Woman, Bola & Sports, Bisnis, Bolanita), `trending-stories-card` (1) > `news-item` (10) each with `title`, `avatar`, `author-name`, `verified-round`, `card-footer-date`, `image`, plus `loading-dot` (1).
Channel `/channel/bisnis` (recorded for reference only; title `Berita Bisnis Hari Ini Terkini - kumparan`)
- NO `channel-title` and no H1; `headline-card` (5), `trending-story-item` (5), `news-item` (10), `channel-feed-section`, `form-select`.
Article
- Same ids as desktop: `story-title` (the only H1, visible), `story-author` (a `<header>`), `author-name`, `channel-name` (News, /channel/news), `home-breadcrumb`, `publish-date` (`31 Oktober 2026 20:41 WIB`), `reading-time`, `article-main`, `story-paragraph` (17), `image-figure`, `story-footer`, `tag-topic`, `btn-organisation-info`, `btn-report` (`Laporkan tulisan`, href `/report/story/<slug>`). Mobile specifics: `btn-like`, `btn-comment` (href `/<publisher>/response/<slug>`) and `share-wrapper` (`sosmed-instagram-circle`, `sosmed-whatsapp-white`, `copy-circle`, `more-vertical`, all visible) sit in a FIXED bottom `<aside>` (y about 782 of 839, always on screen, no scrolling needed); `story-page-0..N` pagination wrappers; `end_of_article`; `google-add-preference-view` chip row.
Share dialog (opened by `share-wrapper > more-vertical`): identical to desktop (`modal`, `title` Bagikan, `btn-close-modal`, `share-whatsapp`, `share-fb`, `share-twitter`, `share-line`, `share-copy-clipboard`, captions once each, `btn-report` Laporkan Tulisan).
Report form (after clicking `Laporkan tulisan`)
- URL becomes `https://m.kumparan.com/report/story/<slug>`; `radio-btn-option-report-0..5` (labels), `btn-cancel` (Batal), `btn-report` (Laporkan, disabled until a reason is chosen: DO NOT CLICK), `news-item` > `title`, `author-name`, `image`, `verified-round`; text `Laporkan Konten` and the description line (no data-qa-id). There is NO `main-section`; use `main-content`.
Login `/login`
- Same as desktop (`input-email`, `input-password`, `input-email-errorMessage`, `input-password-errorMessage`, `btn-save` disabled, `btn-forgot-password`, `btn-login-fb`, `btn-login-google`, `btn-login-phone`, `btn-register`, `eye` icon). The only `Masuk` entry points on mobile are inside the sidebar (`label-list-item-masuk`) and the form button `btn-save`.
404 page
- `not-found-page`, `back-to-home` (Lihat konten lain, href `/`); HTTP 404. The header shows `burger-menu` and `hd-search` but NO `input-search`.

## Common scenarios on mobile (tests/common/ from specs/kumparan-desktop.plan.md, verified on m.kumparan.com)
Summary of the 12 common scenarios: 2 work unchanged (AUTH-006, AUTH-007); 3 work after only the first-card locator change (HOME-005, ART-001, AUTHZ-001); 7 need more (HOME-001, SRCH-001, SRCH-002, SRCH-003, ART-004, RPT-001, RPT-002). Nothing was found that makes a common scenario impossible on mobile. Locators that work on BOTH sites: first story card `page.getByTestId('headline-card').first().getByTestId('title')` (the desktop inventory lists `headline-card` with `title` inside; I did not re-verify desktop); main container `page.getByTestId(isMobile ? 'main-content' : 'main-section')`; search results heading `page.locator('h1')` with `toHaveText('Hasil Pencarian')`; search entry `if (isMobile) await page.getByTestId('hd-search').click();` followed by the shared `input-search` steps; header sanity on error pages `isMobile ? hd-search : input-search`.

| Scenario and common file | Mobile result | Differences and required changes |
| --- | --- | --- |
| TC-HOME-001 `tests/common/home/homepage-core-sections.spec.ts` | Needs changes | (a) `input-search` does not exist on `/` (count 0): branch on `isMobile` and assert `hd-search` visible with href `/search` plus `burger-menu` visible; the placeholder `Cari di sini...` and empty-value checks move to the `/search` landing (see TC-SRCH-008). (b) `news-item` does not exist on `/`: use `headline-card` (mobile 5, desktop 9 per the desktop inventory) with its `title`, `image`, `author-name` (kumparanNEWS), `card-footer-date` (for example `42 menit`); the at-least-2 check passes with 5. (c) `hd-logo` count is 1 (desktop 2): `.first()` still works, element visible. Page title `kumparan.com - Bicara Fakta Lewat Berita` is identical. |
| TC-HOME-005 `tests/common/home/open-story-card.spec.ts` | Works after one change | Replace `news-item` with `headline-card`. Verified: URL matches `/^https:\/\/[^/]+\/[^/]+\/.+-[A-Za-z0-9]+$/` right after the click, `story-title` equals the card title and is the only H1, document title is `<title> \| kumparan.com`. |
| TC-SRCH-001 `tests/common/search/search-jokowi-results.spec.ts` | Needs a flow change | The search box is not in the mobile header: on `/` click `hd-search` (URL `/search`), then click, fill and press Enter on `input-search` (URL `/search/jokowi`). `page-title` does not exist and the H1 is hidden: use `await expect(page.locator('h1')).toHaveText('Hasil Pencarian')`. Everything else verified identical: input keeps `jokowi`, 10 `story-result-card`, all 10 titles match `/jokowi/i`, `tab-story` text Konten, `relevant-active` text Relevansi, 0 `story-not-found`. |
| TC-SRCH-002 `tests/common/search/search-no-match-empty-state.spec.ts` | Needs a flow change | Same entry flow and same `page-title` replacement. Verified: `story-not-found` visible with both texts, 0 `story-result-card`, input keeps `zxqvbnmlkjhg12345`, `tab-story` visible. |
| TC-SRCH-003 `tests/common/search/search-script-injection-is-text.spec.ts` | Needs a flow change | Same entry flow and `page-title` replacement. Step 5 queries `[data-qa-id="main-section"]`, which does not exist on mobile (the evaluate would throw on null): use `main-content` on mobile. Verified: URL `/search/%3Cscript%3Ealert(1)%3C%2Fscript%3E`, empty state, input keeps the literal text, no dialog, 0 injected `<script>` elements. |
| TC-ART-001 `tests/common/article/article-page-content.spec.ts` | Works after the first-card change | Verified: `story-title` (only H1), `channel-name` News with href `/channel/news`, `story-author` > `author-name`, `publish-date` text `31 Oktober 2026 20:41 WIB`, `article-main`, 17 `story-paragraph`, `btn-like` text 0, `btn-comment` text 0 with href containing `/response/`, `share-wrapper` with visible `sosmed-whatsapp-white`, `copy-circle`, `more-vertical`. Mobile extras: the like/comment/share bar is fixed at the bottom and visible without scrolling, and `share-wrapper` also holds `sosmed-instagram-circle`. Do not assert the URL after scrolling (URL rewriting). |
| TC-ART-004 `tests/common/article/article-unknown-url-404.spec.ts` | Works except step 4 | Verified: status 404, URL unchanged, `not-found-page` with both texts, `back-to-home` (Lihat konten lain, href `/`), 0 `story-title`. Step 4 asserts `input-search` visible, which is not rendered on the mobile 404 page: assert `hd-search` and `burger-menu` visible instead. |
| TC-AUTHZ-001 `tests/common/authz/guest-like-redirects-to-login.spec.ts` | Works after the first-card change | Verified: `btn-like` (in the fixed bottom bar) visible and enabled with text 0; click goes to `https://m.kumparan.com/login`; `input-email`, `input-password` visible, `btn-save` disabled, hint text `Login dulu biar bisa komen, ...` visible. |
| TC-AUTH-006 `tests/common/auth/login-invalid-email.spec.ts` | Works unchanged | Verified: no errors before interaction, `bukan-email` plus Tab shows `Harus diisi dengan format email`, `btn-save` still disabled, no password error, URL stays `/login`. |
| TC-AUTH-007 `tests/common/auth/login-empty-fields.spec.ts` | Works unchanged | Verified: click email, Tab, Tab (focus passes through the password field to the show/hide-password button, which blurs the field) shows `Tidak boleh kosong` twice; `btn-save` text Masuk and disabled. |
| TC-RPT-001 `tests/common/report/report-form-options.spec.ts` | Needs changes | (a) first-card locator `headline-card`. (b) URL: scrolling the article to its footer already rewrites the URL to `<article>/full` BEFORE the report link is clicked, and on mobile clicking `story-footer > btn-report` navigates to `https://m.kumparan.com/report/story/<slug>` (the same value as the link href), not `<article>/full`. The desktop assertion `toHaveURL(/\/full$/)` would pass early on the stale scrolled URL and prove nothing. Wait for the form first (`radio-btn-option-report-0` visible), then branch on `isMobile`: mobile `toHaveURL(/\/report\/story\/.+/)`, desktop `/\/full$/`. (c) `main-section` does not exist: use `main-content` for the reported-article card (`news-item` > `title` equals `cardTitle`, verified). (d) Verified identical: link text `Laporkan tulisan`, href starts with `/report/story/`, texts `Laporkan Konten` and the description, 6 reasons with the same labels and all unchecked, `btn-cancel` Batal enabled, `btn-report` Laporkan disabled. (e) Reaching the article footer by wheel scrolling may show the Video Story promo modal in a fresh context and block the link click: register the locator handler described in Conventions. |
| TC-RPT-002 `tests/common/report/report-reason-selection.spec.ts` | Needs changes | Same changes as TC-RPT-001 (first-card locator, URL expectation `/report/story/<slug>` instead of `/full` for the final check, promo handler). Verified: choosing reason 0 checks only reason 0 and enables `btn-report`; choosing reason 1 unchecks reason 0 (exclusive) and `btn-report` stays enabled. Nothing was submitted. |

Desktop-only scenarios, checked for information (not part of the common set):
- TC-SHR-003 (share dialog) works on mobile with the same locators and values (`share-wrapper > more-vertical` opens `modal` titled `Bagikan`, five share buttons, captions WhatsApp, Facebook, X, Line, Salin once each, `btn-report` Laporkan Tulisan, `btn-close-modal` closes it, URL and `story-title` unchanged). It can be promoted to `tests/common/share/`.
- TC-HOME-002 (channel bar) has a mobile equivalent but different locators: `topnav` items instead of `main-menu`, and on the Bisnis channel page there is no `channel-title` and no H1. Title `Berita Bisnis Hari Ini Terkini - kumparan` is identical. Not authored here because it was not requested.

## Observed behaviours worth knowing (mobile)
- Hydration race on the header: a click on `burger-menu` immediately after `domcontentloaded` is lost (4 of 5 loads); after the `load` event it worked every time (16 of 16). Plain `<a href>` header links (`hd-search`, `nb-trending`) work even before hydration because they are real links.
- The burger sidebar is pre-rendered off-canvas, so DOM presence and Playwright visibility say nothing about open or closed: use viewport intersection.
- `/search` autofocuses `input-search` on arrival (informational; tests still click the input before typing).
- Search is client-side: pressing Enter navigates to `/search/<url-encoded query>` and the input keeps the typed text (same as desktop).
- Overflow measurement pitfall (used by TC-RSP-001): `body` has `overflow-x: hidden` and the article container clips its children. A 600px-wide element injected INSIDE `article-main` did not change `document.documentElement.scrollWidth` (stayed 412) or `window.scrollX`, so document-level checks alone give a false pass. The same element injected outside the clipped container made mobile Chrome widen the layout viewport (`window.innerWidth` 412 to 600, `scrollWidth` 600). On a real article page only four elements exceed 412px, all by design inside clipped horizontal carousels (the `Ikuti kumparan di Google` chip row, right edge 418, and the related-stories carousel in `below-article-section`, right edge 432); nothing inside `article-main` does.
- Ads and analytics are blocked by the fixture, so the overflow check measures the site's own layout, not ad slots.

## Test Scenarios

### 1. Home (mobile only)

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-HOME-003 The burger menu opens a sidebar with Masuk, Beranda and Trending; the close button hides it

**File:** `tests/mobile/home/burger-menu-sidebar.spec.ts`

**Steps:**
  1. Navigate with the default wait: `await page.goto('/')` (waits for `load`; do NOT pass `waitUntil: 'domcontentloaded'` or `'commit'`, a burger click before hydration is silently lost). Wait for the page content: `await expect(page.getByTestId('headline-card').first().getByTestId('title')).toBeVisible()`. Define `const burger = page.getByTestId('burger-menu')`.
    - expect: `burger` is visible and enabled (a 40x40 button at the top-left of the header).
    - expect: `await expect(page).toHaveURL('https://m.kumparan.com/')`.
    - expect: `page.getByTestId('hd-search')` is visible (header rendered).
  2. Define the sidebar locators: `const masuk = page.getByTestId('label-list-item-masuk')`, `const beranda = page.getByTestId('label-list-item-beranda')`, `const trending = page.getByTestId('label-list-item-trending')`, `const closeBtn = page.getByTestId('close-sidebar')`, `const sidebar = page.getByRole('region', { name: 'navigation side' })`. Check the closed baseline.
    - expect: Each of `masuk`, `beranda`, `trending`, `closeBtn` and `sidebar` has count 1 (the sidebar is pre-rendered in the DOM, parked off-canvas at translateX(-280px)).
    - expect: `await expect(masuk).not.toBeInViewport()` and the same for `beranda`, `trending` and `closeBtn` (intersection ratio 0 observed for all four).
    - expect: Do NOT use `toBeHidden()` or `not.toBeVisible()` for the closed state: the closed sidebar keeps `visibility: visible` and a non-empty box at x -280..0, so Playwright reports it as visible (observed `isVisible()` true while closed).
  3. Click `burger`.
    - expect: `await expect(masuk).toBeInViewport()` and `await expect(masuk).toHaveText('Masuk')`.
    - expect: `beranda` is in the viewport, has text `Beranda` and attribute `href` equal to `/`.
    - expect: `trending` is in the viewport, has text `Trending` and attribute `href` equal to `/trending` (observed vertical positions y 48, 274 and 554 in an 839px viewport, all with intersection ratio 1; if the list ever grows past the fold, call `trending.scrollIntoViewIfNeeded()` before asserting).
    - expect: `sidebar.getByRole('heading', { name: 'Menu', level: 2 })` is in the viewport (`toBeInViewport()`, not just visible, because the closed sidebar also counts as visible).
    - expect: `closeBtn` is in the viewport and enabled (32x32 at about x 227, y 8).
    - expect: The URL is still `https://m.kumparan.com/` (opening the menu does not navigate).
    - expect: Locator pitfall: do not use `page.getByText('Trending')` or `getByText('Masuk')`, they match several elements (header strip item, sidebar item, homepage section title; the label, its wrapper and its text span). Use the test ids above. Do NOT click `masuk` (never log in) and do not touch the Mode Gelap switch.
  4. Click `closeBtn`.
    - expect: `masuk`, `beranda`, `trending` and `closeBtn` are all `not.toBeInViewport()` (the assertion retries through the short slide-out animation; ratio 0 observed afterwards).
    - expect: `burger` is visible and enabled and the URL is still `https://m.kumparan.com/`.
    - expect: `await page.getByTestId('headline-card').first().getByTestId('title').click({ trial: true })` succeeds, proving the semi-transparent backdrop (no data-qa-id) no longer covers the page.
  5. Click `burger` once more.
    - expect: `await expect(masuk).toBeInViewport()` again (the menu can be re-opened).
    - expect: End the test here without clicking any menu item.

#### 1.2. TC-HOME-004 The header navigation strip Trending item opens /trending with stories (no bottom navigation exists on the mobile site)

**File:** `tests/mobile/home/nav-strip-trending.spec.ts`

**Steps:**
  1. Navigate to `/` (`await page.goto('/')`) and wait until `page.getByTestId('headline-card').first().getByTestId('title')` is visible. Locate `const trendingNav = page.getByTestId('nb-trending')`. NOTE: this was requested as the bottom navigation item; no bottom navigation exists on m.kumparan.com for a guest, so the Trending item of the navigation strip under the header is used (see Read this first).
    - expect: `trendingNav` has count 1, is visible, has text `Trending` and attribute `href` equal to `/trending`.
    - expect: `await expect(page).toHaveURL('https://m.kumparan.com/')`.
  2. Click `trendingNav` (it is a real link, so it works even before hydration).
    - expect: `await expect(page).toHaveURL('https://m.kumparan.com/trending')`.
    - expect: `await expect(page).toHaveTitle('Kumpulan Berita Trending dalam Minggu Ini - kumparan')`.
    - expect: `page.locator('h1')` has count 1 and text `Trending`. The H1 is `display: none` on mobile: assert with `toHaveText('Trending')` only, never `toBeVisible()` or `getByRole('heading')`.
  3. Wait for the list: `const items = page.getByTestId('news-item')` and `await expect(items.first().getByTestId('title')).toBeVisible()`. Check the container with `page.getByTestId('trending-stories-card')`.
    - expect: `trending-stories-card` has count 1 and is visible.
    - expect: `await expect.poll(() => items.count()).toBeGreaterThanOrEqual(1)` (10 observed).
    - expect: `const titles = await items.getByTestId('title').allInnerTexts()` has the same length as `items.count()`; every title is non-empty after `trim()` and none contains `Sedang memuat`.
  4. Inspect the first story: `const first = items.first()` with `first.getByTestId('title')`, `first.getByTestId('image')`, `first.getByTestId('author-name')`, `first.getByTestId('card-footer-date')` and `first.locator('a').first()`.
    - expect: The title is visible and non-empty (observed e.g. `Budi Arie Sebut Jokowi Akan Hadir di PN Jaktim 5 November: Buktikan Ijazah Memang Asli`; do not hardcode, the list changes every few minutes).
    - expect: The image is visible, the author name is non-empty (observed `kumparanNEWS`) and the relative date is non-empty (observed `5 jam`).
    - expect: The link `href` matches `/^\/[^/]+\/.+-[A-Za-z0-9]+$/` (an article path such as `/kumparannews/<slug>-28TyLM3MirG`).
  5. Check the category chips: `page.getByTestId('tab-semua')` and `page.getByTestId('tab-item')`. Do not click any chip.
    - expect: `tab-semua` is visible with text `Semua`.
    - expect: `tab-item` count is at least 1 (10 observed: News, Entertainment, Mom, Food & Travel, Tekno, Otomotif, Woman, Bola & Sports, Bisnis, Bolanita).
    - expect: The URL is still `https://m.kumparan.com/trending`.

### 2. Search (mobile only)

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-SRCH-008 The header search icon opens /search and searching jokowi lists results

**File:** `tests/mobile/search/header-search-icon-jokowi.spec.ts`

**Steps:**
  1. Navigate to `/` (`await page.goto('/')`) and wait until `page.getByTestId('headline-card').first().getByTestId('title')` is visible. Locate `const searchIcon = page.getByTestId('hd-search')`.
    - expect: `page.getByTestId('input-search')` has count 0 (the mobile homepage has no search box; this is the flow difference from desktop).
    - expect: `searchIcon` has count 1, is visible and has attribute `href` equal to `/search`.
  2. Click `searchIcon`.
    - expect: `await expect(page).toHaveURL('https://m.kumparan.com/search')`.
    - expect: `const input = page.getByTestId('input-search')` is visible and enabled, has attribute `placeholder` equal to `Cari di sini...` and value empty (`toHaveValue('')`).
    - expect: `page.getByTestId('popular-search-section')` is visible and contains the text `Pencarian populer`.
    - expect: `page.getByTestId('popular-list')` count is at least 1 (10 observed) and the first one has an `href` starting with `/search/` (terms rotate, do not hardcode them).
    - expect: `page.getByTestId('story-result-card')` count is 0 and `page.getByTestId('story-not-found')` count is 0 (nothing searched yet).
    - expect: The input was observed autofocused on arrival; do not rely on it.
  3. Click `input`, fill `jokowi` (`await input.fill('jokowi')`) and press Enter (`await input.press('Enter')`). Nothing else is submitted.
    - expect: `await expect(page).toHaveURL('https://m.kumparan.com/search/jokowi')`.
    - expect: `await expect(page.locator('h1')).toHaveText('Hasil Pencarian')` (the H1 is `display: none` on mobile and there is no `page-title` id: do not use `toBeVisible()`, `getByRole('heading')` or `getByTestId('page-title')`).
    - expect: `input` still has value `jokowi`.
  4. Wait for the results: `const cards = page.getByTestId('story-result-card')` and `await expect(cards.first()).toBeVisible()`.
    - expect: `cards` has at least 1 element (10 observed) and `page.getByTestId('story-not-found')` has count 0.
    - expect: `cards.getByTestId('title')`, `cards.getByTestId('author-name')` and `cards.getByTestId('card-footer-date')` each have the same count as `cards`; the titles from `cards.getByTestId('title').allInnerTexts()` are all non-empty.
    - expect: At least one title matches `/jokowi/i` (all 10 observed titles do, for example `Jokowi Hadiri Konsolidasi Relawan di Solo`; the stricter every-title check is TC-SRCH-001 in tests/common, which also runs on mobile).
    - expect: The first card contains a link whose `href` matches `/^\/[^/]+\/.+-[A-Za-z0-9]+$/` (an article path); do not click it.
  5. Check the search controls: `page.getByTestId('tab-story')`, `page.getByTestId('relevant-active')` and `page.getByTestId('newest-non-active')`.
    - expect: `tab-story` is visible with text `Konten`.
    - expect: `relevant-active` is visible with text `Relevansi` (default sort) and `newest-non-active` is visible with text `Terbaru`.
    - expect: The URL is still `https://m.kumparan.com/search/jokowi`.

### 3. Responsive (mobile only)

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-RSP-001 An article page has no horizontal overflow at the phone viewport

**File:** `tests/mobile/responsive/article-no-horizontal-overflow.spec.ts`

**Steps:**
  1. Open an article without hardcoding one: `await page.goto('/')`, `const firstTitle = page.getByTestId('headline-card').first().getByTestId('title')`, `await expect(firstTitle).toBeVisible()`, then `await firstTitle.click()`.
    - expect: `await expect(page).toHaveURL(/^https:\/\/[^/]+\/[^/]+\/.+-[A-Za-z0-9]+$/)`.
    - expect: `page.getByTestId('story-title')` is visible.
  2. Check the phone viewport precondition: `const vw = page.viewportSize()!.width` and `const iw = await page.evaluate(() => window.innerWidth)`.
    - expect: `vw` is at most 480 (Pixel 7 gives 412).
    - expect: `iw` equals `vw`.
  3. Let the layout settle: register the promo-modal locator handler from Conventions first, then scroll in 700px steps with `await page.evaluate(() => window.scrollBy(0, 700))` followed by `await page.waitForTimeout(150)`, stopping as soon as `page.getByTestId('story-footer')` is inside the viewport (at most 30 iterations; about 8 to 12 were needed), then `await page.evaluate(() => window.scrollTo(0, 0))`. Do not assert on the URL here: scrolling rewrites it to `<article>/1`, `/2`, `/3`, `/4`, then `/full`.
    - expect: `page.getByTestId('story-footer')` is visible (the end of the article was reached).
    - expect: `page.getByTestId('story-paragraph')` count is at least 1 (17 observed).
    - expect: `await page.evaluate(() => window.scrollY)` is 0 after scrolling back to the top.
  4. Measure the document: `const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, bsw: document.body.scrollWidth, iw: window.innerWidth }))`.
    - expect: `m.sw` is less than or equal to `m.cw` (412 and 412 observed).
    - expect: `m.bsw` is less than or equal to `m.cw` (412 observed).
    - expect: `m.iw` equals `vw` (the layout viewport did not grow: when an element outside the clipping container overflowed in a probe, mobile Chrome widened the layout viewport from 412 to 600 and scrollWidth to 600).
    - expect: These document-level checks alone are NOT sufficient (see the guard step): the article container clips its children.
  5. Check the layout blocks with `boundingBox()` for each of these test ids: `story-title`, `story-author`, `article-main`, `story-footer`, `burger-menu`, `hd-search`, `hd-notification`, `btn-like`, `btn-comment`, `share-wrapper` (the last three live in a fixed bottom bar).
    - expect: Every box is non-null with `x >= 0` and `x + width <= vw` (observed: `article-main` x 20 width 372, `story-title` x 20 width 372, `share-wrapper` x 148 width 232, `hd-search` x 360 width 40).
    - expect: The three bar elements `btn-like`, `btn-comment` and `share-wrapper` are fully inside the viewport horizontally (right edge of `share-wrapper` observed at 380 of 412).
  6. Scan every descendant of the article body with `const offenders = await page.getByTestId('article-main').evaluate((root) => { const vw = document.documentElement.clientWidth; return [...root.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > vw + 1 || r.left < -1); }).length; })`. Also collect the media subset `article-main` `img, figure, iframe, video, table` and read each element's right edge.
    - expect: `offenders` is 0 (0 observed).
    - expect: Every media element has `right <= vw + 1` (observed 4 elements, maximum right edge 392). If the article has no media the check is vacuous: record the media count with `test.info().annotations.push({ type: 'media-count', description: String(count) })`.
    - expect: Do NOT run the same scan over the whole `main-content`: it legitimately holds two clipped horizontal carousels (the `Ikuti kumparan di Google` chip row inside `story-author`, right edge 418, and the related-stories carousel in `below-article-section`, right edge 432), which are by design and would give false failures.
  7. Guard against a vacuous pass by proving the scan can fail (local DOM change only, no network): `await page.getByTestId('article-main').evaluate((root) => { const d = document.createElement('div'); d.id = 'overflow-probe'; d.style.cssText = 'width:600px;height:10px'; root.appendChild(d); })`, rerun the descendant scan and the document measurement from the previous steps, then remove the probe with `page.locator('#overflow-probe').evaluate((e) => e.remove())`.
    - expect: The descendant scan now returns exactly 1 (the probe).
    - expect: `document.documentElement.scrollWidth` is still less than or equal to `clientWidth` (412 observed with the probe inside `article-main`), which documents why the element-level scan is required: an ancestor with overflow-x hidden swallows the overflow.
    - expect: After removing the probe the descendant scan returns 0 again.

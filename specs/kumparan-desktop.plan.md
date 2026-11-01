# kumparan.com Desktop Guest Test Plan (Task A workbook subset)

## Application Overview

Scope: kumparan.com explored as a logged-out (guest) user with the `desktop-chrome` project (Desktop Chrome, baseURL https://kumparan.com, locale id-ID, timezone Asia/Jakarta). Seed: `tests/seed.spec.ts`. Explored on 2026-10-31.

## Conventions for every test in this plan
- Import `test` and `expect` from the shared fixtures (`tests/common/<area>/x.spec.ts` and `tests/desktop/<area>/x.spec.ts` both use `import { test, expect } from '../../fixtures';`). The fixture blocks ads/analytics and auto-closes the ad modal `otp-ads-close-modal-btn`.
- `testIdAttribute` is `data-qa-id`, so every locator below is `page.getByTestId('<data-qa-id>')`. Only where an element has no data-qa-id is a role/text fallback used (marked "NO data-qa-id").
- Every test starts from a fresh guest session. Never log in, never submit a comment, never submit a report (never click the "Laporkan" button on the report form), never touch the Cloudflare "Verify you are human" (Turnstile) widget that lives on /login.
- Articles rotate every few minutes: never hardcode an article URL. Wherever an article is needed, open the first story card of the homepage feed: `page.getByTestId('news-item').first().getByTestId('title')`. Before reading the card, wait until its title text is non-empty and does not contain "Sedang memuat" (skeleton placeholder shown before hydration).
- Do not assert on console errors (the site logs many, ad-related, even on a healthy page). Production WAF can answer bursts with 403: keep `workers` at 2; one retry is configured.
- File placement: scenarios valid for both m.kumparan.com and kumparan.com go to `tests/common/<area>/`; desktop-only scenarios go to `tests/desktop/<area>/`. Classification was decided from the desktop exploration only (m.kumparan.com was NOT explored): HOME-002 (desktop channel bar) and SHR-003 (desktop share bar with the vertical-dots button) are desktop-only; all others are placed in common. The common tests use only data-qa-ids that are not desktop-layout specific, but the mobile project should be run once to confirm (use the `isMobile` fixture to branch if a locator differs).

## data-qa-id inventory (verified on kumparan.com, desktop, guest)
Header (all pages)
- `hd-logo` logo. Homepage: 2 elements share this id (a DIV wrapper and the link) so use `getByTestId('hd-logo').first()`; on article pages it is 1 element (author badge).
- `input-search` search textbox (name desktop-search, placeholder "Cari di sini..."); `search` its icon.
- `hd-login` header "Masuk" button; `create-story` "Buat Tulisan" button; `hd-home`, `hd-theme`, `hd-notification` icons.
- `main-menu` the channel bar (nav "headermain menu"). Its links (News, Bisnis, Tekno, Entertainment, Otomotif, Food & Travel, Bola & Sports, Woman, Mom, Bolanita) have NO data-qa-id: use `getByTestId('main-menu').getByRole('link', { name: 'Bisnis', exact: true })`. `more-vertical` inside it is the "Lainnya" trigger (same id as the article share-bar button, so always scope).
Homepage / channel page
- `main-section` main, `homepage` wrapper, `headline-section`, `carousel-pane` (3), `headline-card` (9), `news-item` (9, inside each headline-card), `title` (card title span, also used for other titles: always scope to a card), `image`, `avatar`, `author-name`, `verified-round`, `card-footer-date`, `trending-section`, `trending-story-item` (5), `promoted-links-section`, `promoted-topic`.
- Channel page: `channel-title` (H1, text "Bisnis").
Search results page (/search/<query>)
- `page-title` (H1 "Hasil Pencarian"), tabs `tab-story` (Konten), `tab-video-story`, `tab-kumparan_plus`, `tab-topic`, `tab-user`, `tab-publisher`, sort `relevant-active` (Relevansi) / `newest-non-active` (Terbaru), result `story-result-card` (10 per page) each containing `title`, `author-name`, `card-footer-date`; empty state `story-not-found` (text "Story tidak ditemukan" + "Sudah benarkah story yang dicari?"; the two texts have NO data-qa-id).
Article page
- `story-title` (the only H1), `story-author` (header wrapper), `author-name`, `channel-name` (breadcrumb link, href /channel/<slug>), `home-breadcrumb`, `publish-date` (`<time>`, text like "31 Oktober 2026 20:41 WIB"), `reading-time`, `article-main` (body container), `story-paragraph` (many), `image-figure`, `btn-like` (button, text = count), `btn-comment` (link to /<publisher>/response/<slug>), `share-wrapper` containing `sosmed-whatsapp-white`, `copy-circle`, `more-vertical`; `story-footer` (tags + links), `tag-topic`, `btn-organisation-info`, `btn-report` ("Laporkan tulisan" link, inside `story-footer`).
Share dialog ("Bagikan")
- `modal` > `modal-header` > `title` ("Bagikan"); `btn-close-modal`; `content`; buttons `share-whatsapp`, `share-fb`, `share-twitter`, `share-line`, `share-copy-clipboard`; their captions "WhatsApp", "Facebook", "X", "Line", "Salin" have NO data-qa-id (use text inside `modal`); `btn-report` ("Laporkan Tulisan" link inside `modal`).
Report form (after clicking "Laporkan tulisan"; the app navigates to `<article-path>/full`)
- Heading "Laporkan Konten" and description "Tim kumparan akan menggunakan laporan kamu untuk melakukan pengecekan terhadap konten ini." have NO data-qa-id (use getByText). `radio-btn-option-report-0` .. `radio-btn-option-report-5` are the six `<label>` options (each wraps an `<input type=checkbox>` with NO data-qa-id: `getByTestId('radio-btn-option-report-N').getByRole('checkbox')`), `btn-cancel` ("Batal"), `btn-report` ("Laporkan", a button, disabled until a reason is chosen: DO NOT CLICK). `news-item` + `title` + `author-name` show the reported article.
Login page (/login)
- `input-email`, `input-password`, `input-email-errorMessage`, `input-password-errorMessage` (only rendered when invalid), `btn-save` (the form's "Masuk" submit button, disabled initially; different from header `hd-login` that has the same text), `btn-forgot-password`, `btn-login-fb`, `btn-login-google`, `btn-login-phone`, `btn-register`. The password show/hide button has no data-qa-id (inner icon `eye`). Page heading "Masuk" and the line "Login dulu biar bisa komen, bikin konten, ..." have NO data-qa-id. A hidden input `cf-turnstile-response` exists: leave it alone.
404 page
- `not-found-page` (text "Maaf, halaman tidak ditemukan" / "Tapi tenang, masih banyak konten menarik lainnya"; texts have NO data-qa-id), `back-to-home` (link "Lihat konten lain", href "/"). HTTP status is 404.

## Observed behaviours worth knowing
- Clicking "Laporkan tulisan" does not stay on /report/story/<slug>: the URL becomes `<article-path>/full` and a report form replaces the article.
- Report reasons use checkbox inputs but behave like radio buttons (choosing another reason unchecks the previous one).
- The header "Masuk" button (`hd-login`) is disabled while the page skeleton is shown and becomes enabled after hydration.
- Search is client-side: submitting the header input with Enter navigates to /search/<url-encoded query> and the input keeps the typed text.

## Test Scenarios

### 1. Home

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-HOME-001 Homepage loads its core sections (logo, search input, story cards)

**File:** `tests/common/home/homepage-core-sections.spec.ts`

**Steps:**
  1. Navigate to `/` as a guest (`page.goto('/')`).
    - expect: The URL is the site root.
    - expect: The page title is `kumparan.com - Bicara Fakta Lewat Berita` (`await expect(page).toHaveTitle(...)`).
  2. Locate the logo with `page.getByTestId('hd-logo').first()` (two elements share this id on the homepage, so `.first()` is required to avoid a strict-mode violation).
    - expect: The logo is visible in the header.
  3. Locate the search box with `page.getByTestId('input-search')`.
    - expect: It is visible and enabled.
    - expect: It has attribute `placeholder` equal to `Cari di sini...`.
    - expect: Its value is an empty string (`toHaveValue('')`).
  4. Wait for the feed to hydrate: `const firstCard = page.getByTestId('news-item').first()`; `const firstTitle = firstCard.getByTestId('title')`.
    - expect: `page.getByTestId('news-item')` has at least 1 element (9 observed).
    - expect: `firstTitle` is visible, its text is non-empty and does not contain `Sedang memuat`.
  5. Inspect the first story card using `firstCard.getByTestId('image')`, `firstCard.getByTestId('author-name')` and `firstCard.getByTestId('card-footer-date')`.
    - expect: The card image is visible.
    - expect: The author name is non-empty (observed `kumparanNEWS`).
    - expect: The relative date is non-empty (observed `29 menit`).
  6. Check that the feed holds more than one story: count `page.getByTestId('news-item')`.
    - expect: The count is at least 2 (9 observed), i.e. the feed shows several story cards, not a single one.

#### 1.2. TC-HOME-005 Opening a story card shows the same article (H1 equals the card title)

**File:** `tests/common/home/open-story-card.spec.ts`

**Steps:**
  1. Navigate to `/` and wait for the first card: `const firstTitle = page.getByTestId('news-item').first().getByTestId('title')`.
    - expect: `firstTitle` is visible and its text does not contain `Sedang memuat`.
  2. Read and store the card title: `const cardTitle = (await firstTitle.innerText()).trim()`. Do NOT hardcode any article title or URL.
    - expect: `cardTitle` is a non-empty string (observed e.g. `Kawal Kebutuhan Daerah: Satgas PRR Siap Tuntaskan Hambatan Anggaran 2026`).
  3. Click `firstTitle`.
    - expect: The browser navigates away from `/` to an article URL matching `/^https:\/\/[^/]+\/[^/]+\/.+-[A-Za-z0-9]+$/` (observed `/kumparannews/<slug>-28U2Lqfg5QY`), asserted with `await expect(page).toHaveURL(...)`.
    - expect: `page.getByTestId('story-title')` becomes visible.
  4. Compare the article heading with the card: `page.getByTestId('story-title')` (it is the `<h1>`; also check `page.getByRole('heading', { level: 1 })`).
    - expect: `page.getByTestId('story-title')` has text equal to `cardTitle` (`toHaveText(cardTitle)`, which normalizes whitespace).
    - expect: `page.getByRole('heading', { level: 1 })` has count 1 and the same text.
    - expect: The document title contains `cardTitle` (observed format `<title> | kumparan.com`).

#### 1.3. TC-HOME-002 Desktop channel bar: clicking "Bisnis" opens /channel/bisnis with stories

**File:** `tests/desktop/home/channel-bar-bisnis.spec.ts`

**Steps:**
  1. Navigate to `/` and locate the channel bar `page.getByTestId('main-menu')`.
    - expect: The channel bar is visible.
  2. Locate the Bisnis link: `page.getByTestId('main-menu').getByRole('link', { name: 'Bisnis', exact: true })` (channel links have NO data-qa-id; they are named `Loading` until the menu hydrates, so rely on auto-waiting).
    - expect: The link is visible.
    - expect: It has attribute `href` equal to `/channel/bisnis`.
  3. Click the Bisnis link.
    - expect: `await expect(page).toHaveURL('https://kumparan.com/channel/bisnis')` (or `/\/channel\/bisnis$/`).
    - expect: The page title is `Berita Bisnis Hari Ini Terkini - kumparan`.
  4. Check the channel heading `page.getByTestId('channel-title')`.
    - expect: It is visible and has text `Bisnis` (it is the `<h1>`).
  5. Check the channel stories: `page.getByTestId('headline-card')` and `page.getByTestId('trending-story-item')`.
    - expect: `headline-card` count is at least 1 (9 observed).
    - expect: `page.getByTestId('headline-card').first().getByTestId('title')` is visible with non-empty text.
    - expect: `trending-story-item` count is at least 1 (5 observed).

### 2. Search

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-SRCH-001 Searching "jokowi" lists results whose titles mention Jokowi

**File:** `tests/common/search/search-jokowi-results.spec.ts`

**Steps:**
  1. Navigate to `/`, click `page.getByTestId('input-search')`, fill `jokowi` and press Enter.
    - expect: `await expect(page).toHaveURL(/\/search\/jokowi$/)`.
    - expect: `page.getByTestId('page-title')` has text `Hasil Pencarian`.
    - expect: `page.getByTestId('input-search')` still has value `jokowi`.
  2. Wait for the results list: `const cards = page.getByTestId('story-result-card')`.
    - expect: `cards` has at least 1 element (10 observed on the first page).
    - expect: `page.getByTestId('story-not-found')` has count 0.
  3. Read all result titles with `cards.getByTestId('title').allInnerTexts()`.
    - expect: The title count equals the number of cards.
    - expect: Every title matches `/jokowi/i` (all 10 observed titles do, e.g. `Jokowi Hadiri Konsolidasi Relawan di Solo`).
  4. Check the search controls: `page.getByTestId('tab-story')` and `page.getByTestId('relevant-active')`.
    - expect: `tab-story` is visible with text `Konten`.
    - expect: `relevant-active` is visible with text `Relevansi` (default sort is relevance).

#### 2.2. TC-SRCH-002 Searching "zxqvbnmlkjhg12345" shows the empty state "Story tidak ditemukan"

**File:** `tests/common/search/search-no-match-empty-state.spec.ts`

**Steps:**
  1. Navigate to `/`, fill `page.getByTestId('input-search')` with `zxqvbnmlkjhg12345` and press Enter.
    - expect: `await expect(page).toHaveURL(/\/search\/zxqvbnmlkjhg12345$/)`.
    - expect: `page.getByTestId('page-title')` has text `Hasil Pencarian`.
  2. Check the empty state container `page.getByTestId('story-not-found')`.
    - expect: It is visible.
    - expect: `page.getByTestId('story-not-found').getByText('Story tidak ditemukan')` is visible (the text has no data-qa-id).
    - expect: `page.getByTestId('story-not-found').getByText('Sudah benarkah story yang dicari?')` is visible.
  3. Check that no results are rendered: `page.getByTestId('story-result-card')`.
    - expect: The count is 0.
  4. Check that the search UI is still usable: `page.getByTestId('input-search')` and `page.getByTestId('tab-story')`.
    - expect: The search input still has value `zxqvbnmlkjhg12345`.
    - expect: The `Konten` tab is still visible.

#### 2.3. TC-SRCH-003 Searching "<script>alert(1)</script>" is treated as text (no dialog, empty state)

**File:** `tests/common/search/search-script-injection-is-text.spec.ts`

**Steps:**
  1. Navigate to `/` and register a dialog listener BEFORE searching: `const dialogs: string[] = []; page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });`.
    - expect: The home page is loaded and `page.getByTestId('input-search')` is visible.
  2. Fill `page.getByTestId('input-search')` with the literal text `<script>alert(1)</script>` and press Enter.
    - expect: The URL path is `/search/` followed by the URL-encoded query (observed `/search/%3Cscript%3Ealert(1)%3C%2Fscript%3E`): `expect(decodeURIComponent(new URL(page.url()).pathname)).toBe('/search/<script>alert(1)</script>')`.
    - expect: `page.getByTestId('page-title')` has text `Hasil Pencarian`.
  3. Check the empty state: `page.getByTestId('story-not-found')`.
    - expect: It is visible and contains the text `Story tidak ditemukan`.
    - expect: `page.getByTestId('story-result-card')` count is 0.
  4. Check that the payload was kept as plain text: `page.getByTestId('input-search')`.
    - expect: Its value is exactly `<script>alert(1)</script>`.
  5. Check that nothing was executed or injected: wait about 1 second (`page.waitForTimeout(1000)`), then evaluate `[...document.querySelectorAll('script')].filter(s => s.textContent?.trim() === 'alert(1)').length` and `document.querySelector('[data-qa-id="main-section"]').querySelectorAll('script').length`.
    - expect: `dialogs` is empty (no alert dialog fired).
    - expect: No `<script>` element whose content is `alert(1)` exists (0 observed).
    - expect: `main-section` contains 0 `<script>` elements.

### 3. Article

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-ART-001 Article page shows title, channel, author, publish date (WIB), body and the like/comment/share bar

**File:** `tests/common/article/article-page-content.spec.ts`

**Steps:**
  1. Navigate to `/`, wait for `page.getByTestId('news-item').first().getByTestId('title')` to be hydrated (non-empty, no `Sedang memuat`), store its text as `cardTitle`, then click it. Never hardcode an article URL.
    - expect: The URL changes to an article path `/<publisher>/<slug>-<id>`.
    - expect: `page.getByTestId('story-title')` is visible.
  2. Check the title: `page.getByTestId('story-title')`.
    - expect: It has text equal to `cardTitle`.
    - expect: It is the only `<h1>` (`page.getByRole('heading', { level: 1 })` count is 1).
  3. Check the channel: `page.getByTestId('channel-name')` (breadcrumb link).
    - expect: It is visible with non-empty text (observed `News`).
    - expect: Its `href` matches `/^\/channel\/[a-z0-9-]+$/`.
  4. Check the author: `page.getByTestId('story-author').getByTestId('author-name')`.
    - expect: It is visible with non-empty text (observed `kumparanNEWS`).
  5. Check the publish date: `page.getByTestId('publish-date')` (a `<time>` element with aria-label `publish date`).
    - expect: It is visible.
    - expect: Its text matches `/^\d{1,2} \p{L}+ \d{4} \d{2}:\d{2} WIB$/u` (observed `31 Oktober 2026 20:41 WIB`), i.e. the time zone suffix is WIB.
  6. Check the body: `page.getByTestId('article-main')` and `page.getByTestId('story-paragraph')`.
    - expect: `article-main` is visible.
    - expect: `story-paragraph` count is at least 1 (17 observed).
    - expect: The first paragraph has more than 0 characters of text (217 observed).
  7. Check the engagement bar: `page.getByTestId('btn-like')`, `page.getByTestId('btn-comment')`, `page.getByTestId('share-wrapper')`.
    - expect: `btn-like` is visible and enabled, and its text is non-empty (count, `0` observed).
    - expect: `btn-comment` is visible, its text is non-empty and its `href` contains `/response/`.
    - expect: `share-wrapper` is visible and contains visible `sosmed-whatsapp-white`, `copy-circle` and `more-vertical` (scope: `page.getByTestId('share-wrapper').getByTestId('more-vertical')`).

#### 3.2. TC-ART-004 An unknown article URL shows the 404 page "Maaf, halaman tidak ditemukan"

**File:** `tests/common/article/article-unknown-url-404.spec.ts`

**Steps:**
  1. Navigate to a URL that cannot exist, e.g. `const response = await page.goto('/kumparannews/artikel-yang-tidak-pernah-ada-zzzzzz-28Uxxxxxxxx')` (this is deliberately a non-existent article, not a real one).
    - expect: `response.status()` is 404.
    - expect: The URL remains the requested one (no redirect to `/`).
  2. Check the not-found block: `page.getByTestId('not-found-page')`.
    - expect: It is visible.
    - expect: It contains the text `Maaf, halaman tidak ditemukan` (`page.getByTestId('not-found-page').getByText('Maaf, halaman tidak ditemukan')`, text has no data-qa-id).
    - expect: It contains the text `Tapi tenang, masih banyak konten menarik lainnya`.
  3. Check the recovery link: `page.getByTestId('back-to-home')`.
    - expect: It is visible with text `Lihat konten lain`.
    - expect: Its `href` is `/`.
  4. Check that no article is rendered and the site chrome is intact: `page.getByTestId('story-title')`, `page.getByTestId('input-search')`.
    - expect: `story-title` count is 0.
    - expect: `input-search` is visible (header still rendered).

### 4. Authorization

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-AUTHZ-001 A guest clicking Like on an article is redirected to /login

**File:** `tests/common/authz/guest-like-redirects-to-login.spec.ts`

**Steps:**
  1. Navigate to `/`, wait for the first card (`page.getByTestId('news-item').first().getByTestId('title')` hydrated) and click it. Never hardcode an article URL.
    - expect: An article page opens: `page.getByTestId('story-title')` is visible.
  2. Check the like button before acting: `page.getByTestId('btn-like')`.
    - expect: It is visible and enabled (observed text `0`).
  3. Click `page.getByTestId('btn-like')` as a guest (not logged in).
    - expect: `await expect(page).toHaveURL(/\/login$/)` (observed `https://kumparan.com/login`).
  4. Check the login page: `page.getByTestId('input-email')`, `page.getByTestId('input-password')`, `page.getByTestId('btn-save')`, and `page.getByText('Login dulu biar bisa komen')` (text has no data-qa-id).
    - expect: The email and password inputs are visible.
    - expect: `btn-save` (the form's `Masuk` button) is visible and disabled.
    - expect: The hint text `Login dulu biar bisa komen, bikin konten, langganan kumparanPLUS dan atur notifikasi konten favoritmu. Yuk!` is visible.
    - expect: No login is attempted and the Cloudflare widget is not touched.

### 5. Authentication

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-AUTH-006 /login: invalid email "bukan-email" shows "Harus diisi dengan format email"

**File:** `tests/common/auth/login-invalid-email.spec.ts`

**Steps:**
  1. Navigate to `/login`.
    - expect: The URL is `/login`.
    - expect: `page.getByTestId('input-email')`, `page.getByTestId('input-password')` are visible.
    - expect: `page.getByTestId('btn-save')` is visible and disabled.
    - expect: `page.getByTestId('input-email-errorMessage')` has count 0 (no error before interaction).
  2. Fill `page.getByTestId('input-email')` with `bukan-email` and press Tab to blur the field (the validation message appears on blur; focus moves to the password field).
    - expect: `page.getByTestId('input-email')` has value `bukan-email`.
  3. Check the validation message: `page.getByTestId('input-email-errorMessage')`.
    - expect: It is visible and has text `Harus diisi dengan format email`.
  4. Check the rest of the form: `page.getByTestId('btn-save')` and `page.getByTestId('input-password-errorMessage')`. Do not type a password, do not click `Masuk`, do not interact with the Cloudflare widget.
    - expect: `btn-save` is still disabled (`toBeDisabled()`).
    - expect: `input-password-errorMessage` has count 0 (password not yet blurred).
    - expect: The URL is still `/login`.

#### 5.2. TC-AUTH-007 /login: empty email and password show "Tidak boleh kosong" and "Masuk" stays disabled

**File:** `tests/common/auth/login-empty-fields.spec.ts`

**Steps:**
  1. Navigate to `/login`.
    - expect: The URL is `/login`.
    - expect: `page.getByTestId('btn-save')` is disabled.
    - expect: `input-email-errorMessage` and `input-password-errorMessage` both have count 0.
  2. Click `page.getByTestId('input-email')`, leave it empty and press Tab (focus moves to `input-password`), then press Tab again without typing (blurs the password field).
    - expect: Both fields are still empty (`toHaveValue('')`).
  3. Check the email validation: `page.getByTestId('input-email-errorMessage')`.
    - expect: It is visible and has text `Tidak boleh kosong`.
  4. Check the password validation: `page.getByTestId('input-password-errorMessage')`.
    - expect: It is visible and has text `Tidak boleh kosong`.
  5. Check the submit button `page.getByTestId('btn-save')` (the form `Masuk`; not the header `hd-login`). Do not click it and do not interact with the Cloudflare widget.
    - expect: It has text `Masuk` and is disabled (`toBeDisabled()`).
    - expect: The URL is still `/login`.

### 6. Share

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-SHR-003 The vertical-dots button in the article share bar opens "Bagikan" with WhatsApp, Facebook, X, Line, Salin

**File:** `tests/desktop/share/share-dialog-options.spec.ts`

**Steps:**
  1. Navigate to `/`, wait for the first card (`page.getByTestId('news-item').first().getByTestId('title')` hydrated) and click it. Never hardcode an article URL.
    - expect: An article page opens: `page.getByTestId('story-title')` is visible.
    - expect: `page.getByTestId('modal')` has count 0 (no dialog yet).
  2. Click the vertical-dots icon in the share bar. It MUST be scoped because the header `Lainnya` trigger shares the id: `page.getByTestId('share-wrapper').getByTestId('more-vertical').click()`.
    - expect: `page.getByTestId('modal')` becomes visible.
  3. Check the dialog header: `page.getByTestId('modal').getByTestId('title')` and `page.getByTestId('modal').getByTestId('btn-close-modal')`.
    - expect: The title has text `Bagikan`.
    - expect: The close button is visible.
  4. Check the five share options inside `const modal = page.getByTestId('modal')`: `modal.getByTestId('share-whatsapp')`, `modal.getByTestId('share-fb')`, `modal.getByTestId('share-twitter')`, `modal.getByTestId('share-line')`, `modal.getByTestId('share-copy-clipboard')` and their captions `modal.getByText('WhatsApp', { exact: true })`, `'Facebook'`, `'X'`, `'Line'`, `'Salin'` (captions have no data-qa-id). Do not click any share button.
    - expect: All five buttons are visible and enabled.
    - expect: The captions `WhatsApp`, `Facebook`, `X`, `Line` and `Salin` are each visible exactly once.
  5. Check the extra link in the dialog: `modal.getByTestId('btn-report')` (do not click it).
    - expect: It is visible with text `Laporkan Tulisan`.
  6. Click `page.getByTestId('btn-close-modal')`.
    - expect: `page.getByTestId('modal')` has count 0 (dialog closed).
    - expect: The URL is still the article URL and `page.getByTestId('story-title')` is still visible.

### 7. Report

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-RPT-001 "Laporkan tulisan" opens the report form with 6 reasons and a disabled "Laporkan" button

**File:** `tests/common/report/report-form-options.spec.ts`

**Steps:**
  1. Navigate to `/`, wait for the first card (`page.getByTestId('news-item').first().getByTestId('title')` hydrated), store its text as `cardTitle`, then click it. Never hardcode an article URL.
    - expect: An article page opens: `page.getByTestId('story-title')` is visible.
  2. Scroll to the article footer and locate the report link: `page.getByTestId('story-footer').getByTestId('btn-report')` (scoped because `btn-report` also exists in the share dialog and on the report form).
    - expect: It is visible and has text `Laporkan tulisan`.
    - expect: Its `href` starts with `/report/story/`.
  3. Click `page.getByTestId('story-footer').getByTestId('btn-report')`.
    - expect: The report form is displayed. The URL changes to the article path followed by `/full` (`toHaveURL(/\/full$/)`; the link href itself is `/report/story/<slug>`, which the app rewrites).
    - expect: `page.getByText('Laporkan Konten')` is visible (no data-qa-id).
    - expect: `page.getByText('Tim kumparan akan menggunakan laporan kamu untuk melakukan pengecekan terhadap konten ini.')` is visible.
  4. Check the reported article card: `page.getByTestId('main-section').getByTestId('title')`.
    - expect: It has text equal to `cardTitle`.
  5. Check the reasons: `page.getByTestId(/^radio-btn-option-report-/)`.
    - expect: The count is exactly 6.
    - expect: `radio-btn-option-report-0` has text `Spam, Komersial, atau Iklan`.
    - expect: `radio-btn-option-report-1` has text `Memiliki unsur pornografi`.
    - expect: `radio-btn-option-report-2` has text `Membahayakan atau menjurus tindakan berbahaya`.
    - expect: `radio-btn-option-report-3` has text `Mengandung konten kekerasan`.
    - expect: `radio-btn-option-report-4` has text `Menyinggung SARA`.
    - expect: `radio-btn-option-report-5` has text `Lainnya`.
    - expect: For each N in 0..5 `page.getByTestId('radio-btn-option-report-' + N).getByRole('checkbox')` is NOT checked.
  6. Check the buttons: `page.getByTestId('btn-cancel')` and the form button `page.getByTestId('btn-report')` (only one `btn-report` exists on this screen). NEVER click `Laporkan`.
    - expect: `btn-cancel` is visible with text `Batal` and is enabled.
    - expect: `btn-report` is visible with text `Laporkan` and is disabled (`toBeDisabled()`).

#### 7.2. TC-RPT-002 Choosing a reason enables "Laporkan"; choosing another reason unchecks the first

**File:** `tests/common/report/report-reason-selection.spec.ts`

**Steps:**
  1. Navigate to `/`, wait for the first card hydrated, click `page.getByTestId('news-item').first().getByTestId('title')`, then click `page.getByTestId('story-footer').getByTestId('btn-report')`. Never hardcode an article URL.
    - expect: The report form is visible: `page.getByTestId('radio-btn-option-report-0')` is visible.
    - expect: `page.getByTestId('btn-report')` is disabled.
  2. Click the first reason label `page.getByTestId('radio-btn-option-report-0')` (`Spam, Komersial, atau Iklan`).
    - expect: `page.getByTestId('radio-btn-option-report-0').getByRole('checkbox')` is checked.
    - expect: The checkboxes of options 1..5 are NOT checked.
    - expect: `page.getByTestId('btn-report')` is enabled (`toBeEnabled()`).
  3. Click the second reason label `page.getByTestId('radio-btn-option-report-1')` (`Memiliki unsur pornografi`).
    - expect: `page.getByTestId('radio-btn-option-report-1').getByRole('checkbox')` is checked.
    - expect: `page.getByTestId('radio-btn-option-report-0').getByRole('checkbox')` is now NOT checked (selection is exclusive).
    - expect: The checkboxes of options 2..5 are NOT checked, so exactly one reason is selected.
    - expect: `page.getByTestId('btn-report')` is still enabled.
  4. Stop here. Do NOT click `page.getByTestId('btn-report')` (`Laporkan`); nothing may be submitted. End the test and let the fixture dispose the context.
    - expect: The URL is still the `/full` report screen and no confirmation or success message is displayed.

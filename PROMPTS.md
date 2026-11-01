# Prompts used with the Playwright Agents

The tests in this repo were planned, generated and healed by the **Playwright Test Agents** (`npx playwright init-agents --loop=claude`), running as Claude Code subagents:

| Agent | File | Job |
|---|---|---|
| planner | `.claude/agents/playwright-test-planner.md` | explores the live site through the `playwright-test` MCP browser and writes a Markdown plan to `specs/` |
| generator | `.claude/agents/playwright-test-generator.md` | replays each plan step in the browser and writes the spec file |
| healer | `.claude/agents/playwright-test-healer.md` | runs the tests, debugs failures and fixes them |

**How to reproduce:** `npm ci && npx playwright install chromium`, then start Claude Code **in this folder** (`claude`), approve the `playwright-test` MCP server from `.mcp.json`, and send the prompts below in order.

> The prompts below are the ones sent in this repo's run. Any change made during the run is noted under *As actually used*.

---

## 1. Planner — desktop

```text
Use the playwright-test-planner agent.

Explore https://kumparan.com as a logged-out (guest) user. For planner_setup_page use
project "desktop-chrome" and seed file "tests/seed.spec.ts".

Create a test plan that covers these test cases from our Task A workbook. Keep the ID at the
start of every test name (e.g. "TC-SRCH-002 search with no matches shows the empty state"):
- TC-HOME-001 Homepage loads its core sections (logo, search input, story cards)
- TC-HOME-005 Opening a story card shows the same article (H1 equals the card title)
- TC-HOME-002 Desktop channel bar: clicking "Bisnis" opens /channel/bisnis with stories
- TC-SRCH-001 Searching "jokowi" lists results whose titles mention Jokowi
- TC-SRCH-002 Searching "zxqvbnmlkjhg12345" shows "Story tidak ditemukan"
- TC-SRCH-003 Searching "<script>alert(1)</script>" is treated as text (no dialog, empty state)
- TC-ART-001 Article page shows title, channel, author, publish date (WIB), body and the like/comment/share bar
- TC-ART-004 An unknown article URL shows the 404 page "Maaf, halaman tidak ditemukan"
- TC-AUTHZ-001 A guest clicking Like on an article is redirected to /login
- TC-AUTH-006 /login: invalid email "bukan-email" shows "Harus diisi dengan format email"
- TC-AUTH-007 /login: empty email and password show "Tidak boleh kosong" and "Masuk" stays disabled
- TC-SHR-003 The ⋮ button in the article share bar opens "Bagikan" with WhatsApp, Facebook, X, Line, Salin
- TC-RPT-001 "Laporkan tulisan" opens the report form with 6 reasons and a disabled "Laporkan" button
- TC-RPT-002 Choosing a reason enables "Laporkan"; choosing another reason unchecks the first

Rules:
- Locators: this project sets testIdAttribute to "data-qa-id", so prefer getByTestId. For every element
  in the plan, write down the data-qa-id you found. Only when an element has none, use role, label,
  placeholder or text — never CSS classes.
- NEVER submit a comment or a report, never click "Laporkan" on the report form, never log in,
  and never interact with the Cloudflare "Verify you are human" widget.
- Articles rotate every few minutes: never hardcode an article URL. Open the first story from the
  homepage feed instead.
- Every step must have an expected result that can be asserted.
- Put scenarios that apply to both sites under tests/common/<area>/, desktop-only ones under tests/desktop/<area>/.

Save the plan as specs/kumparan-desktop.plan.md.
```

## 2. Planner — mobile

```text
Use the playwright-test-planner agent.

Explore https://m.kumparan.com as a guest. For planner_setup_page use project "mobile-chrome"
(Pixel 7 emulation) and seed file "tests/seed.spec.ts".

Check that the scenarios in specs/kumparan-desktop.plan.md that live under tests/common/ also work on
the mobile site, and note any locator or flow differences (e.g. search starts from the header
search icon on mobile). Then add these mobile-only test cases:
- TC-HOME-003 The burger menu opens a sidebar with "Masuk", "Beranda" and "Trending"; the close button hides it
- TC-HOME-004 The bottom navigation "Trending" item opens /trending with stories
- TC-SRCH-008 The header search icon opens /search and searching "jokowi" lists results
- TC-RSP-001 An article page has no horizontal overflow at the phone viewport

Same rules as the desktop plan (data-qa-id first, never submit, never log in, no hardcoded article,
assertable expectations). Put mobile-only scenarios under tests/mobile/<area>/.

Save the plan as specs/kumparan-mobile.plan.md.
```

## 3. Generator

```text
Use the playwright-test-generator agent.

Generate tests for every scenario in specs/kumparan-desktop.plan.md (generator_setup_page with
project "desktop-chrome") and then specs/kumparan-mobile.plan.md (project "mobile-chrome").

Requirements for every generated file:
- import { test, expect } from the shared fixtures file (tests/fixtures.ts, use the right relative path),
  not from '@playwright/test' — it blocks ads that otherwise shift the layout.
- Test title starts with the TC ID from the plan.
- Use page.getByTestId('<data-qa-id>') wherever the plan lists one; otherwise role/label/text locators.
- Assert every expected result with web-first assertions (toBeVisible, toHaveText, toHaveURL,
  toBeDisabled, ...). No waitForTimeout, no assertion-free tests.
- Never hardcode an article URL: open the first story link from the homepage feed.
- Never click submit on comments or reports.
```

## 4. Healer

```text
Use the playwright-test-healer agent.

Run `npx playwright test` (both projects: desktop-chrome and mobile-chrome) and fix every failing test.
Rules:
- Fix locators, waits and flow; do not weaken or delete assertions to make a test pass.
- If the application itself behaves incorrectly, keep the assertion, mark the test with
  test.fail(true, '<reason>') and explain it in a comment.
- Keep data-qa-id locators wherever they exist.
Repeat until the suite is green or only annotated known failures remain.
```

---

## As actually used

- Date of the run: 2026-10-31.
- Prompts 1–4 above were sent **verbatim and in order**, each to its agent as a Claude Code subagent (`model: sonnet`, as set in `.claude/agents/*.md`), through the `playwright-test` MCP server from `.mcp.json` (Playwright 1.64.1).
- Prompt changes: none.
- Follow-up prompts: none. Each agent finished in one pass.
- What the agents could not do, or did differently from the prompt:
  - **Planner (mobile), TC-HOME-004.** m.kumparan.com has no bottom navigation for a guest at the Pixel 7 viewport. The planner checked `/`, `/trending`, `/search`, a channel page and an article at several scroll positions. It pointed the test at the Trending item of the navigation strip under the header (`nb-trending`) and retitled it. Task B's TC-HOME-004 clicks the same element, so only the workbook's "bottom navigation" wording is off.
  - **Planners, fixed sleeps.** Both plans contained one: `waitForTimeout(1000)` in TC-SRCH-003 and `waitForTimeout(150)` in TC-RSP-001. Prompt 3 forbids them, so the generator replaced them with `expect.poll` / `toPass`.
  - **Planner (desktop)** has no Edit tool, so it re-saved the whole plan once to reword one TC-HOME-001 step.
  - **Generator** has no shell. It checked every step in the MCP browser but did not run the specs; the healer did.
  - **Healer** has no delete tool. It left an empty scratch file, `tests/zz-probe.spec.ts`, which was deleted by hand.

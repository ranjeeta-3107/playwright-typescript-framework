# Playwright Interview Project (TypeScript)

A simple, beginner-friendly Playwright + TypeScript project that demonstrates **every Playwright concept commonly asked in automation-testing interviews** — with real, runnable tests and short explanations you can repeat in an interview.

- **Language:** TypeScript · **Tool:** Playwright · **Runner:** Playwright Test · **Build:** npm · **Report:** Playwright HTML report
- **~225 tests** across 16 modules, plus one end-to-end scenario that combines UI, API, fixtures and Page Objects.
- **No framework magic:** two page objects, one fixtures file, one test-data file. Everything else is plain tests.

---

## Table of contents

1. [Why a bundled demo app?](#1-why-a-bundled-demo-app)
2. [Prerequisites and installation](#2-prerequisites-and-installation)
3. [Running tests](#3-running-tests)
4. [Reports](#4-reports)
5. [Debugging and traces](#5-debugging-and-traces)
6. [Folder structure](#6-folder-structure)
7. [The Practice App (application under test)](#7-the-practice-app-application-under-test)
8. [Concept guide (Modules 1–16)](#8-concept-guide-modules-116)
9. [Mini projects → where to find them](#9-mini-projects--where-to-find-them)
10. [Selenium vs Playwright](#10-selenium-vs-playwright)
11. [Top interview questions with answers](#11-top-interview-questions-with-answers)
12. [FAQ: locators, waits, fixtures, POM, API](#12-faq-locators-waits-fixtures-pom-api)
13. [Common mistakes and troubleshooting](#13-common-mistakes-and-troubleshooting)
14. [Running in CI](#14-running-in-ci)
15. [Verification status and limitations](#15-verification-status-and-limitations)

---

## 1. Why a bundled demo app?

Public practice sites (saucedemo, the-internet, etc.) are great, but they go down, change their HTML, reset data and rate-limit. That makes tests flaky for reasons that have nothing to do with your code.

So this project ships a **tiny local "Practice App"** (`demo-app/`, plain Node, zero dependencies). Playwright **starts it automatically** before the tests (`webServer` in `playwright.config.ts`) and stops it afterwards. It has everything interviewers ask about: login/logout with real sessions, forms, date pickers, tables with pagination, alerts, iframes, Shadow DOM, tabs/popups, file upload/download, and a REST API with GET/POST/PUT/PATCH/DELETE and Bearer-token auth.

There is **also** an optional suite against the public site **saucedemo.com** (`tests/public/`), so you can show the same techniques on a real remote site — see [section 3](#optional-public-site-suite).

> **Interview line:** "I prefer a stable, controllable test environment. Flaky external dependencies are mocked or isolated, so a red test always means a real problem."

---

## 2. Prerequisites and installation

| Requirement | Version |
|---|---|
| Node.js | **20.12 or newer** (uses the built-in `process.loadEnvFile`, so no `dotenv` package is needed) |
| npm | comes with Node |
| OS | Windows, macOS or Linux |

```bash
# 1. Install dependencies (@playwright/test, typescript, @types/node)
npm install

# 2. Install the browsers Playwright drives (Chromium, Firefox, WebKit)
npx playwright install
#    On Linux / CI also install system libraries:
npx playwright install --with-deps
#    Only one browser:
npx playwright install chromium

# 3. Create your local environment file (git-ignored)
cp .env.example .env          # macOS / Linux
copy .env.example .env        # Windows (cmd)
```

If `.env` does not exist, the config falls back to `.env.example`, which only contains the **public demo accounts** of the local app — so the project works out of the box.

---

## 3. Running tests

| What | Command |
|---|---|
| All tests, all browsers | `npx playwright test` (or `npm test`) |
| One browser | `npx playwright test --project=chromium` (`firefox`, `webkit`) · `npm run test:chromium` |
| One folder | `npx playwright test tests/locators` |
| One file | `npx playwright test tests/api/products-api.spec.ts` |
| One test by line number | `npx playwright test tests/basics/first-test.spec.ts:15` |
| Tests whose title matches | `npx playwright test -g "login"` |
| A `describe` group | `npx playwright test -g "smoke group"` |
| By tag | `npx playwright test --grep @smoke` · exclude: `--grep-invert @slow` |
| Headed (see the browser) | `npx playwright test --headed --project=chromium` · `npm run test:headed` |
| Slow motion / watch | `npx playwright test --headed --debug` |
| UI mode (best for learning) | `npx playwright test --ui` · `npm run test:ui` |
| List tests without running | `npx playwright test --list` |
| Override workers / retries | `npx playwright test --workers=4 --retries=1` |
| Repeat to hunt flakiness | `npx playwright test tests/waits --repeat-each=5` |
| Only the tests that failed last time | `npx playwright test --last-failed` |
| Type check | `npm run typecheck` |
| Explore the demo app manually | `npm run demo-app` → open http://localhost:3000 |
| Record a test with codegen | `npm run demo-app` (terminal 1) + `npm run codegen` (terminal 2) |

**Headless vs headed:** tests run headless by default (`headless: true` in the config — faster, used in CI). `--headed` opens visible windows.

**`test.only` / `test.skip`:** `test.only(...)` runs only that test (great while debugging, but `forbidOnly` fails CI if you commit it). `test.skip(...)` skips; `test.fixme(...)` skips and marks "to fix". See `tests/basics/test-execution.spec.ts`.

### Optional public-site suite

```bash
npm run test:public                       # = npx playwright test --project=public-demo
```

Needs internet access. The project only exists when you ask for it, so `npx playwright test` stays offline and stable.

---

## 4. Reports

The config uses two reporters: **`list`** in the terminal (or **`line`** on CI) and **`html`**.

```bash
npx playwright test               # generates playwright-report/
npx playwright show-report        # opens it (npm run report)
npx playwright test --reporter=line           # compact terminal output
npx playwright test --reporter=dot            # minimal
npx playwright test --reporter=list,html      # several at once
```

The HTML report shows every test, its steps (`test.step`), annotations, attachments, and — for failed tests — **screenshot, video and trace** (configured with `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, `trace: 'on-first-retry'`).

---

## 5. Debugging and traces

| Tool | How | Use it for |
|---|---|---|
| **UI mode** | `npx playwright test --ui` | Watch mode, time-travel through each step, pick locators |
| **Inspector** | `npx playwright test --debug` (or `PWDEBUG=1`) | Step through actions one by one |
| **`page.pause()`** | Put it in a test, run with `--debug`/`--headed` | Stop at an exact line (`tests/advanced/debugging-and-flaky.spec.ts`) |
| **Trace Viewer** | `npx playwright show-trace path/to/trace.zip` | Post-mortem of CI failures: DOM snapshots, network, console per action |
| **Force a trace** | `npx playwright test --trace on` | Record traces for every test |
| **Screenshots / video** | automatic on failure, in `test-results/` | Quick visual of what went wrong |
| **Codegen** | `npx playwright codegen http://localhost:3000` | Record actions and get good locators |
| **VS Code extension** | "Playwright Test for VSCode" | Run/debug single tests with breakpoints |

Traces can also be opened at https://trace.playwright.dev (drag & drop the zip; it stays in your browser).

On Windows PowerShell set env vars like this: `$env:PWDEBUG=1; npx playwright test`.

---

## 6. Folder structure

```
playwright-interview-project/
├── demo-app/                 # The local application under test (plain Node, no deps)
│   ├── server.js             #   static pages + REST API (/api/...)
│   └── public/               #   HTML pages: login, dashboard, forms, elements, tables...
├── tests/
│   ├── basics/               # M1  first tests, running/skipping/tags
│   ├── locators/             # M2  getBy*, CSS, XPath, chaining, filtering, strict mode, tables
│   ├── interactions/         # M3  click, fill, check, select, hover, drag, upload, download, screenshots
│   ├── assertions/           # M4  web-first assertions, soft assertions, auto-waiting
│   ├── navigation/           # M5  browser/context/page, tabs, popups, cookies, storage
│   ├── forms/                # M6  forms, validation, date pickers, tables, iframes, dialogs, shadow DOM
│   ├── waits/                # M7  waitForResponse/Request/URL/LoadState/Event
│   ├── hooks/                # M8  hooks, describe, tags, parallel/serial, retries
│   ├── fixtures/             # M9  built-in and custom fixtures
│   ├── pom/                  # M10 Page Object Model tests
│   ├── authentication/       # M11 auth.setup.ts (storageState), login/logout, data-driven
│   ├── api/                  # M12 API testing (+ API/UI combined)
│   ├── network/              # M13 listening, mocking, aborting
│   ├── advanced/             # M14 evaluate, init scripts, geolocation, keyboard/mouse, debugging, a11y
│   ├── typescript/           # M16 TypeScript essentials
│   ├── e2e/                  # End-to-end scenario combining everything
│   └── public/               # Optional: saucedemo.com (needs internet)
├── pages/
│   ├── LoginPage.ts          # Page Object
│   └── DashboardPage.ts      # Page Object
├── fixtures/
│   └── test-fixtures.ts      # Custom fixtures (page objects, API client, test data)
├── utils/
│   ├── test-data.ts          # Typed test data, credentials from env vars
│   └── env.ts                # Environment → base URL
├── playwright.config.ts      # M15 configuration and reporting
├── tsconfig.json
├── package.json
├── .env.example              # Template for .env (no real secrets)
└── .gitignore
```

Module 15 (configuration & reporting) lives in `playwright.config.ts` — every option is commented.

---

## 7. The Practice App (application under test)

**Accounts** (only valid for the local app; read from `.env`):

| Username | Password env var | Notes |
|---|---|---|
| `student` | `APP_PASSWORD` | standard user → "Student User" |
| `admin` | `ADMIN_PASSWORD` | admin → "Admin User" |
| `locked_user` | — | always returns "This account is locked" |

**Pages:** `/` home · `/login.html` · `/dashboard.html` (needs login; products table with search, filter, delete) · `/forms.html` · `/elements.html` · `/table.html` (paginated) · `/dynamic.html` · `/alerts.html` · `/frames.html` · `/shadow.html` · `/windows.html` · `/advanced.html`

**API:**

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /api/login` | – | `{username,password}` → `{token,user}` + `session` cookie (401 / 403) |
| `POST /api/logout`, `GET /api/me` | cookie or Bearer | session handling |
| `GET /api/products?search=&category=` | – | list, `X-Total-Count` header |
| `GET /api/products/:id` | – | 200 / 404 |
| `POST`, `PUT`, `PATCH`, `DELETE /api/products/:id` | Bearer or cookie | CRUD with validation (400) |
| `GET /api/employees?page=&limit=` | – | pagination |
| `GET /api/slow?delay=ms`, `GET /api/quote` (random), `ANY /api/echo` | – | waits, mocking, header demos |
| `POST /api/register`, `GET /download/report.csv` | – | form submit, download |

Data lives in memory and resets when the server restarts. Tests that create data use unique names and clean up after themselves, so they are safe to run in parallel.

---

## 8. Concept guide (Modules 1–16)

Each concept: **What** · **Why** · **When** · **Example** · **Interview Q&A** · **Mistake to avoid**. Full examples are in the files named.

### Module 1 – Basics (`tests/basics/`)

- **What:** `test()` declares a test; `expect()` asserts; fixtures like `{ page }` are injected.
- **Why:** Playwright Test bundles runner, assertions, parallelism, reporting and browsers — nothing else to wire up.
- **When:** every test.
- **Example:**
  ```ts
  test('home page has the correct title', async ({ page }) => {
    await page.goto('/');                       // baseURL is prepended
    await expect(page).toHaveTitle('Practice App | Home');
  });
  ```
- **Q:** *What is in `playwright.config.ts`?* **A:** testDir, timeouts, retries, workers, reporters, shared `use` options (baseURL, trace, screenshot, video, viewport), projects (browsers/devices), and `webServer`.
- **Mistake:** committing `test.only` — enable `forbidOnly: !!process.env.CI`.

### Module 2 – Locators (`tests/locators/`)

- **What:** a Locator is a lazy, re-evaluated description of how to find element(s).
- **Why:** re-querying on every action means no stale-element errors; built-in locators mirror how users see the page.
- **When:** priority — `getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` → `getByTestId` → CSS → XPath.
- **Example:**
  ```ts
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByLabel('Username').fill('student');
  const row = page.getByTestId('product-row').filter({ hasText: 'Laptop' });
  await row.getByRole('button', { name: 'Delete' }).click();   // chaining
  ```
- **Q:** *What is a strict mode violation?* **A:** an action on a locator that matches more than one element throws, because Playwright refuses to guess. Make the locator unique (scope, filter, `exact: true`) — use `first()/nth()` only when order really matters.
- **Mistake:** names match as **case-insensitive substrings** by default: `name: 'Click me'` also matches "Double-click me". Use `exact: true` (see `tests/interactions/actions.spec.ts`).

### Module 3 – Interactions (`tests/interactions/`)

- **What:** `click`, `dblclick`, `fill`, `pressSequentially`, `press`, `check/uncheck/setChecked`, `selectOption`, `hover`, `focus/blur`, `clear`, `dragTo`, `setInputFiles`, download events, `screenshot`.
- **Why:** each action auto-waits for actionability (visible, stable, enabled, receives events).
- **When:** `fill` for normal typing; `pressSequentially` only when the app reacts to each key.
- **Example:**
  ```ts
  await page.getByLabel('Upload files').setInputFiles('resume.pdf');
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download report' }).click();
  await (await download).saveAs(testInfo.outputPath('report.csv'));
  ```
- **Q:** *How do you upload a file when there's no visible input?* **A:** `page.waitForEvent('filechooser')` before the click, then `fileChooser.setFiles(...)`.
- **Mistake:** clicking before registering the download/popup listener — start `waitForEvent` **first**.

### Module 4 – Assertions & auto-waiting (`tests/assertions/`)

- **What:** web-first assertions (`await expect(locator).toBeVisible()`) retry until true or timeout; generic assertions (`expect(x).toBe(y)`) check once.
- **Why:** they remove the need for sleeps and make tests both faster and more stable.
- **When:** always assert on locators/pages with web-first assertions; use `expect.soft` to collect several failures; `expect.poll`/`toPass` to retry non-DOM checks.
- **Example:**
  ```ts
  await expect(page.getByTestId('slow-result')).toHaveText('Loaded after 1500ms');
  await expect.soft(page).toHaveTitle(/Home/);
  ```
- **Q:** *Why avoid `page.waitForTimeout()`?* **A:** it always waits the full time (slow) and is still too short on a slow machine (flaky). Wait for the condition instead.
- **Mistake:** `expect(await locator.isVisible()).toBe(true)` — it doesn't retry. Use `await expect(locator).toBeVisible()`.

### Module 5 – Browser, Context, Page (`tests/navigation/`)

- **What:** Browser = process; BrowserContext = isolated incognito profile (cookies, storage); Page = tab.
- **Why:** a new context per test gives isolation cheaply → safe parallel runs.
- **When:** `browser.newContext()` for multiple users in one test; `context.newPage()` for multiple tabs.
- **Example:**
  ```ts
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open popup' }).click();
  const popup = await popupPromise;
  ```
- **Q:** *How do you test two users chatting?* **A:** two contexts from the same `browser`, one page each.
- **Mistake:** forgetting to `close()` contexts you created yourself.

### Module 6 – Forms & components (`tests/forms/`)

- **What:** text/password fields, radios, checkboxes, dropdowns (single/multi), native and custom date pickers, validation, pagination, iframes, dialogs, Shadow DOM, dynamic lists.
- **Why / When:** the bread and butter of UI automation.
- **Example:**
  ```ts
  const frame = page.frameLocator('#contact-frame');
  await frame.getByLabel('Name').fill('Arjun');
  page.once('dialog', (d) => d.accept('Kavya'));          // prompt
  ```
- **Q:** *How does Playwright handle alerts by default?* **A:** auto-dismisses them. Register `page.on/once('dialog')` before the action to accept or read them.
- **Q:** *Shadow DOM?* **A:** CSS and `getBy*` pierce **open** shadow roots automatically; XPath does not.
- **Mistake:** native date input → `fill('2000-01-31')` (ISO format), not typing the localised display format.

### Module 7 – Waits (`tests/waits/`)

- **Preferred order:** auto-waiting actions → web-first assertions → event waits when you need the data (`waitForResponse`, `waitForRequest`, `waitForEvent`) → `waitForURL` → `waitForLoadState` → (`waitForSelector` / `locator.waitFor`, rarely) → never `waitForTimeout`.
- **Example:**
  ```ts
  const responsePromise = page.waitForResponse(r => r.url().includes('/api/slow') && r.ok());
  await page.getByRole('button', { name: 'Load data' }).click();
  expect(await (await responsePromise).json()).toEqual({ message: 'Loaded after 1500ms' });
  ```
- **Q:** *Is `networkidle` a good wait?* **A:** discouraged — slow and unreliable with polling/analytics. Assert on the content you need.
- **Mistake:** `await page.waitForResponse(...)` **after** the click — the response may already have arrived. Create the promise first.

### Module 8 – Hooks & organisation (`tests/hooks/`)

- **What:** `beforeAll/beforeEach/afterEach/afterAll`, `describe` (nested), tags, annotations, `describe.configure({ mode, retries })`.
- **Why:** shared setup and readable grouping; tags enable smoke/regression runs.
- **When:** `beforeEach` for per-test setup (e.g., `goto`); `beforeAll` for expensive worker-level setup.
- **Example:** `test('…', { tag: '@smoke' }, async ({ page }) => {…})` → `npx playwright test --grep @smoke`
- **Q:** *Why are independent tests preferred over serial ones?* **A:** they can run in parallel and alone; in serial mode one failure skips the rest and retries re-run the whole group.
- **Mistake:** expecting `beforeAll` to run once per file — it runs once **per worker**.

### Module 9 – Fixtures (`fixtures/test-fixtures.ts`, `tests/fixtures/`)

- **What:** reusable, on-demand setup/teardown injected by name: `page`, `context`, `browser`, `request`, `browserName`, `baseURL` + your own.
- **Why:** less duplication than hooks, automatic cleanup, composable, lazily created.
- **When:** page objects, authenticated API clients, test data that must be created and deleted.
- **Example:**
  ```ts
  testProduct: async ({ api }, use) => {
    const product = await (await api.post('/api/products', { data: buildProduct() })).json();
    await use(product);                                    // test runs here
    await api.delete(`/api/products/${product.id}`);       // teardown
  },
  ```
- **Q:** *Test vs worker scope?* **A:** test scope = new per test (default); worker scope = once per worker process (`{ scope: 'worker' }`), e.g. an auth token. Worker fixtures can only use worker fixtures.
- **Mistake:** importing `test` from `@playwright/test` in a file that needs custom fixtures — import from `fixtures/test-fixtures`.

### Module 10 – Page Object Model (`pages/`, `tests/pom/`)

- **What:** one class per page holding its locators and actions.
- **Why:** UI changes are fixed in one place; tests read like user stories.
- **When:** pages used by several tests. **Not** for a few one-off tests or as a dumping ground for assertions.
- **Example:** `await loginPage.login(user, pass); await dashboardPage.expectLoggedInAs('Student User');`
- **Q:** *Advantages / disadvantages?* **A:** + reuse, maintainability, readability. − extra code, risk of over-abstraction ("god objects") that hides what a test does.
- **Mistake:** storing `ElementHandle`s or text values in page objects — store **Locators** (lazy, never stale).

### Module 11 – Authentication & test data (`tests/authentication/`, `utils/test-data.ts`)

- **What:** `auth.setup.ts` logs in once and saves `storageState` (cookies + localStorage); tests opt in with `test.use({ storageState })`. Data-driven tests = a `for` loop around `test()`.
- **Why:** skipping UI login per test saves lots of time; env vars keep secrets out of git.
- **Example:**
  ```ts
  for (const { title, username, password, error } of invalidLogins) {
    test(`rejects ${title}`, async ({ loginPage }) => { … });
  }
  ```
- **Q:** *How do you handle multiple roles?* **A:** one storage-state file per role (see `storage-state.spec.ts`, which creates an admin state via the API).
- **Mistakes:** committing `playwright/.auth/` (it contains a live session — it's in `.gitignore`); logging out in a test that uses the shared storage state (it invalidates the session for other tests).

### Module 12 – API testing (`tests/api/`)

- **What:** `APIRequestContext` (`request` fixture, `page.request`, `playwright.request.newContext()`): `get/post/put/patch/delete` with `data`, `params`, `headers`.
- **Why:** fast backend checks, and fast **setup/cleanup** for UI tests.
- **Example:**
  ```ts
  const res = await request.post('/api/products', { data: product, headers: { Authorization: `Bearer ${token}` } });
  expect(res.status()).toBe(201);
  expect(await res.json()).toMatchObject({ name: product.name });
  ```
- **Q:** *Difference between `request` and `page.request`?* **A:** `page.request` shares cookies with the page's context (logged in if the page is); the `request` fixture is independent.
- **Mistake:** not checking the status before parsing JSON → confusing errors.

### Module 13 – Network (`tests/network/`)

- **What:** observe with `page.on('request'|'response'|'requestfailed')`; intercept with `page.route()` → `fulfill` (mock), `continue` (modify request), `fetch` + `fulfill` (modify real response), `abort`.
- **Why:** test edge cases (empty list, 500 error, slow API) and make random data deterministic.
- **Example:** `await page.route('**/api/quote', r => r.fulfill({ json: { quote: 'Stable' } }));`
- **Q:** *When should you NOT mock?* **A:** in true end-to-end tests that must prove front end and back end work together. Mock in UI-focused tests.
- **Mistake:** registering the route after `page.goto()` when the request fires during load.

### Module 14 – Advanced (`tests/advanced/`)

- `page.evaluate()` runs JS in the browser (pass args explicitly) · `addInitScript()` runs before page scripts (feature flags, seed storage) · `setExtraHTTPHeaders()` · `setViewportSize()` · `geolocation` + `permissions` via `test.use` · `page.keyboard` / `page.mouse` · `test.step`, `test.slow()`, annotations, conditional skip, `browserName` branching, `ControlOrMeta` for OS shortcuts · manual trace and video recording · console-error capture · accessibility with `toMatchAriaSnapshot()` / `ariaSnapshot()`.
- **Q:** *How do you test accessibility?* **A:** role-based locators, ARIA snapshots, and for WCAG rules the `@axe-core/playwright` package (`new AxeBuilder({ page }).analyze()`) — not installed here to keep dependencies minimal.
- **Mistake:** `test.use({ video: 'on' })` inside a `describe` — `video` is worker-level, so it is only allowed at the top of a file or in the config.

### Module 15 – Configuration & reporting (`playwright.config.ts`)

| Option | Value here | Meaning |
|---|---|---|
| `projects` | setup, chromium, firefox, webkit (+ public-demo on demand) | browsers/devices; `dependencies: ['setup']` runs login first |
| `use.baseURL` | from `TEST_ENV` / `BASE_URL` | lets tests use relative URLs |
| `timeout` / `expect.timeout` | 30 s / 5 s | per test / per assertion |
| `actionTimeout`, `navigationTimeout` | 10 s / 15 s | per action / navigation |
| `retries` | 2 on CI, 0 locally | flaky-test safety net |
| `workers` | 2 on CI, auto locally | parallel processes |
| `fullyParallel` | true | parallel within files too |
| `reporter` | list (line on CI) + html | |
| `screenshot` / `video` / `trace` | only-on-failure / retain-on-failure / on-first-retry | failure evidence |
| `webServer` | starts `demo-app/server.js` | app lifecycle |

**Environment-specific config:** `TEST_ENV=staging npx playwright test` picks the staging URL from `utils/env.ts`; `BASE_URL=https://… npx playwright test` overrides it. Shell/CI variables always win over `.env`.

### Module 16 – TypeScript essentials (`tests/typescript/ts-essentials.spec.ts`)

`const`/`let`, primitive/array/object/union types, template literals, `?.` and `??`, typed functions with default/optional parameters, `map/filter/find`, destructuring and spread, interfaces vs type aliases, generics, classes with constructors, inheritance, `public/private/protected/readonly`, named and `type` imports, promises, `async/await`, `Promise.all`, `try/catch/finally` with `unknown` errors.

- **Mistake:** a missing `await` — the test can finish before the action/assertion runs. Enable the ESLint rule `@typescript-eslint/no-floating-promises` in real projects.

---

## 9. Mini projects → where to find them

| # | Scenario | File(s) |
|---|---|---|
| 1 | Login and logout | `tests/authentication/login-logout.spec.ts`, `tests/pom/login-pom.spec.ts` |
| 2 | Form validation | `tests/forms/registration-form.spec.ts` |
| 3 | Search and filtering | `tests/pom/dashboard-pom.spec.ts` |
| 4 | Table handling | `tests/forms/tables-pagination.spec.ts`, `tests/locators/multiple-elements.spec.ts` |
| 5 | Dropdowns and checkboxes | `tests/interactions/actions.spec.ts` |
| 6 | Multiple tabs and popups | `tests/navigation/tabs-and-popups.spec.ts` |
| 7 | File upload and download | `tests/interactions/files-and-screenshots.spec.ts` |
| 8 | API testing | `tests/api/products-api.spec.ts` |
| 9 | API mocking | `tests/network/mocking.spec.ts` |
| 10 | Authentication with storageState | `tests/authentication/auth.setup.ts`, `storage-state.spec.ts` |
| 11 | Page Object Model | `pages/*.ts`, `tests/pom/` |
| 12 | Data-driven testing | `tests/authentication/data-driven.spec.ts` |
| 13 | Handling flaky tests | `tests/advanced/debugging-and-flaky.spec.ts` |
| 14 | Debugging failed tests | same file + [section 5](#5-debugging-and-traces) |
| 15 | Cross-browser execution | `projects` in `playwright.config.ts`; `npx playwright test` |
| ★ | **End-to-end (UI + API + fixtures + POM)** | `tests/e2e/product-lifecycle.spec.ts` |

Try the flaky demo: `DEMO_FLAKY=1 npx playwright test -g "retry demo" --project=chromium` → reported as **flaky** (fails, then passes on retry, with a trace).

---

## 10. Selenium vs Playwright

| Topic | Selenium WebDriver | Playwright |
|---|---|---|
| Architecture | WebDriver protocol over HTTP, one command per request, separate driver binary | Persistent WebSocket connection (CDP / browser-specific protocols), browsers bundled |
| Waiting | Manual implicit/explicit waits (`WebDriverWait`) | Auto-waiting actions + retrying web-first assertions |
| Element references | `WebElement` can go stale | Locators re-query every time — no stale elements |
| Browsers | All major incl. real Safari, IE legacy | Chromium, Firefox, WebKit (Safari engine), plus branded Chrome/Edge |
| Languages | Java, Python, C#, JS, Ruby… | TS/JS, Python, Java, .NET |
| Test runner | External (TestNG, JUnit, pytest) | Built-in Playwright Test (parallelism, fixtures, retries, reports) |
| Isolation | New browser/driver per test is slow | New BrowserContext per test in milliseconds |
| Network | Needs proxy/BiDi for mocking | `page.route()` built in |
| Multi-tab / iframes | Switch window handles / `switchTo().frame()` | Each tab is a `Page`; `frameLocator()` |
| Debugging | Logs, screenshots | Trace Viewer, UI mode, Inspector, codegen, video |
| API testing | Separate library (RestAssured…) | Built-in `APIRequestContext` |
| Grid / scale | Selenium Grid | Workers + sharding (`--shard=1/4`) |

---

## 11. Top interview questions with answers

1. **What is Playwright?** An open-source browser automation library by Microsoft that drives Chromium, Firefox and WebKit with one API, plus Playwright Test — a full test runner.
2. **What is auto-waiting?** Before every action Playwright waits until the element is attached, visible, stable, enabled and receives events; assertions retry until they pass. No manual sleeps.
3. **Locator vs ElementHandle?** Locators are lazy and re-resolve on every use (recommended). ElementHandles point to one DOM node and can become stale (discouraged).
4. **Which locator do you prefer and why?** `getByRole` with a name — it reflects what users and screen readers perceive and survives markup refactors.
5. **What is strict mode?** Actions throw if the locator matches multiple elements, preventing accidental clicks on the wrong one.
6. **BrowserContext?** An isolated browser profile (cookies, storage, permissions). Each test gets a fresh one, which makes tests independent and parallel-safe.
7. **How do you reuse login?** Log in once in a setup project, save `storageState`, load it with `test.use({ storageState })` or per project.
8. **Fixtures vs hooks?** Fixtures are reusable across files, lazy, composable and keep teardown next to setup; hooks are local to a file/describe.
9. **How do you run tests in parallel?** Files run in parallel by default across workers; `fullyParallel: true` parallelises tests within files; `workers` controls the count; `--shard` splits across machines.
10. **How do you handle flaky tests?** Find the root cause (sleeps, brittle locators, shared state, random data, timing) using traces; fix with web-first assertions, better locators, isolation and mocking. Retries are a safety net, not a fix.
11. **What is the Trace Viewer?** A recording of a test with DOM snapshots, actions, network, console and source per step; opened with `npx playwright show-trace`.
12. **How do you handle new tabs?** `const p = page.waitForEvent('popup')` (or `context.waitForEvent('page')`), click, `await p`.
13. **How do you handle iframes?** `page.frameLocator(selector)` or `locator.contentFrame()`, then normal locators.
14. **How do you mock an API?** `page.route(pattern, route => route.fulfill({ json }))` before the request fires.
15. **How do you test an API?** The `request` fixture: `await request.get('/api/x')`, assert `status()`, `headers()`, `json()`.
16. **Soft assertions?** `expect.soft()` records a failure but continues the test; the test still fails at the end.
17. **`toHaveText` vs `toContainText`?** Full (normalised) match vs substring; both accept regex and arrays.
18. **How do you upload / download files?** `setInputFiles()`; `waitForEvent('download')` → `download.saveAs()`.
19. **How do you handle alerts?** `page.on('dialog', d => d.accept())` before the action; otherwise they're auto-dismissed.
20. **What does `test.describe.configure({ mode: 'serial' })` do?** Runs the group in order in one worker; a failure skips the rest; retries re-run the group.
21. **Projects in the config?** Named configurations (browser, device, baseURL, storageState…); run one with `--project`.
22. **How do you run against different environments?** Env vars (`TEST_ENV`, `BASE_URL`) read in the config to select `baseURL`; secrets from `.env`/CI secrets.
23. **How do you take screenshots?** `page.screenshot({ path, fullPage })`, `locator.screenshot()`, `screenshot: 'only-on-failure'`; visual regression with `toHaveScreenshot()`.
24. **What is `addInitScript`?** A script injected into every page before its own scripts run — e.g. feature flags, fake `Date`, seeding storage.
25. **How do you run a single test?** `npx playwright test file.spec.ts:LINE`, `-g "title"`, or temporarily `test.only`.
26. **What's `webServer` in the config?** Starts your app before tests and waits for a URL to respond.
27. **What is `test.step`?** Groups actions into named steps that appear in reports and traces.
28. **Why TypeScript?** Autocomplete, compile-time errors (typos in locators/data shapes), safer refactors.
29. **How do you test multiple users at once?** `browser.newContext()` twice, each with its own `storageState`.
30. **What is `expect.poll` / `toPass`?** Retry arbitrary (non-locator) code until the assertion passes — e.g., polling an API.

---

## 12. FAQ: locators, waits, fixtures, POM, API

**Locators**
- *CSS or XPath?* Neither by default. Use them when no user-facing attribute exists; prefer CSS over XPath. XPath doesn't pierce Shadow DOM.
- *How to pick from a list?* Filter by content (`filter({ hasText })`) first; use `nth()` only for genuinely positional checks.
- *Dynamic ids?* Never put them in locators — use role/label/test id (see `dynamic-elements.spec.ts`).

**Waits**
- *Do I ever need explicit waits?* Only when you need data from an event (response/request/popup/download) or a specific navigation.
- *Element appears after 10s?* Pass a timeout to that one assertion: `toBeVisible({ timeout: 15_000 })`.

**Fixtures**
- *Where do custom fixtures live?* `fixtures/test-fixtures.ts`; tests import `test` from there.
- *Can fixtures depend on each other?* Yes — `testProduct` → `api` → `apiToken`.

**POM**
- *Assertions in page objects?* Small reusable checks are fine (`expectLoggedInAs`); keep test-specific assertions in tests.
- *How to share page objects?* Via fixtures, so tests don't `new` them.

**API**
- *How to authenticate?* Log in via API, then send `Authorization: Bearer <token>` (`extraHTTPHeaders`) — or rely on the cookie the request context stores.
- *How to combine with UI?* Create data via API → verify in UI → clean up via API (`tests/api/api-ui-combined.spec.ts`, `tests/e2e/`).

---

## 13. Common mistakes and troubleshooting

| Problem | Cause / Fix |
|---|---|
| `Executable doesn't exist at …ms-playwright…` | Browsers not installed → `npx playwright install` |
| `strict mode violation … resolved to 2 elements` | Locator not unique → scope it, `exact: true`, filter |
| `getByLabel` matches an unexpected element | `getByLabel` also matches `aria-label` (substring). Use `getByRole('textbox', { name })` (real bug found while building `registration-form.spec.ts`) |
| `toBeHidden()` fails although the element has `hidden` | CSS like `display: inline-block` overrides the `hidden` attribute — a real app bug; the demo app fixes it with `[hidden]{display:none!important}` |
| `getByRole('columnheader')` finds nothing | Add `scope="col"` to `<th>` / check the table's semantics |
| Test times out at `waitForResponse` | Promise created after the click, or URL/query doesn't match (spaces may be `+` or `%20` → compare decoded `URLSearchParams`) |
| `Missing environment variable "APP_USERNAME"` | Create `.env` from `.env.example` |
| `Error: http://localhost:3000/health is already used` | Another server on port 3000. Stop it, or locally it's reused automatically (`reuseExistingServer`) |
| Dashboard tests suddenly redirected to login | A test logged out using the shared storage state, or the server restarted → rerun (setup project recreates the state) |
| `Cannot use({ video }) in a describe group` | Worker-level option → top of file or config |
| Assertion passes but nothing was checked | Missing `await` before `expect(locator)` |
| Works locally, fails on CI | Timing → use web-first assertions; compare traces (`--trace on`); CI uses `retries: 2`, `workers: 2` |

---

## 14. Running in CI

CI mode is driven by the `CI` environment variable (`CI=true` is set automatically by GitHub Actions, GitLab, Jenkins plugins, etc.): `forbidOnly`, `retries: 2`, `workers: 2`, `line` reporter, and a fresh web server.

```bash
CI=true npx playwright test                 # macOS / Linux
$env:CI="true"; npx playwright test         # Windows PowerShell
```

Example `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          APP_USERNAME: ${{ secrets.APP_USERNAME }}
          APP_PASSWORD: ${{ secrets.APP_PASSWORD }}
          ADMIN_USERNAME: ${{ secrets.ADMIN_USERNAME }}
          ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with: { name: playwright-report, path: playwright-report/, retention-days: 14 }
```

Secrets come from the CI secret store — never from committed files. (For the local demo app the `.env.example` fallback would also work, but this shows the right habit.)

---

## 15. Verification status and limitations

What was actually run while building this project (Playwright 1.56, Node 22, Linux, TypeScript type check):

- ✅ `npm run typecheck` — no errors.
- ✅ **Chromium: full suite passes** — 223 passed, 3 skipped by design (`test.skip` demo, `test.fixme` demo, `page.pause()` demo which only runs with `PWDEBUG=1`). Also verified in CI mode and with more workers.
- ✅ Flaky demo (`DEMO_FLAKY=1`) is reported as "flaky" as intended.
- ⚠️ **Firefox and WebKit were not executed** — only Chromium was installable in the build environment. The tests avoid browser-specific APIs and use `ControlOrMeta` for OS shortcuts, but run `npx playwright test --project=firefox --project=webkit` once on your machine and expect to fix the occasional engine difference.
- ⚠️ **`tests/public/saucedemo.spec.ts` was not executed** — the build environment had no internet access to public demo sites. Its selectors are based on the site's known structure; if the site changes, adjust them.
- ℹ️ Visual regression (`toHaveScreenshot`) is explained but not committed, because baseline images are OS/browser-specific.
- ℹ️ `@axe-core/playwright` (automated WCAG rules) is not installed to keep dependencies minimal; built-in ARIA snapshots are used instead.
- ℹ️ The `staging` URL in `utils/env.ts` is a placeholder.

Good luck with the interview! Read a module's spec file top to bottom, run it in `--ui` mode, then try to explain each test out loud.

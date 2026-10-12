import fs from 'node:fs';
import { defineConfig, devices } from '@playwright/test';
import { getBaseUrl } from './utils/env';

/**
 * playwright.config.ts — the single place that controls HOW tests run.
 * Docs: https://playwright.dev/docs/test-configuration
 *
 * Interview tip: be ready to explain every option in this file.
 */

// ---------------------------------------------------------------------------
// 1. Environment variables
// ---------------------------------------------------------------------------
// Load `.env` (git-ignored). If it does not exist, fall back to `.env.example`
// which only contains the PUBLIC demo accounts of the local Practice App.
// Variables already set in the shell/CI always win over values in the file.
const envFile = fs.existsSync('.env') ? '.env' : '.env.example';
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

// ---------------------------------------------------------------------------
// 2. Environment-specific configuration
// ---------------------------------------------------------------------------
// TEST_ENV=local|staging selects a URL from utils/env.ts; BASE_URL overrides it.
const BASE_URL = getBaseUrl();
const isLocal = BASE_URL.includes('localhost');

// The optional public-site suite (tests/public) only exists as a project when
// it is explicitly requested, so a normal `npx playwright test` stays offline.
// Setting the env var here makes worker processes see the same project list.
if (process.argv.some((arg) => arg.includes('public-demo'))) process.env.RUN_PUBLIC = '1';
const runPublic = process.env.RUN_PUBLIC === '1';

const isCI = !!process.env.CI;

export default defineConfig({
  // Where test files live and which files count as tests.
  testDir: './tests',

  // Run tests inside each file in parallel too (not only files in parallel).
  fullyParallel: true,

  // Fail the CI build if someone accidentally commits `test.only`.
  forbidOnly: isCI,

  // Retry failed tests on CI only – a retry that passes is reported as "flaky".
  retries: isCI ? 2 : 0,

  // Number of parallel worker processes. undefined = half of the CPU cores.
  workers: isCI ? 2 : undefined,

  // Maximum time for ONE test (including hooks and fixtures).
  timeout: 30_000,

  // Default timeout for web-first assertions such as `toBeVisible()`.
  expect: { timeout: 5_000 },

  // Reporters: `list` in the terminal + an HTML report you open with `npx playwright show-report`.
  // On CI the compact `line` reporter is used instead of `list`.
  reporter: [[isCI ? 'line' : 'list'], ['html', { open: 'never' }]],

  // Options shared by every project (can be overridden per project / per file with test.use()).
  use: {
    baseURL: BASE_URL, // lets tests call page.goto('/login.html')
    headless: true, // `--headed` on the command line overrides this
    actionTimeout: 10_000, // max time for a single click / fill / etc.
    navigationTimeout: 15_000,
    trace: 'on-first-retry', // record a trace when a test is retried
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-testid', // used by page.getByTestId()
  },

  // Projects = named configurations. Here: one setup project + one per browser.
  projects: [
    // Logs in once and saves the session to STORAGE_STATE (see tests/authentication/auth.setup.ts)
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: /public\//,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
      testIgnore: /public\//,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
      testIgnore: /public\//,
    },

    // Optional: tests against the public saucedemo.com site (needs internet).
    ...(runPublic
      ? [
          {
            name: 'public-demo',
            testMatch: /public\/.*\.spec\.ts/,
            use: {
              ...devices['Desktop Chrome'],
              baseURL: 'https://www.saucedemo.com',
              testIdAttribute: 'data-test', // saucedemo uses data-test="..." attributes
            },
          },
        ]
      : []),
  ],

  // Start the local Practice App before the tests (and stop it afterwards).
  webServer: isLocal
    ? {
        command: 'node demo-app/server.js',
        url: `${BASE_URL}/health`,
        reuseExistingServer: !isCI, // locally, reuse `npm run demo-app` if it is already running
        timeout: 15_000,
      }
    : undefined,

  // Where screenshots, videos and traces of failed tests are written.
  outputDir: 'test-results',
});

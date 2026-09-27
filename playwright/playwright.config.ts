/** @type {import('@playwright/test').PlaywrightTestConfig } */
const config = {
  testDir: './playwright/tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  // Run tests in files under testDir.
  // Multiple files match the testDir and testMatch selectors
  testMatch: '**/*..spec.ts',
  // If a test fails, retry it up to 2 times
  retries: process.env.CI ? 2 : 0,
  // See https://playwright.dev/docs/trace-viewer
  //trace: 'on-first-retry',
  // Project configuration for each browser.
  // projects: [
  //   {
  //     name: 'Chromium',
  //     use: { ...devices['Desktop Chrome'] },
  //   },
  // ],
};

module.exports = config;
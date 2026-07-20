// @ts-check
const { defineConfig, devices } = require('@playwright/test')

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:8080'

/**
 * Gra E2E needs:
 *   - frontend: npm run serve (or PLAYWRIGHT_BASE_URL)
 *   - API: php -S 127.0.0.1:8090 -t public in obozy-festiwal (default VUE_APP_API_BASE_URL)
 *
 * Run: npm run test:e2e
 */
module.exports = defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: 'npm run serve',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
      }
})

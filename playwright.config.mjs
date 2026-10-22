import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const executablePath =
  process.env.BROWSER_EXECUTABLE ||
  (process.platform === 'darwin' && existsSync(chrome) ? chrome : undefined)
const basePath = process.env.E2E_BASE_PATH || '/'
if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(basePath))
  throw new Error('Invalid E2E_BASE_PATH')
const port = 5196

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  outputDir: 'artifacts/e2e',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'artifacts/playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${port}${basePath}`,
    launchOptions: { executablePath },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'phone-portrait',
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'phone-landscape',
      use: {
        viewport: { width: 844, height: 390 },
        isMobile: true,
        hasTouch: true,
      },
    },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${port} --strictPort --base ${basePath}`,
    url: `http://127.0.0.1:${port}${basePath}`,
    reuseExistingServer: false,
    timeout: 120000,
  },
})

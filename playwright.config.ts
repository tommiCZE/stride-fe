import { defineConfig, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const STORAGE_STATE = 'e2e/.auth/storage-state.json';

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.test-output',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.CI
    ? 'github'
    : [['list'], ['html', { open: 'never', outputFolder: './e2e/.playwright-report' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
        // Fixed desktop viewport. Locally `viewport: null` + `--start-maximized` left
        // headless Chromium sub-md, which collapsed the sidebar into a Drawer and
        // switched "Nový task" → "Task" — both broke a chunk of the suite.
        viewport: process.env.CI ? { width: 1920, height: 1080 } : { width: 1440, height: 900 },
      },
      dependencies: ['setup'],
    },
  ],
});

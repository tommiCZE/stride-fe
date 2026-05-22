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
        ...(process.env.CI
          ? { viewport: { width: 1920, height: 1080 } }
          : { viewport: null, deviceScaleFactor: undefined }),
        launchOptions: {
          args: process.env.CI ? [] : ['--start-maximized'],
        },
      },
      dependencies: ['setup'],
    },
  ],
});

import { expect, test as setup } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const STORAGE_STATE = path.resolve('e2e/.auth/storage-state.json');

setup('authenticate', async ({ page }) => {
  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });

  await page.goto('/login');

  await expect(page.locator('input[name="email"]')).toHaveValue('tomas.vesely@acme.cz');
  await expect(page.locator('input[name="password"]')).toHaveValue('password');

  await page.getByRole('button', { name: /sign in|přihlásit|přihl[aá]sit/i }).click();

  await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 10_000 });

  await page.context().storageState({ path: STORAGE_STATE });
});

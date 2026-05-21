import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { createTaskViaUI } from './fixtures/create-task';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_FILE = path.resolve(HERE, 'fixtures/files/sample.txt');

test('TS-110: upload + smazání přílohy', async ({ page }) => {
  const { title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-110]' });

  await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible();

  await page.getByText('Přílohy', { exact: true }).click();

  await page.locator('input[type="file"]').setInputFiles(SAMPLE_FILE);

  await expect(page.getByText('sample.txt')).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: 'Smazat přílohu' }).first().click();

  await expect(page.getByText('Soubor smazán')).toBeVisible();
  await expect(page.getByText('sample.txt')).toHaveCount(0);
});

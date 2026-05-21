import { expect, test } from '@playwright/test';
import { createTaskViaUI } from './fixtures/create-task';

test('TS-1001: klik na řádek v list view otevře task detail', async ({ page }) => {
  const { key, title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-1001]' });

  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { level: 3, name: title })).toBeHidden();

  const projectKey = key.split('-')[0];
  await page.goto(`/projects/${projectKey}/list`);
  await expect(page).toHaveURL(/\/list/);

  await page.getByText(key, { exact: true }).first().click();

  await expect(page).toHaveURL(new RegExp(`task=${key}`));
  await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible();
});

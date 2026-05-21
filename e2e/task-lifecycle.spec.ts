import { expect, test } from '@playwright/test';
import { createTaskViaUI } from './fixtures/create-task';

test('TS-111: smazání tasku přes More akcí + confirm', async ({ page }) => {
  const { key, title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-111]' });

  await page.getByRole('button', { name: 'Více akcí' }).click();
  await page.getByRole('menuitem', { name: 'Smazat task' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(`Smazat úkol ${key}?`);

  await dialog.getByRole('button', { name: 'Smazat' }).click();

  await expect(page.getByText(`Úkol ${key} smazán`)).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: title })).toHaveCount(0);
  await expect(page).not.toHaveURL(/[?&]task=/);
});

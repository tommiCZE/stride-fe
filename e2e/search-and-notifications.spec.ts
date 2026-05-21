import { expect, test } from '@playwright/test';
import { createTaskViaUI } from './fixtures/create-task';

test('TS-1201: search stránka renderuje s prázdným stavem', async ({ page }) => {
  await page.goto('/search');
  await expect(page).toHaveURL(/\/search/);

  const input = page.getByPlaceholder('Hledat tasky, projekty, lidi…');
  await expect(input).toBeVisible();
});

test('TS-1101: notifications popover otevře přes bell button', async ({ page }) => {
  await page.goto('/');

  const bellButton = page.locator('header, body').locator('button').filter({
    has: page.locator('svg'),
  });
  await page.getByRole('button', { name: /Notifikace|Notifications/ }).first().click();

  const popover = page.locator('[role="presentation"]').filter({
    hasText: /Notifikace|Notifications|Žádné notifikace|Označit|notifications/i,
  }).first();
  await expect(popover).toBeVisible();
});

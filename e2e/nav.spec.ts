import { expect, test } from '@playwright/test';

test.describe('Sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('TS-701: navigace na Dashboard', async ({ page }) => {
    await page.getByRole('button', { name: /^Dashboard/ }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('TS-702: navigace na Inbox / Doručené', async ({ page }) => {
    await page.getByRole('button', { name: /Inbox|Doručené/ }).click();
    await expect(page).toHaveURL(/\/inbox/);
  });

  test('TS-703: navigace na My Work / Moje práce', async ({ page }) => {
    await page.getByRole('button', { name: /My Work|Moje práce/ }).click();
    await expect(page).toHaveURL(/\/my-work/);
  });

  test('TS-704: navigace na Reports / Reporty', async ({ page }) => {
    await page.getByRole('button', { name: /Reports|Reporty/ }).first().click();
    await expect(page).toHaveURL(/\/reports/);
  });

  test('TS-705: navigace na Calendar / Kalendář', async ({ page }) => {
    await page.getByRole('button', { name: /Calendar|Kalendář/ }).click();
    await expect(page).toHaveURL(/\/calendar/);
  });
});

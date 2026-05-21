import { expect, test } from '@playwright/test';

test.describe('Auth', () => {
  test('TS-601: logout přes avatar menu', async ({ page }) => {
    await page.goto('/');
    await expect(page).not.toHaveURL(/\/login/);

    await page.locator('span').filter({ hasText: /^TV$/ }).first().click();
    await page.getByRole('menuitem', { name: 'Odhlásit se' }).click();

    await expect(page).toHaveURL(/\/login/);
  });

  test.describe('TS-602', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('TS-602: chybné heslo zobrazí chybu', async ({ page }) => {
      await page.goto('/login');

      const emailInput = page.locator('input[name="email"]');
      const passwordInput = page.locator('input[name="password"]');

      await emailInput.fill('tomas.vesely@acme.cz');
      await passwordInput.fill('wrong-password');

      await page.getByRole('button', { name: /Sign in|Přihlásit/ }).click();

      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page).toHaveURL(/\/login/);
    });
  });
});

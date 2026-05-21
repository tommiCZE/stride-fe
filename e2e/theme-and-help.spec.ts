import { expect, test } from '@playwright/test';

test.describe('Theme & keyboard help', () => {
  test('TS-801: toggle theme', async ({ page }) => {
    await page.goto('/');

    const beforeBg = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);

    await page.getByRole('button', { name: /Toggle theme|Přepnout téma/ }).click();

    await expect(async () => {
      const afterBg = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
      expect(afterBg).not.toBe(beforeBg);
    }).toPass({ timeout: 3000 });
  });

  test('TS-802: keyboard help dialog otevře ? a zavře Esc', async ({ page }) => {
    await page.goto('/');
    await page.locator('body').click();

    await page.keyboard.press('Shift+Slash');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: /Klávesové zkratky|Keyboard shortcuts/i })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});

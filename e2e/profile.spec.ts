import { expect, test } from '@playwright/test';

test('TS-901: profile edit name', async ({ page }) => {
  await page.goto('/profile');

  const nameInput = page.getByLabel('Jméno');
  await expect(nameInput).toBeVisible();
  const originalName = await nameInput.inputValue();
  const newName = `${originalName} (E2E)`;

  await nameInput.fill(newName);
  await page.getByRole('button', { name: /Uložit změny/ }).click();

  await page.reload();
  await expect(page.getByLabel('Jméno')).toHaveValue(newName);

  await page.getByLabel('Jméno').fill(originalName);
  await page.getByRole('button', { name: /Uložit změny/ }).click();
});

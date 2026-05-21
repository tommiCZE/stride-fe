import { expect, test } from '@playwright/test';
import { openFirstProject } from './fixtures/nav';

test('TS-1801: profile change avatar color + revert', async ({ page }) => {
  await page.goto('/profile');

  const colorLabel = page.getByText('Barva avataru', { exact: true });
  await expect(colorLabel).toBeVisible();
  const colorSection = colorLabel.locator('xpath=following-sibling::*[1]');
  const colorOptions = colorSection.locator('> div');
  const count = await colorOptions.count();
  expect(count).toBeGreaterThanOrEqual(5);

  await colorOptions.nth(1).click();
  await page.getByRole('button', { name: /Uložit změny/ }).click();

  await page.reload();
  await colorOptions.nth(0).click();
  await page.getByRole('button', { name: /Uložit změny/ }).click();
});

test('TS-1302: rename projektu + revert', async ({ page }) => {
  const projectKey = await openFirstProject(page);
  await page.goto(`/projects/${projectKey}/settings`);

  const nameLabel = page.getByText('Název projektu', { exact: true });
  await expect(nameLabel).toBeVisible();
  const nameInput = nameLabel.locator('xpath=following::input[1]');
  await expect(nameInput).toBeVisible();
  const originalName = await nameInput.inputValue();
  const newName = `${originalName} [E2E]`;

  await nameInput.fill(newName);
  await page.getByRole('button', { name: 'Uložit', exact: true }).click();
  await expect(page.getByText('Projekt aktualizován')).toBeVisible();

  // Cleanup
  await page.reload();
  const nameLabel2 = page.getByText('Název projektu', { exact: true });
  const nameInput2 = nameLabel2.locator('xpath=following::input[1]');
  await nameInput2.fill(originalName);
  await page.getByRole('button', { name: 'Uložit', exact: true }).click();
  await expect(page.getByText('Projekt aktualizován')).toBeVisible();
});

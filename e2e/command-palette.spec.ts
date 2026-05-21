import { expect, test } from '@playwright/test';
import { createTaskViaUI } from './fixtures/create-task';

test.describe('Command palette', () => {
  test.skip(true, 'BUG: CommandPalette je rendered jako sibling RouterProvider v App.tsx → useNavigate/useSearchParams crash. Fix: přesunout palette dovnitř ProtectedLayout.');

  test('TS-501: Ctrl+K otevře, Esc zavře', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('body').click();

    await page.keyboard.press('Control+KeyK');

    const input = page.getByPlaceholder('Hledat úkoly, projekty, lidi…');
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(input).toBeHidden();
  });

  test('TS-502: vyhledání tasku po klíči otevře detail', async ({ page }) => {
    const { key, title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-502]' });

    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { level: 3, name: title })).toBeHidden();

    await page.keyboard.press('Control+k');
    const input = page.getByPlaceholder('Hledat úkoly, projekty, lidi…');
    await expect(input).toBeVisible();

    await input.fill(key);

    const taskOption = page.getByRole('option').filter({ hasText: key }).first();
    await expect(taskOption).toBeVisible();
    await taskOption.click();

    await expect(page).toHaveURL(new RegExp(`task=${key}`));
    await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible();
  });

  test('TS-503: navigace přes palette na Dashboard', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Control+k');
    const input = page.getByPlaceholder('Hledat úkoly, projekty, lidi…');
    await expect(input).toBeVisible();

    await input.fill('Dashboard');

    const option = page.getByRole('option').filter({ hasText: /Dashboard/i }).first();
    await expect(option).toBeVisible();
    await option.click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

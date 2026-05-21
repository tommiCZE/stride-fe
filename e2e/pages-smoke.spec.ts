import { expect, test } from '@playwright/test';
import { openFirstProject } from './fixtures/nav';

test.describe('Stránky — smoke renders', () => {
  test('TS-1601: My Work renderuje', async ({ page }) => {
    await page.goto('/my-work');
    await expect(page).toHaveURL(/\/my-work/);
    await expect(page.getByText(/Moje práce|My Work/).first()).toBeVisible();
  });

  test('TS-1701: Inbox renderuje', async ({ page }) => {
    await page.goto('/inbox');
    await expect(page).toHaveURL(/\/inbox/);
    await expect(page.getByRole('heading', { name: /Inbox|Doručené/ })).toBeVisible();
  });

  test('TS-1901: Calendar renderuje', async ({ page }) => {
    await page.goto('/calendar');
    await expect(page).toHaveURL(/\/calendar/);
    await expect(page.locator('main, [role="main"], body')).toBeVisible();
  });

  test('TS-1501: Reports stránka — header viditelný', async ({ page }) => {
    await page.goto('/reports');
    await expect(page).toHaveURL(/\/reports/);
    await expect(page.getByRole('heading', { name: /Reporty času|Reports/i }).first()).toBeVisible();
  });

  test('TS-1401: Workspace settings — General sekce', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('TS-1301: Project settings — General sekce', async ({ page }) => {
    const projectKey = await openFirstProject(page);
    await page.goto(`/projects/${projectKey}/settings`);
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByText('Název projektu')).toBeVisible();
  });
});

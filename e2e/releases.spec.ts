import { expect, test, type Page } from '@playwright/test';
import { openFirstProject } from './fixtures/nav';

async function openReleases(page: Page) {
  const projectKey = await openFirstProject(page);
  await page.goto(`/projects/${projectKey}/releases`);
  await expect(page).toHaveURL(/\/releases$/);
}

test.describe('Releases', () => {
  test.beforeEach(async ({ page }) => {
    await openReleases(page);
  });

  test('TS-401: vytvoření release', async ({ page }) => {
    await page.getByRole('button', { name: 'Nová verze' }).click();

    await expect(page.getByText('Release vytvořen')).toBeVisible();
    await expect(page).toHaveURL(/\/releases\/[a-f0-9-]+/);
  });

  test('TS-402: označit release jako vydaný', async ({ page }) => {
    await page.getByRole('button', { name: 'Nová verze' }).click();
    await expect(page).toHaveURL(/\/releases\/[a-f0-9-]+/);

    await page.getByRole('button', { name: 'Označit jako vydané' }).click();

    await expect(page.getByRole('button', { name: 'Označit jako vydané' })).toBeHidden();
  });

  test('TS-403: smazání release', async ({ page }) => {
    await page.getByRole('button', { name: 'Nová verze' }).click();
    await expect(page).toHaveURL(/\/releases\/[a-f0-9-]+/);

    page.once('dialog', d => { void d.accept(); });
    await page.getByRole('button', { name: 'Smazat verzi' }).click();

    await expect(page.getByText('Verze smazána')).toBeVisible();
    await expect(page).toHaveURL(/\/releases$/);
  });
});

import { expect, test, type Page } from '@playwright/test';
import { openFirstProject } from './fixtures/nav';

async function openBacklog(page: Page) {
  const projectKey = await openFirstProject(page);
  await page.goto(`/projects/${projectKey}/backlog`);
  await expect(page).toHaveURL(/\/backlog/);
}

async function createSprintViaUI(page: Page, name: string) {
  await page.getByPlaceholder('Název nového sprintu…').fill(name);
  await page.getByRole('button', { name: 'Nový sprint' }).click();
  await expect(page.getByText(name).first()).toBeVisible({ timeout: 10_000 });
}

function sprintCard(page: Page, name: string) {
  return page.locator('.MuiCard-root', {
    has: page.getByText(name, { exact: true }),
  }).first();
}

test.describe('Backlog — sprint management', () => {
  test.beforeEach(async ({ page }) => {
    await openBacklog(page);
  });

  test('TS-301: vytvoření sprintu', async ({ page }) => {
    const name = `E2E TS-301 sprint ${Date.now()}`;
    await createSprintViaUI(page, name);

    await expect(sprintCard(page, name)).toBeVisible();
    await expect(sprintCard(page, name).getByText(/Plánovaný/i).first()).toBeVisible();
  });

  test('TS-302: spuštění sprintu', async ({ page }) => {
    const name = `E2E TS-302 sprint ${Date.now()}`;
    await createSprintViaUI(page, name);

    const card = sprintCard(page, name);
    await card.getByRole('button', { name: 'Spustit sprint' }).first().click();

    await expect(page.getByText(`Sprint "${name}" aktivován`)).toBeVisible();
    await expect(card.getByText(/Aktivní/i).first()).toBeVisible();
  });

  test('TS-303: dokončení sprintu', async ({ page }) => {
    const name = `E2E TS-303 sprint ${Date.now()}`;
    await createSprintViaUI(page, name);

    const card = sprintCard(page, name);
    await card.getByRole('button', { name: 'Spustit sprint' }).first().click();
    await expect(page.getByText(`Sprint "${name}" aktivován`)).toBeVisible();

    await card.getByRole('button', { name: 'Dokončit sprint' }).first().click();
    await expect(page.getByText(`Sprint "${name}" dokončen`)).toBeVisible();
    await expect(card.getByText(/Hotový/i).first()).toBeVisible();
  });
});

import { expect, test } from '@playwright/test';

test.describe('Vytvoření tasku — happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /aktivních úkolů$/ }).first().click();
    await expect(page).toHaveURL(/\/projects\/[^/]+\/board/);
  });

  test('TS-001: minimální task přes tlačítko Vytvořit', async ({ page }) => {
    const title = `[E2E TS-001] Minimal ${Date.now()}`;

    await page.getByRole('button', { name: /Nový task|New Task/ }).click();

    const titleInput = page.getByPlaceholder('Title…');
    await expect(titleInput).toBeVisible();
    await titleInput.fill(title);

    await page.getByRole('button', { name: /Vytvořit task/ }).click();

    await expect(titleInput).toBeHidden();
    await expect(page.getByText('Task vytvořen')).toBeVisible();
    await expect(page).toHaveURL(/[?&]task=[A-Z]+-\d+/);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  });

  test('TS-002: plný task (type Bug, popis, priority High) přes ⌘↵', async ({ page }) => {
    const title = `[E2E TS-002] Full ${Date.now()}`;
    const description = `Popis testovacího tasku ${Date.now()}.`;

    await page.getByRole('button', { name: /Nový task|New Task/ }).click();

    const titleInput = page.getByPlaceholder('Title…');
    await expect(titleInput).toBeVisible();

    const modal = page.locator('.MuiCard-root', { has: titleInput });

    await modal.getByText('Bug', { exact: true }).click();

    await titleInput.fill(title);

    const editor = modal.locator('[contenteditable="true"]').first();
    await editor.click();
    await editor.pressSequentially(description);

    await modal.getByText('High', { exact: true }).click();

    await titleInput.press('Control+Enter');

    await expect(titleInput).toBeHidden();
    await expect(page.getByText('Task vytvořen')).toBeVisible();
    await expect(page).toHaveURL(/[?&]task=[A-Z]+-\d+/);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();
  });

  test('TS-003: Esc zavře modal beze změny', async ({ page }) => {
    const title = `[E2E TS-003] Should not be created ${Date.now()}`;
    const urlBefore = page.url();

    await page.getByRole('button', { name: /Nový task|New Task/ }).click();

    const titleInput = page.getByPlaceholder('Title…');
    await expect(titleInput).toBeVisible();
    await titleInput.fill(title);

    await titleInput.press('Escape');

    await expect(titleInput).toBeHidden();
    expect(page.url()).toBe(urlBefore);
    await expect(page.getByText('Task vytvořen')).toHaveCount(0);
  });
});

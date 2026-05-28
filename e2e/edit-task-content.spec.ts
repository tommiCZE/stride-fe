import { expect, test, type Locator, type Page } from '@playwright/test';
import { createTaskViaUI } from './fixtures/create-task';

test.describe('Operace nad taskem — obsah', () => {
  test('TS-107: edit popisu (TipTap)', async ({ page }) => {
    const { title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-107]' });
    const marker = `popis${Date.now()}`;
    const description = `Popis tasku pro TS107 ${marker}`;

    const pencil = page.locator('.flux-edit-pencil').first();
    await pencil.hover();
    await pencil.click();

    const editor = page.locator('[contenteditable="true"]').last();
    await expect(editor).toBeVisible();
    await editor.click();
    await editor.pressSequentially(description);
    await expect(editor).toContainText(description);

    const saveButton = page.getByRole('button', { name: 'Uložit' });
    await saveButton.click();
    await expect(saveButton).toBeHidden();

    await page.reload();
    await expect(page.getByText(marker).first()).toBeVisible({ timeout: 10_000 });
  });

  test('TS-108: přidání komentáře', async ({ page }) => {
    const { title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-108]' });
    const commentText = `E2E komentář ${Date.now()}.`;

    const panel = detailPanel(page, title);
    // Composer placeholder text was "Napiš komentář…"; activity-stream now hints
    // "Napiš komentář, /commit pro odkaz na commit, @ pro mention…" before the editor mounts.
    // Match the stable prefix to survive either form.
    await panel.getByText(/Napiš komentář/).first().click();

    const editor = panel.locator('[contenteditable="true"]').last();
    await expect(editor).toBeVisible();
    await editor.click();
    await editor.pressSequentially(commentText);

    await panel.getByRole('button', { name: 'Uložit' }).click();

    await expect(page.getByText('Komentář přidán')).toBeVisible();
    await expect(panel.getByText(commentText)).toBeVisible();
  });

  test('TS-109: přidání subtasku a toggle done', async ({ page }) => {
    const { title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-109]' });
    const subtaskTitle = `Subtask ${Date.now()}`;

    const panel = detailPanel(page, title);
    await panel.getByRole('button', { name: /Přidat podúkol/ }).click();

    const subtaskInput = panel.getByPlaceholder('Název podúkolu…');
    await expect(subtaskInput).toBeVisible();
    await subtaskInput.fill(subtaskTitle);
    await subtaskInput.press('Enter');

    const subtaskTitleEl = panel.getByText(subtaskTitle, { exact: true });
    await expect(subtaskTitleEl).toBeVisible();

    const row = subtaskTitleEl.locator('xpath=..');
    const checkboxRoot = row.locator('.MuiCheckbox-root').first();
    await checkboxRoot.click();
    await expect(row.locator('input[type="checkbox"]')).toBeChecked();

    await expect(subtaskTitleEl).toHaveCSS('text-decoration-line', 'line-through');
  });

  test('TS-119: reply na komentář', async ({ page }) => {
    const { title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-119]' });
    const parentText = `E2E parent ${Date.now()}`;
    const replyText = `E2E reply ${Date.now()}`;

    const panel = detailPanel(page, title);

    // Composer placeholder text was "Napiš komentář…"; activity-stream now hints
    // "Napiš komentář, /commit pro odkaz na commit, @ pro mention…" before the editor mounts.
    // Match the stable prefix to survive either form.
    await panel.getByText(/Napiš komentář/).first().click();
    const composer = panel.locator('[contenteditable="true"]').last();
    await composer.click();
    await composer.pressSequentially(parentText);
    await panel.getByRole('button', { name: 'Uložit' }).click();
    await expect(page.getByText('Komentář přidán')).toBeVisible();

    await panel.getByText('Odpovědět').first().click();

    const replyEditor = panel.locator('[contenteditable="true"]').last();
    await expect(replyEditor).toBeVisible();
    await replyEditor.click();
    await replyEditor.pressSequentially(replyText);
    await panel.getByRole('button', { name: 'Uložit' }).click();

    await expect(page.getByText('Odpověď přidána')).toBeVisible();
    await expect(panel.getByText(replyText)).toBeVisible();
  });
});

function detailPanel(page: Page, title: string): Locator {
  return page.getByRole('heading', { level: 3, name: title }).locator('xpath=ancestor::*[2]');
}

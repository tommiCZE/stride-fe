import { expect, test, type Locator, type Page } from '@playwright/test';
import { createTaskViaUI } from './fixtures/create-task';

test.describe('Operace nad taskem — fieldy', () => {
  test('TS-101: změna title přes inline edit', async ({ page }) => {
    const { title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-101]' });
    const newTitle = `${title} (renamed)`;

    await page.getByRole('heading', { level: 3, name: title }).click();
    const titleInput = page.locator('textarea:focus');
    await expect(titleInput).toBeVisible();
    await titleInput.fill(newTitle);
    await titleInput.press('Enter');

    await expect(page.getByRole('heading', { level: 3, name: newTitle })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: title, exact: true })).toHaveCount(0);
  });

  test('TS-102: změna statusu přes picker', async ({ page }) => {
    const { title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-102]' });

    const panel = detailPanel(page, title);
    await panel.getByText('To Do', { exact: true }).click();
    await page.getByRole('menuitem', { name: 'In Progress' }).click();

    await expect(panel.getByText('In Progress', { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Status změněn na "In Progress"/)).toBeVisible();
  });

  test('TS-103: změna priority', async ({ page }) => {
    const { title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-103]' });

    const panel = detailPanel(page, title);
    await fieldRow(panel, 'Priorita').getByText('Medium').click();
    await page.getByRole('menuitem', { name: 'High' }).click();

    await expect(fieldRow(panel, 'Priorita').getByText('High')).toBeVisible();
  });

  test('TS-104: změna type', async ({ page }) => {
    const { title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-104]' });

    const panel = detailPanel(page, title);
    await fieldRow(panel, 'Typ').getByText('Task').click();
    await page.getByRole('menuitem', { name: 'Bug' }).click();

    await expect(fieldRow(panel, 'Typ').getByText('Bug')).toBeVisible();
  });

  test('TS-105: přiřazení assignee', async ({ page }) => {
    const { title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-105]' });

    const panel = detailPanel(page, title);
    const assigneeRow = fieldRow(panel, 'Assignee');
    await assigneeRow.getByText('Přiřadit').click();

    const menuItems = page.getByRole('menuitem');
    const count = await menuItems.count();
    expect(count).toBeGreaterThan(1);
    await menuItems.nth(1).click();

    await expect(assigneeRow.getByText('Přiřadit')).toHaveCount(0);
  });

  test('TS-106: nastavení due date', async ({ page }) => {
    const { title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-106]' });

    const panel = detailPanel(page, title);
    await fieldRow(panel, 'Due').getByText('—').click();

    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
    await dateInput.fill('2026-06-15');

    const dueRow = fieldRow(panel, 'Due');
    await expect(dateInput).toBeHidden();
    await expect(dueRow.getByText('—')).toHaveCount(0);
    await expect(dueRow).toContainText('15');
  });

  test('TS-114: sprint picker (Backlog assignment)', async ({ page }) => {
    const { title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-114]' });

    const panel = detailPanel(page, title);
    const sprintRow = fieldRow(panel, 'Sprint');
    await sprintRow.getByText(/Nastavit sprint|Sprint /).click();

    const menuItems = page.getByRole('menuitem');
    await expect(menuItems.first()).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Backlog' })).toBeVisible();

    await page.getByRole('menuitem', { name: 'Backlog' }).click();
    await expect(page.getByRole('menuitem', { name: 'Backlog' })).toBeHidden();
  });

  test('TS-115: edit estimate', async ({ page }) => {
    const { title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-115]' });

    const panel = detailPanel(page, title);
    const estimateRow = fieldRow(panel, 'Estimate');
    await estimateRow.getByText('—').click();

    const input = page.locator(':focus');
    await expect(input).toBeVisible();
    await input.fill('4');
    await input.press('Enter');

    await expect(estimateRow.getByText('4 h')).toBeVisible();
  });
});

function detailPanel(page: Page, title: string): Locator {
  return page.getByRole('heading', { level: 3, name: title }).locator('xpath=ancestor::*[2]');
}

function fieldRow(panel: Locator, label: string): Locator {
  return panel.getByText(label, { exact: true }).locator('xpath=ancestor::div[1]');
}

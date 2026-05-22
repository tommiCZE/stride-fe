import { expect, test } from '@playwright/test';
import { createTaskViaUI } from './fixtures/create-task';

const SEARCH_INPUT_PLACEHOLDER = 'Hledat tasky, projekty, lidi…';

test.describe('Vyhledávání tasků', () => {
  test('TS-1401: prázdný stav — žádný query, žádné filtry', async ({ page }) => {
    await page.goto('/search');
    await expect(page).toHaveURL(/\/search/);

    await expect(page.getByPlaceholder(SEARCH_INPUT_PLACEHOLDER)).toBeVisible();
    await expect(page.getByText('Začni hledat')).toBeVisible();
  });

  test('TS-1402: hledání podle titulku najde task', async ({ page }) => {
    const { title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-1402] Searchable' });

    await page.keyboard.press('Escape');

    await page.goto('/search');
    const input = page.getByPlaceholder(SEARCH_INPUT_PLACEHOLDER);
    await input.fill(title);
    await input.press('Enter');

    await expect(page).toHaveURL(/[?&]q=/);
    await expect(page.getByText('Úkoly', { exact: false })).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();
  });

  test('TS-1403: hledání podle task key najde task', async ({ page }) => {
    const { key, title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-1403] ByKey' });

    await page.keyboard.press('Escape');

    await page.goto('/search');
    const input = page.getByPlaceholder(SEARCH_INPUT_PLACEHOLDER);
    await input.fill(key);
    await input.press('Enter');

    await expect(page).toHaveURL(new RegExp(`[?&]q=${key}`));
    await expect(page.getByText(key, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();
  });

  test('TS-1404: nenalezený query zobrazí "Nic jsme nenašli"', async ({ page }) => {
    await page.goto('/search');
    const input = page.getByPlaceholder(SEARCH_INPUT_PLACEHOLDER);

    const noise = `xyz-no-match-${Date.now()}`;
    await input.fill(noise);
    await input.press('Enter');

    await expect(page.getByText('Nic jsme nenašli')).toBeVisible();
  });

  test('TS-1405: klik na výsledek otevře task detail (?task=KEY)', async ({ page }) => {
    const { key, title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-1405] OpenFromResult' });

    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { level: 3, name: title })).toBeHidden();

    await page.goto('/search');
    const input = page.getByPlaceholder(SEARCH_INPUT_PLACEHOLDER);
    await input.fill(key);
    await input.press('Enter');

    await page.getByText(key, { exact: true }).first().click();

    await expect(page).toHaveURL(new RegExp(`task=${key}`));
    await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible();
  });

  test('TS-1406: Esc v search inputu vyčistí query', async ({ page }) => {
    await page.goto('/search?q=ahoj');
    const input = page.getByPlaceholder(SEARCH_INPUT_PLACEHOLDER);
    await expect(input).toHaveValue('ahoj');

    await input.focus();
    await input.press('Escape');

    await expect(input).toHaveValue('');
    await expect(page).not.toHaveURL(/[?&]q=/);
    await expect(page.getByText('Začni hledat')).toBeVisible();
  });

  test('TS-1407: filtr "Typ = Bug" zachová Bug task ve výsledcích', async ({ page }) => {
    const { title } = await createTaskViaUI(page, {
      titlePrefix: '[E2E TS-1407] BugFilter',
      type: 'BUG',
    });

    await page.keyboard.press('Escape');

    await page.goto('/search');
    const input = page.getByPlaceholder(SEARCH_INPUT_PLACEHOLDER);
    await input.fill('[E2E TS-1407]');
    await input.press('Enter');
    await expect(page.getByText(title)).toBeVisible();

    await page.getByRole('button', { name: 'Typ', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Bug' }).click();
    await page.keyboard.press('Escape');

    await expect(page.getByText(title)).toBeVisible();
  });

  test('TS-1408: "Vyčistit filtry" odstraní zvolené filtry', async ({ page }) => {
    await page.goto('/search?q=test');

    await page.getByRole('button', { name: 'Typ', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Bug' }).click();
    await page.keyboard.press('Escape');

    await expect(page.getByRole('button', { name: 'Vyčistit filtry' })).toBeVisible();

    await page.getByRole('button', { name: 'Vyčistit filtry' }).click();

    await expect(page.getByRole('button', { name: 'Typ', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Vyčistit filtry' })).toBeHidden();
  });

  test('TS-1409: header search input naviguje na /search?q=...', async ({ page }) => {
    await page.goto('/');

    const headerSearch = page.getByPlaceholder(/Hledat tasky, projekty…|Search tasks, projects…/);
    await expect(headerSearch).toBeVisible();

    await headerSearch.fill('login');
    await headerSearch.press('Enter');

    await expect(page).toHaveURL(/\/search\?q=login/);
    await expect(page.getByPlaceholder(SEARCH_INPUT_PLACEHOLDER)).toHaveValue('login');
  });
});

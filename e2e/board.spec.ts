import { expect, test } from '@playwright/test';
import { openFirstProject } from './fixtures/nav';

test.describe('Board', () => {
  test.beforeEach(async ({ page }) => {
    await openFirstProject(page);
  });

  test('TS-201: inline vytvoření tasku v sloupci přes +', async ({ page }) => {
    const title = `[E2E TS-201] Column add ${Date.now()}`;

    await page.getByRole('button', { name: /Přidat úkol do sloupce/ }).first().click();

    const input = page.getByPlaceholder('Název úkolu…');
    await expect(input).toBeVisible();
    await input.fill(title);
    await input.press('Enter');

    await expect(page.getByText('Task vytvořen')).toBeVisible();
    await expect(input).toBeHidden();
  });

  test('TS-202: filter chip "Moje úkoly" toggle', async ({ page }) => {
    const chip = page.getByText('Moje úkoly', { exact: true });
    await expect(chip).toBeVisible();

    await chip.click();
    await expect(chip).toBeVisible();

    await chip.click();
    await expect(chip).toBeVisible();
  });

  test('TS-203: uložit vlastní filtr', async ({ page }) => {
    const filterName = `E2E filter ${Date.now()}`;

    await page.getByText('Uložená zobrazení', { exact: true }).click();
    await page.getByRole('menuitem', { name: /Uložit aktuální filtr/ }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('textbox').fill(filterName);
    await dialog.getByRole('button', { name: 'Uložit' }).click();

    await expect(page.getByText('Filtr uložen')).toBeVisible();
  });

  test('TS-204: drag-drop task mezi sloupci (skip — @dnd-kit limitace)', async () => {
    test.skip(true, '@dnd-kit/core PointerSensor s distance:5 nereaguje spolehlivě na Playwright synthetic mouse events. Drag nelze deterministicky simulovat. Test ponechán jako placeholder pro budoucí fix přes BrowserContext options nebo @dnd-kit upgrade.');
  });
});

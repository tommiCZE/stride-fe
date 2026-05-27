import { expect, test, type Page } from '@playwright/test';
import { openFirstProject } from './fixtures/nav';

async function openReleases(page: Page): Promise<string> {
  const projectKey = await openFirstProject(page);
  await page.goto(`/projects/${projectKey}/releases`);
  await expect(page).toHaveURL(/\/releases$/);
  // "Releases" header is a plain Typography (renders as <p>, not a heading), and
  // "Nová verze" appears both as toolbar button and the empty-state CTA — use the
  // toolbar button to confirm the page mounted.
  await expect(page.getByRole('button', { name: 'Nová verze' }).first()).toBeVisible();
  return projectKey;
}

// Drawer + form → override default name with a unique value → submit. Returns the name + id.
// Note: the default from smartDefault() can collide with releases left over from prior runs,
// so we always type a per-test unique name.
async function createReleaseViaDrawer(page: Page): Promise<{ name: string; id: string }> {
  await page.getByRole('button', { name: 'Nová verze' }).first().click();
  const submit = page.getByRole('button', { name: 'Vytvořit verzi' });
  await expect(submit).toBeVisible();

  // The Stack inside the drawer renders as <form> (component="form"), so we scope to it.
  // First text input inside that form is the name field; DatePickers expose role=spinbutton,
  // not textbox, so they don't interfere. Scoping avoids grabbing the header search input,
  // which sits ahead of the drawer in document order at desktop viewports.
  const nameInput = page.locator('form').filter({
    has: page.getByRole('button', { name: 'Vytvořit verzi' }),
  }).locator('input[type="text"]').first();
  const uniqueName = `v9.${Date.now() % 1_000_000}.0`;
  await nameInput.fill(uniqueName);

  await submit.click();
  // URL change is the deterministic success signal (the toast auto-hides after 3s).
  await expect(page).toHaveURL(/\/releases\/[a-f0-9-]+/, { timeout: 10_000 });

  const idMatch = page.url().match(/\/releases\/([a-f0-9-]+)/);
  if (!idMatch) throw new Error('Release id not found in URL after create');
  const id = idMatch[1];

  // Sanity check the hero name matches what we typed.
  await expect(page.getByText(uniqueName, { exact: true }).first()).toBeVisible();

  return { name: uniqueName, id };
}

test.describe('Releases', () => {
  test('TS-401: vytvoření verze přes drawer', async ({ page }) => {
    await openReleases(page);
    const { name, id } = await createReleaseViaDrawer(page);

    expect(name).toMatch(/^v\d+\.\d+\.\d+/);
    expect(id).toMatch(/^[a-f0-9-]+$/);
    // Detail renders hero with Publish CTA (status=unreleased after create).
    await expect(page.getByRole('button', { name: 'Publish release' })).toBeVisible();
  });

  test('TS-402: rozbalení karty zapíše ID do URL', async ({ page }) => {
    const projectKey = await openReleases(page);
    const { name, id } = await createReleaseViaDrawer(page);

    await page.goto(`/projects/${projectKey}/releases`);
    await expect(page).toHaveURL(/\/releases$/);

    // Click the card header (release name); first match — our card is in "Nadcházející".
    await page.getByText(name, { exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`expand=${id}`));
  });

  test('TS-403: publish dialog vydá verzi', async ({ page }) => {
    await openReleases(page);
    const { name } = await createReleaseViaDrawer(page);

    await page.getByRole('button', { name: 'Publish release' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(`Vydat ${name}?`);

    // Fresh release has 0 tasks → button label is "Vydat 0 hotových →".
    await dialog.getByRole('button', { name: /Vydat \d+ hotových/ }).click();

    // Status flips to released → primary CTA changes from "Publish release" to "Re-publish notes".
    await expect(page.getByRole('button', { name: 'Re-publish notes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish release' })).toBeHidden();
  });

  test('TS-404: smazání vyžaduje napsat název', async ({ page }) => {
    await openReleases(page);
    const { name } = await createReleaseViaDrawer(page);

    // Hero "Smazat" button opens the confirm dialog.
    await page.getByRole('button', { name: 'Smazat' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading')).toHaveText(`Smazat verzi ${name}?`);

    const confirmButton = dialog.getByRole('button', { name: 'Smazat' });
    await expect(confirmButton).toBeDisabled();

    // Wrong name keeps button disabled.
    await dialog.getByRole('textbox').fill('not-the-name');
    await expect(confirmButton).toBeDisabled();

    // Exact name enables it.
    await dialog.getByRole('textbox').fill(name);
    await expect(confirmButton).toBeEnabled();

    await confirmButton.click();
    // Dialog closes and we navigate back to /releases. (Toast auto-hides; URL is the
    // deterministic signal.)
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/releases$/, { timeout: 10_000 });
  });
});

import { expect, test, type Locator, type Page } from '@playwright/test';
import { createTaskViaUI } from './fixtures/create-task';
import { openFirstProject } from './fixtures/nav';

async function openBacklog(page: Page): Promise<string> {
  const projectKey = await openFirstProject(page);
  await page.goto(`/projects/${projectKey}/backlog`);
  await expect(page).toHaveURL(/\/backlog/);
  return projectKey;
}

async function createSprintViaUI(page: Page, name: string) {
  await page.getByPlaceholder('Název nového sprintu…').fill(name);
  await page.getByRole('button', { name: 'Nový sprint' }).click();
  await expect(page.getByText(name).first()).toBeVisible({ timeout: 10_000 });
}

function sprintCard(page: Page, name: string): Locator {
  return page.locator('.MuiCard-root', {
    has: page.getByText(name, { exact: true }),
  }).first();
}

function backlogCard(page: Page): Locator {
  return page.locator('.MuiCard-root', {
    has: page.getByText('Backlog', { exact: true }),
  }).first();
}

function rowByTaskKey(page: Page, taskKey: string): Locator {
  return page
    .locator('.MuiStack-root', { hasText: taskKey })
    .filter({ has: page.locator('.grip') })
    .first();
}

async function startSprint(page: Page, name: string): Promise<Locator> {
  const card = sprintCard(page, name);
  await card.getByRole('button', { name: 'Spustit sprint' }).first().click();
  await expect(page.getByText(`Sprint "${name}" aktivován`)).toBeVisible();
  return card;
}

async function dragTaskTo(page: Page, taskKey: string, target: Locator) {
  const row = rowByTaskKey(page, taskKey);
  await row.hover();

  const grip = row.locator('.grip').first();
  const gripBox = await grip.boundingBox();
  if (!gripBox) throw new Error(`Grip not found for task ${taskKey}`);

  const targetBox = await target.boundingBox();
  if (!targetBox) throw new Error('Target box not found');

  const startX = gripBox.x + gripBox.width / 2;
  const startY = gripBox.y + gripBox.height / 2;
  const endX = targetBox.x + targetBox.width / 2;
  const endY = targetBox.y + targetBox.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 6, startY + 6, { steps: 5 });
  await page.mouse.move(endX, endY, { steps: 25 });
  await page.mouse.move(endX, endY);
  await page.mouse.up();
}

test.describe('Backlog — task interakce', () => {
  test('TS-320: klik na řádek otevře task detail (?task=KEY)', async ({ page }) => {
    const { key, title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-320] RowClick' });

    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { level: 3, name: title })).toBeHidden();

    const projectKey = key.split('-')[0];
    await page.goto(`/projects/${projectKey}/backlog`);
    await expect(page).toHaveURL(/\/backlog/);

    await rowByTaskKey(page, key).click();

    await expect(page).toHaveURL(new RegExp(`task=${key}`));
    await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible();
  });

  test('TS-321: "Nový sprint" button je disabled při prázdném jménu', async ({ page }) => {
    await openBacklog(page);

    const input = page.getByPlaceholder('Název nového sprintu…');
    const button = page.getByRole('button', { name: 'Nový sprint' });

    await expect(input).toHaveValue('');
    await expect(button).toBeDisabled();

    await input.fill('   ');
    await expect(button).toBeDisabled();

    await input.fill('Něco');
    await expect(button).toBeEnabled();

    await input.fill('');
    await expect(button).toBeDisabled();
  });

  test('TS-322: drag task z backlogu do aktivního sprintu', async ({ page }) => {
    test.skip(
      true,
      '@dnd-kit/core PointerSensor s distance:5 stejně jako u TS-204 nereaguje spolehlivě na Playwright synthetic events. Helper dragTaskTo() je připravený — odskip a zkus po @dnd-kit upgradeu nebo experimentálně s page.mouse + steps.',
    );

    const { key, title } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-322] DragIn' });
    await page.keyboard.press('Escape');

    const projectKey = key.split('-')[0];
    await page.goto(`/projects/${projectKey}/backlog`);

    const sprintName = `E2E TS-322 sprint ${Date.now()}`;
    await createSprintViaUI(page, sprintName);
    const card = await startSprint(page, sprintName);

    await expect(backlogCard(page).getByText(key, { exact: true })).toBeVisible();
    await expect(card.getByText(key, { exact: true })).toHaveCount(0);

    await dragTaskTo(page, key, card);

    await expect(card.getByText(key, { exact: true })).toBeVisible();
    await expect(card.getByText(title)).toBeVisible();
    await expect(backlogCard(page).getByText(key, { exact: true })).toHaveCount(0);
  });

  test('TS-323: drag task z aktivního sprintu zpět do backlogu', async ({ page }) => {
    test.skip(
      true,
      '@dnd-kit/core PointerSensor + Playwright synthetic events — viz TS-322.',
    );

    const { key } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-323] DragOut' });
    await page.keyboard.press('Escape');

    const projectKey = key.split('-')[0];
    await page.goto(`/projects/${projectKey}/backlog`);

    const sprintName = `E2E TS-323 sprint ${Date.now()}`;
    await createSprintViaUI(page, sprintName);
    const card = await startSprint(page, sprintName);

    await dragTaskTo(page, key, card);
    await expect(card.getByText(key, { exact: true })).toBeVisible();

    await dragTaskTo(page, key, backlogCard(page));

    await expect(backlogCard(page).getByText(key, { exact: true })).toBeVisible();
    await expect(card.getByText(key, { exact: true })).toHaveCount(0);
  });

  test('TS-324: reorder tasku v rámci backlogu', async ({ page }) => {
    test.skip(
      true,
      '@dnd-kit/core PointerSensor + Playwright synthetic events — viz TS-322.',
    );

    const { key: keyA } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-324a]' });
    await page.keyboard.press('Escape');

    const { key: keyB } = await createTaskViaUI(page, { titlePrefix: '[E2E TS-324b]' });
    await page.keyboard.press('Escape');

    const projectKey = keyA.split('-')[0];
    await page.goto(`/projects/${projectKey}/backlog`);

    const rowA = rowByTaskKey(page, keyA);
    const rowB = rowByTaskKey(page, keyB);

    const boxABefore = await rowA.boundingBox();
    const boxBBefore = await rowB.boundingBox();
    if (!boxABefore || !boxBBefore) throw new Error('Row boxes not found');
    const aIsAboveB = boxABefore.y < boxBBefore.y;

    await dragTaskTo(page, keyA, rowB);

    const boxAAfter = await rowByTaskKey(page, keyA).boundingBox();
    const boxBAfter = await rowByTaskKey(page, keyB).boundingBox();
    if (!boxAAfter || !boxBAfter) throw new Error('Row boxes after drag not found');
    const aIsAboveBAfter = boxAAfter.y < boxBAfter.y;

    expect(aIsAboveBAfter).not.toBe(aIsAboveB);
  });
});

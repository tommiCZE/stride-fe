import { expect, type Page } from '@playwright/test';

export type TaskType = 'STORY' | 'TASK' | 'BUG' | 'EPIC';

export interface CreatedTask {
  key: string;
  title: string;
}

export interface CreateTaskOptions {
  titlePrefix: string;
  type?: TaskType;
}

const TYPE_LABELS: Record<TaskType, string> = {
  STORY: 'Story',
  TASK: 'Task',
  BUG: 'Bug',
  EPIC: 'Epic',
};

export async function createTaskViaUI(
  page: Page,
  opts: CreateTaskOptions,
): Promise<CreatedTask> {
  const title = `${opts.titlePrefix} ${Date.now()}`;

  await page.goto('/');
  await page.getByRole('button', { name: /aktivních úkolů$/ }).first().click();
  await expect(page).toHaveURL(/\/projects\/[^/]+\/board/);

  await page.getByRole('button', { name: /Nový task|New Task/ }).click();

  const titleInput = page.getByPlaceholder('Title…');
  await expect(titleInput).toBeVisible();
  const modal = page.locator('.MuiCard-root', { has: titleInput });

  if (opts.type && opts.type !== 'TASK') {
    await modal.getByText(TYPE_LABELS[opts.type], { exact: true }).click();
  }

  await titleInput.fill(title);
  await page.getByRole('button', { name: /Vytvořit task/ }).click();

  await expect(titleInput).toBeHidden();
  await expect(page).toHaveURL(/[?&]task=[A-Z]+-\d+/);

  const match = page.url().match(/[?&]task=([A-Z]+-\d+)/);
  if (!match) throw new Error('Task key not found in URL after create');
  const key = match[1];

  await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible();

  return { key, title };
}

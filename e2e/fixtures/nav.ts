import { expect, type Page } from '@playwright/test';

export async function openFirstProject(page: Page): Promise<string> {
  await page.goto('/');
  await page.getByRole('button', { name: /aktivních úkolů$/ }).first().click();
  await expect(page).toHaveURL(/\/projects\/[^/]+\/board/);
  const match = page.url().match(/\/projects\/([^/]+)\//);
  if (!match) throw new Error('Project key not found in URL');
  return match[1];
}

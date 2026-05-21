import type { Locator, Page } from '@playwright/test';

export function detailPanel(page: Page, title: string): Locator {
  return page.getByRole('heading', { level: 3, name: title }).locator('xpath=ancestor::*[2]');
}

export function fieldRow(panel: Locator, label: string): Locator {
  return panel.getByText(label, { exact: true }).locator('xpath=ancestor::div[1]');
}

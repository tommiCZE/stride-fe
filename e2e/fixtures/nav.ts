import { expect, type Page } from '@playwright/test';

// Navigate to the first project's board via the dashboard "Projekty" card.
// The earlier approach went through the sidebar's project ListItemButton (matched by
// `aria-label="<name>, <N> aktivních úkolů"`), but AppLayout hides the sidebar behind a
// mobile Drawer at sub-md viewports — and headless Chromium without an explicit viewport
// renders below md. Dashboard tiles render the same at every viewport, so they're the
// stable entry point.
export async function openFirstProject(page: Page): Promise<string> {
  await page.goto('/');
  // Dashboard project tiles render "<KEY> · <Lead>" as a `<p>` inside a clickable Box.
  // The click bubbles to the parent's onClick → navigate(`/projects/${key}/board`).
  // {2,} avoids matching single-letter avatars; "·" anchors to the project-key paragraph.
  await page.locator('text=/^[A-Z]{2,} · /').first().click();
  await expect(page).toHaveURL(/\/projects\/[^/]+\/board/);
  const match = page.url().match(/\/projects\/([^/]+)\//);
  if (!match) throw new Error('Project key not found in URL');
  return match[1];
}

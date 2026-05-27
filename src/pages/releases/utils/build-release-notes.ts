import { TASK_TYPES } from '../../../constants/taskTypes';
import type { ReleaseDto, TaskSummaryDto } from '../../../api/types';

export function buildReleaseNotes(release: ReleaseDto, tasks: TaskSummaryDto[]): string {
  const done = tasks.filter(t => t.status === 'DONE');
  const byType = new Map<string, TaskSummaryDto[]>();
  for (const t of done) {
    const arr = byType.get(t.type) ?? [];
    arr.push(t);
    byType.set(t.type, arr);
  }

  const lines: string[] = [];
  lines.push(`# ${release.name}`);
  if (release.releaseDate) lines.push('', `_Vydáno ${release.releaseDate}_`);
  if (release.goal) lines.push('', `> ${release.goal}`);

  for (const tt of TASK_TYPES) {
    const items = byType.get(tt.id);
    if (!items?.length) continue;
    lines.push('', `## ${tt.name} · ${items.length}`);
    for (const t of items) lines.push(`- **${t.key}** — ${t.title}`);
  }

  if (done.length === 0) {
    lines.push('', '_Zatím žádné dokončené tasky._');
  }

  return lines.join('\n');
}

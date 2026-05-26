import type { TaskSummaryDto } from '../api/types';

export type Readiness = 'READY' | 'GROOMING' | 'ICEBOX';

const ICEBOX_AGE_MS = 30 * 24 * 3600 * 1000;

export function getReadiness(t: TaskSummaryDto, now: number = Date.now()): Readiness {
  const hasEstimate = (t.estimate ?? 0) > 0;
  const hasAssignee = !!t.assigneeId;
  const isStale = t.updatedAt
    ? now - new Date(t.updatedAt).getTime() > ICEBOX_AGE_MS
    : false;

  if (isStale && !hasAssignee) return 'ICEBOX';
  if (hasEstimate && hasAssignee) return 'READY';
  return 'GROOMING';
}

interface ReadinessMeta {
  label: string;
  hint: string;
  tone: 'success' | 'warning' | 'neutral';
  collapsedByDefault?: boolean;
}

export const READINESS_META: Record<Readiness, ReadinessMeta> = {
  READY:    { label: 'Ready for sprint', hint: 'má estimate + assignee',           tone: 'success' },
  GROOMING: { label: 'Needs grooming',   hint: 'chybí estimate nebo assignee',     tone: 'warning' },
  ICEBOX:   { label: 'Icebox',           hint: 'starší než 30 dní · nikdo nezasáh', tone: 'neutral', collapsedByDefault: true },
};

export const READINESS_ORDER: Readiness[] = ['READY', 'GROOMING', 'ICEBOX'];

export function groupByReadiness(tasks: TaskSummaryDto[]): Record<Readiness, TaskSummaryDto[]> {
  const out: Record<Readiness, TaskSummaryDto[]> = { READY: [], GROOMING: [], ICEBOX: [] };
  for (const t of tasks) out[getReadiness(t)].push(t);
  return out;
}

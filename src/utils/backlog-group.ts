import type { ReleaseDto, TaskSummaryDto } from '../api/types';
import {
  groupByReadiness, READINESS_META, READINESS_ORDER,
} from './task-readiness';

export type GroupBy = 'readiness' | 'priority' | 'status' | 'fixVersion' | 'none';

export type GroupTone = 'success' | 'warning' | 'neutral' | 'info' | 'danger';

export interface GroupSection {
  key: string;
  label: string;
  hint?: string;
  tone?: GroupTone;
  tasks: TaskSummaryDto[];
  collapsible: boolean;
  defaultCollapsed?: boolean;
}

export const GROUP_OPTIONS: { id: GroupBy; label: string }[] = [
  { id: 'readiness',  label: 'Readiness' },
  { id: 'priority',   label: 'Priority' },
  { id: 'status',     label: 'Status' },
  { id: 'fixVersion', label: 'Fix version' },
  { id: 'none',       label: 'None' },
];

const PRIORITY_ORDER = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const;
const PRIORITY_LABELS: Record<string, string> = {
  URGENT: 'Urgent', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low',
};
const PRIORITY_TONE: Record<string, GroupTone> = {
  URGENT: 'danger', HIGH: 'warning', MEDIUM: 'neutral', LOW: 'neutral',
};

const STATUS_ORDER = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;
const STATUS_LABELS: Record<string, string> = {
  TODO: 'To do', IN_PROGRESS: 'V práci', REVIEW: 'Review', DONE: 'Done',
};
const STATUS_TONE: Record<string, GroupTone> = {
  TODO: 'neutral', IN_PROGRESS: 'info', REVIEW: 'warning', DONE: 'success',
};

export function groupTasks(
  tasks: TaskSummaryDto[],
  mode: GroupBy,
  releases: ReleaseDto[] = [],
): GroupSection[] {
  if (mode === 'none') {
    return [{ key: 'all', label: '', tasks, collapsible: false }];
  }
  if (mode === 'readiness') {
    const grouped = groupByReadiness(tasks);
    return READINESS_ORDER
      .map<GroupSection>(r => ({
        key: r,
        label: READINESS_META[r].label,
        hint: READINESS_META[r].hint,
        tone: READINESS_META[r].tone,
        tasks: grouped[r],
        collapsible: true,
        defaultCollapsed: READINESS_META[r].collapsedByDefault,
      }))
      .filter(s => s.tasks.length > 0);
  }
  if (mode === 'priority') {
    return PRIORITY_ORDER
      .map<GroupSection>(p => ({
        key: p, label: PRIORITY_LABELS[p], tone: PRIORITY_TONE[p],
        tasks: tasks.filter(t => t.priority === p),
        collapsible: true,
      }))
      .filter(s => s.tasks.length > 0);
  }
  if (mode === 'status') {
    return STATUS_ORDER
      .map<GroupSection>(s => ({
        key: s, label: STATUS_LABELS[s], tone: STATUS_TONE[s],
        tasks: tasks.filter(t => t.status === s),
        collapsible: true,
      }))
      .filter(s => s.tasks.length > 0);
  }
  if (mode === 'fixVersion') {
    const byRelease = new Map<string, TaskSummaryDto[]>();
    for (const t of tasks) {
      const key = t.fixVersionId ?? '__none__';
      const arr = byRelease.get(key) ?? [];
      arr.push(t);
      byRelease.set(key, arr);
    }
    const sections: GroupSection[] = [];
    for (const r of releases) {
      const list = byRelease.get(r.id);
      if (!list || list.length === 0) continue;
      sections.push({
        key: `release:${r.id}`,
        label: r.name,
        hint: r.releaseDate ? `→ ${r.releaseDate}` : undefined,
        tone: r.status === 'released' ? 'success' : 'info',
        tasks: list,
        collapsible: true,
      });
    }
    const noVersion = byRelease.get('__none__');
    if (noVersion && noVersion.length > 0) {
      sections.push({
        key: '__no_version__',
        label: 'Bez release',
        hint: 'task není přiřazen k žádnému release',
        tone: 'neutral',
        tasks: noVersion,
        collapsible: true,
      });
    }
    return sections;
  }
  return [];
}

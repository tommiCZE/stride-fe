import type { TaskSummaryDto } from '../api/types';

export type QuickChip = 'all' | 'mine' | 'bugs' | 'no-estimate' | 'overdue';

export const QUICK_CHIPS: { id: QuickChip; label: string }[] = [
  { id: 'all',          label: 'Vše' },
  { id: 'mine',         label: 'Mně' },
  { id: 'bugs',         label: 'Bugy' },
  { id: 'no-estimate',  label: 'Bez estimate' },
  { id: 'overdue',      label: 'Po termínu' },
];

export function applyFilter(
  tasks: TaskSummaryDto[],
  quickChip: QuickChip,
  currentUserId: string | null,
  search: string,
): TaskSummaryDto[] {
  let out = tasks;

  switch (quickChip) {
    case 'mine':
      out = out.filter(t => t.assigneeId === currentUserId);
      break;
    case 'bugs':
      out = out.filter(t => t.type === 'BUG');
      break;
    case 'no-estimate':
      out = out.filter(t => !t.estimate);
      break;
    case 'overdue': {
      const today = new Date().toISOString().slice(0, 10);
      out = out.filter(t => t.dueDate && t.dueDate < today && t.status !== 'DONE');
      break;
    }
    case 'all':
    default:
      break;
  }

  const q = search.trim().toLowerCase();
  if (q) {
    out = out.filter(t =>
      t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q),
    );
  }

  return out;
}

export type SortBy = 'manual' | 'priority' | 'updated' | 'created' | 'estimate';

export const SORT_OPTIONS: { id: SortBy; label: string }[] = [
  { id: 'manual',   label: 'Manual' },
  { id: 'priority', label: 'Priority' },
  { id: 'updated',  label: 'Updated' },
  { id: 'created',  label: 'Created' },
  { id: 'estimate', label: 'Estimate' },
];

const PRIORITY_RANK: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export function applySort(tasks: TaskSummaryDto[], sortBy: SortBy): TaskSummaryDto[] {
  if (sortBy === 'manual') return tasks;
  const sorted = [...tasks];
  switch (sortBy) {
    case 'priority':
      return sorted.sort((a, b) =>
        (PRIORITY_RANK[a.priority] ?? 99) - (PRIORITY_RANK[b.priority] ?? 99),
      );
    case 'estimate':
      return sorted.sort((a, b) => (b.estimate ?? 0) - (a.estimate ?? 0));
    case 'updated':
      return sorted.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
    case 'created':
      return sorted.sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
    default:
      return sorted;
  }
}

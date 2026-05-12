export interface BoardStatus {
  id: string;
  name: string;
  color: string;
  wip: number | null;
}

export const BOARD_STATUSES: BoardStatus[] = [
  { id: 'TODO',        name: 'To Do',       color: '#64748b', wip: null },
  { id: 'IN_PROGRESS', name: 'In Progress', color: '#3b82f6', wip: 5    },
  { id: 'IN_REVIEW',   name: 'In Review',   color: '#a855f7', wip: 3    },
  { id: 'DONE',        name: 'Done',        color: '#10b981', wip: null },
];

export interface TaskType {
  id: string;
  name: string;
  color: string;
}

export const TASK_TYPES: TaskType[] = [
  { id: 'STORY', name: 'Story', color: '#22c55e' },
  { id: 'TASK',  name: 'Task',  color: '#3b82f6' },
  { id: 'BUG',   name: 'Bug',   color: '#ef4444' },
  { id: 'EPIC',  name: 'Epic',  color: '#a855f7' },
];

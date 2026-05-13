import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../api/axios';
import type { TaskSummaryDto, TaskFilters } from '../api/types';
import { taskKeys } from './useTasks';

export interface TasksCursorPage {
  items: TaskSummaryDto[];
  nextCursor: string | null;
}

const PAGE_SIZE = 50;

type CursorFilters = Omit<TaskFilters, 'page' | 'size'>;

function fetchTasksPage(
  projectId: string,
  cursor: string | null,
  filters?: CursorFilters,
): Promise<TasksCursorPage> {
  const params: Record<string, string | number> = {
    cursor: cursor ?? '',
    limit: PAGE_SIZE,
  };
  if (filters?.sprint) params.sprint = filters.sprint;
  if (filters?.status) params.status = filters.status;
  if (filters?.assignee) params.assignee = filters.assignee;
  if (filters?.label) params.label = filters.label;
  if (filters?.priority) params.priority = filters.priority;

  return api
    .get<TasksCursorPage>(`/api/projects/${projectId}/tasks`, { params })
    .then(r => r.data);
}

export function useTasksPaginated(projectId: string, filters?: CursorFilters) {
  return useInfiniteQuery<TasksCursorPage>({
    queryKey: [...taskKeys.list(projectId, filters), 'infinite'],
    queryFn: ({ pageParam }) =>
      fetchTasksPage(projectId, (pageParam as string | null) ?? null, filters),
    initialPageParam: null as string | null,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    enabled: !!projectId,
  });
}

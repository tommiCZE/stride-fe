import { useQuery } from '@tanstack/react-query';
import { devActivityApi } from '../api/dev-activity';
import type { TaskDevActivity } from '../types/dev-activity';

const EMPTY: TaskDevActivity = { branches: [], reviews: [] };

export const devActivityKeys = {
  byTask: (taskId: string) => ['dev-activity', taskId] as const,
};

/**
 * Dev/Git activity (branches, commits, MRs) for a task, pulled from the BE
 * webhook-populated tables. Empty dataset until a matching push hook arrives.
 */
export function useDevActivity(taskId: string | undefined): TaskDevActivity {
  const { data } = useQuery({
    queryKey: devActivityKeys.byTask(taskId ?? ''),
    queryFn: () => devActivityApi.get(taskId!),
    enabled: !!taskId,
    staleTime: 30_000,
  });
  return data ?? EMPTY;
}

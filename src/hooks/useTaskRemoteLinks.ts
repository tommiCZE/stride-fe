import { useQuery } from '@tanstack/react-query';
import { taskRemoteLinksApi } from '../api/task-remote-links';

export const taskRemoteLinkKeys = {
  byTask: (taskId: string) => ['task-remote-links', taskId] as const,
};

export function useTaskRemoteLinks(taskId: string) {
  return useQuery({
    queryKey: taskRemoteLinkKeys.byTask(taskId),
    queryFn: () => taskRemoteLinksApi.list(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 30,
  });
}

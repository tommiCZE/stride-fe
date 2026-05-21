import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskRemoteLinksApi, type CreateRemoteLinkRequest } from '../api/task-remote-links';
import { useMutationWithToast } from './use-mutation-with-toast';
import { taskKeys } from './useTasks';
import type { RemoteLinkProvider } from '../api/types';

export const taskRemoteLinkKeys = {
  byTask: (taskId: string) => ['task-remote-links', taskId] as const,
  search: (taskId: string, provider: RemoteLinkProvider, q: string) =>
    ['task-remote-links-search', taskId, provider, q] as const,
};

export function useTaskRemoteLinks(taskId: string) {
  return useQuery({
    queryKey: taskRemoteLinkKeys.byTask(taskId),
    queryFn: () => taskRemoteLinksApi.list(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 30,
  });
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
  if (typeof detail === 'string' && detail.length > 0) return detail;
  return fallback;
}

export function useCreateTaskRemoteLink(taskId: string) {
  const qc = useQueryClient();
  return useMutationWithToast({
    mutationFn: (body: CreateRemoteLinkRequest) => taskRemoteLinksApi.create(taskId, body),
    successMessage: 'Propojeno',
    errorMessage: (err) => extractApiErrorMessage(err, 'Propojení selhalo'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskRemoteLinkKeys.byTask(taskId) });
      qc.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
    },
  });
}

export function useDeleteTaskRemoteLink(taskId: string) {
  const qc = useQueryClient();
  return useMutationWithToast({
    mutationFn: (linkId: string) => taskRemoteLinksApi.remove(taskId, linkId),
    successMessage: 'Odpojeno',
    errorMessage: (err) => extractApiErrorMessage(err, 'Odpojení selhalo'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskRemoteLinkKeys.byTask(taskId) });
      qc.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
    },
  });
}

export function useSearchTaskRemoteLinks(
  taskId: string,
  provider: RemoteLinkProvider | null,
  q: string,
) {
  const enabled = !!taskId && !!provider;
  return useQuery({
    queryKey: taskRemoteLinkKeys.search(taskId, provider ?? 'github', q),
    queryFn: () => taskRemoteLinksApi.search(taskId, provider!, q),
    enabled,
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  });
}

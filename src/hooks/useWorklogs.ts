import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { worklogsApi } from '../api/worklogs';
import type { CreateWorklogRequest } from '../api/types';
import { taskKeys } from './useTasks';

export const worklogKeys = {
  all: ['worklogs'] as const,
  list: (taskId: string) => [...worklogKeys.all, taskId] as const,
};

export function useWorklogs(taskId: string) {
  return useQuery({
    queryKey: worklogKeys.list(taskId),
    queryFn: () => worklogsApi.list(taskId),
    enabled: !!taskId,
  });
}

export function useCreateWorklog(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorklogRequest) => worklogsApi.create(taskId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: worklogKeys.list(taskId) });
      qc.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
    },
  });
}

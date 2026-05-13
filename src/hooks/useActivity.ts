import { useQuery } from '@tanstack/react-query';
import { activityApi } from '../api/activity';

export const activityKeys = {
  all: ['activity'] as const,
  list: (taskId: string) => [...activityKeys.all, taskId] as const,
  global: (limit: number) => [...activityKeys.all, 'global', limit] as const,
};

export function useActivity(taskId: string) {
  return useQuery({
    queryKey: activityKeys.list(taskId),
    queryFn: () => activityApi.list(taskId),
    enabled: !!taskId,
  });
}

export function useGlobalActivity(limit = 20) {
  return useQuery({
    queryKey: activityKeys.global(limit),
    queryFn: () => activityApi.global(limit),
    staleTime: 30_000,
  });
}

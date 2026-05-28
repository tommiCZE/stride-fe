import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks';
import type { CreateTaskRequest, UpdateTaskRequest, TaskFilters } from '../api/types';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (projectId: string, filters?: TaskFilters) =>
    [...taskKeys.lists(), projectId, filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  byKey: (key: string) => [...taskKeys.details(), 'by-key', key] as const,
};

export function useTasks(projectId: string, filters?: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(projectId, filters),
    // BE paginates at 50/page; board, backlog, list view all expect the full set, so
    // request a high page size unless the caller explicitly asked otherwise.
    queryFn: () => tasksApi.list(projectId, { size: 500, ...filters }),
    enabled: !!projectId,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.get(id),
    enabled: !!id,
  });
}

export function useTaskByKey(key: string) {
  return useQuery({
    queryKey: taskKeys.byKey(key),
    queryFn: () => tasksApi.getByKey(key),
    enabled: !!key,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTaskRequest) => tasksApi.create(body),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: taskKeys.list(vars.projectId) }),
  });
}

export function useUpdateTask(projectId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTaskRequest }) =>
      tasksApi.update(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: taskKeys.detail(id) });
      qc.invalidateQueries({ queryKey: taskKeys.details() });
      if (projectId) qc.invalidateQueries({ queryKey: taskKeys.list(projectId) });
    },
  });
}

export function useAllProjectTasks(projectIds: string[]) {
  const results = useQueries({
    queries: projectIds.map(id => ({
      queryKey: taskKeys.list(id),
      // BE paginates /tasks at 50/page by default. All consumers of this hook (search,
      // dashboard stats, sidebar badges, my-work, calendar, reports) expect the full set,
      // so request a high page size up front.
      queryFn: () => tasksApi.list(id, { size: 500 }),
      enabled: !!id,
    })),
  });
  const erroredResult = results.find(r => r.isError);
  return {
    data: results.flatMap(r => r.data ?? []),
    isLoading: results.some(r => r.isLoading),
    isError: results.some(r => r.isError),
    error: erroredResult?.error ?? null,
    refetch: () => Promise.all(results.map(r => r.refetch())),
  };
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: taskKeys.list(projectId) }),
  });
}

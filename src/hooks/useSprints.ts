import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sprintsApi } from '../api/sprints';
import type { CreateSprintRequest, UpdateSprintRequest } from '../api/types';

export const sprintKeys = {
  all: ['sprints'] as const,
  list: (projectId: string) => [...sprintKeys.all, projectId] as const,
};

export function useSprints(projectId: string) {
  return useQuery({
    queryKey: sprintKeys.list(projectId),
    queryFn: () => sprintsApi.list(projectId),
    enabled: !!projectId,
  });
}

export function useCreateSprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSprintRequest) => sprintsApi.create(body),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: sprintKeys.list(vars.projectId) }),
  });
}

export function useUpdateSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateSprintRequest }) =>
      sprintsApi.update(id, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: sprintKeys.list(projectId) }),
  });
}

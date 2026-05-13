import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subtasksApi } from '../api/subtasks';
import type { CreateSubtaskRequest, SubtaskDto, UpdateSubtaskRequest } from '../api/types';

export const subtaskKeys = {
  all: ['subtasks'] as const,
  list: (taskId: string) => [...subtaskKeys.all, taskId] as const,
};

export function useSubtasks(taskId: string) {
  return useQuery({
    queryKey: subtaskKeys.list(taskId),
    queryFn: () => subtasksApi.list(taskId),
    enabled: !!taskId,
  });
}

export function useCreateSubtask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSubtaskRequest) => subtasksApi.create(taskId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subtaskKeys.list(taskId) });
    },
  });
}

export function useUpdateSubtask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateSubtaskRequest }) =>
      subtasksApi.update(id, body),
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: subtaskKeys.list(taskId) });
      const previous = qc.getQueryData<SubtaskDto[]>(subtaskKeys.list(taskId));
      qc.setQueryData<SubtaskDto[]>(subtaskKeys.list(taskId), prev =>
        (prev ?? []).map(s =>
          s.id === id
            ? { ...s, title: body.title ?? s.title, done: body.done ?? s.done }
            : s,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(subtaskKeys.list(taskId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: subtaskKeys.list(taskId) });
    },
  });
}

export function useDeleteSubtask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subtasksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subtaskKeys.list(taskId) });
    },
  });
}

export function useReorderSubtasks(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => subtasksApi.reorder(taskId, ids),
    onMutate: async (ids: string[]) => {
      await qc.cancelQueries({ queryKey: subtaskKeys.list(taskId) });
      const previous = qc.getQueryData<SubtaskDto[]>(subtaskKeys.list(taskId));
      qc.setQueryData<SubtaskDto[]>(subtaskKeys.list(taskId), prev => {
        if (!prev) return prev;
        const map = new Map(prev.map(s => [s.id, s]));
        return ids.flatMap((id, idx) => {
          const s = map.get(id);
          return s ? [{ ...s, sortOrder: idx }] : [];
        });
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(subtaskKeys.list(taskId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: subtaskKeys.list(taskId) });
    },
  });
}

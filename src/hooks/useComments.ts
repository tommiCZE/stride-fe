import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '../api/comments';
import type { CreateCommentRequest, UpdateCommentRequest } from '../api/types';
import { taskKeys } from './useTasks';

export const commentKeys = {
  all: ['comments'] as const,
  list: (taskId: string) => [...commentKeys.all, taskId] as const,
};

export function useComments(taskId: string) {
  return useQuery({
    queryKey: commentKeys.list(taskId),
    queryFn: () => commentsApi.list(taskId),
    enabled: !!taskId,
  });
}

export function useCreateComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCommentRequest) => commentsApi.create(taskId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.list(taskId) });
      qc.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
    },
  });
}

export function useUpdateComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCommentRequest }) =>
      commentsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentKeys.list(taskId) }),
  });
}

export function useDeleteComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.list(taskId) });
      qc.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
    },
  });
}

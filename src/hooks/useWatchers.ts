import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchersApi } from '../api/watchers';
import { useAuthStore } from '../store/auth-store';
import type { UserDto } from '../api/types';

export const watcherKeys = {
  all: ['watchers'] as const,
  list: (taskId: string) => ['watchers', taskId] as const,
};

export function useWatchers(taskId: string | null | undefined) {
  return useQuery({
    queryKey: watcherKeys.list(taskId ?? ''),
    queryFn: () => watchersApi.list(taskId as string),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useIsWatching(taskId: string | null | undefined): boolean {
  const userId = useAuthStore(s => s.userId);
  const { data } = useWatchers(taskId);
  if (!data || !userId) return false;
  return data.some(w => w.id === userId);
}

export function useToggleWatch(taskId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);

  return useMutation({
    mutationFn: async (currentlyWatching: boolean) => {
      if (currentlyWatching) {
        await watchersApi.unwatch(taskId);
      } else {
        await watchersApi.watch(taskId);
      }
      return !currentlyWatching;
    },
    onMutate: async (currentlyWatching: boolean) => {
      await queryClient.cancelQueries({ queryKey: watcherKeys.list(taskId) });
      const previous = queryClient.getQueryData<UserDto[]>(watcherKeys.list(taskId));

      queryClient.setQueryData<UserDto[]>(watcherKeys.list(taskId), prev => {
        const list = prev ?? [];
        if (currentlyWatching) {
          return list.filter(u => u.id !== userId);
        }
        if (!userId || !user) return list;
        if (list.some(u => u.id === userId)) return list;
        return [...list, user as UserDto];
      });

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(watcherKeys.list(taskId), ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: watcherKeys.list(taskId) });
    },
  });
}

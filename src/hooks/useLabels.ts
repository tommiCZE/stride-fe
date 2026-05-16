import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useMutationWithToast } from './use-mutation-with-toast';
import { labelsApi } from '../api/labels';
import type { LabelDto } from '../api/types';

export function useProjectLabels(projectId: string) {
  const qc = useQueryClient();
  const queryKey: QueryKey = ['project-labels', projectId];

  const query = useQuery({
    queryKey,
    queryFn: () => labelsApi.list(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 30,
  });

  const mutation = useMutationWithToast<LabelDto[], unknown, LabelDto[], { prev: LabelDto[] | undefined }>({
    mutationKey: queryKey,
    mutationFn: (next) => labelsApi.replace(projectId, next),
    errorMessage: 'Chyba při ukládání labelů',
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData<LabelDto[]>(queryKey);
      qc.setQueryData(queryKey, next);
      return { prev };
    },
    onError: (_e, _next, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    replace: (next: LabelDto[]) => mutation.mutate(next),
  };
}

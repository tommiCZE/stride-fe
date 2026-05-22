import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  workspaceSettingsApi,
  type UpdateWorkspaceSettingsRequest,
} from '../api/workspace-settings';
import { useMutationWithToast } from './use-mutation-with-toast';

const QK = ['workspace', 'settings'] as const;

export function useWorkspaceSettings() {
  return useQuery({ queryKey: QK, queryFn: workspaceSettingsApi.get });
}

export function useUpdateWorkspaceSettings() {
  const qc = useQueryClient();
  return useMutationWithToast({
    mutationFn: (body: UpdateWorkspaceSettingsRequest) => workspaceSettingsApi.update(body),
    successMessage: 'Nastavení uloženo',
    errorMessage: 'Chyba při ukládání nastavení.',
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
    },
  });
}

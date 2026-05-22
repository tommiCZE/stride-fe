import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  workspaceIntegrationsApi,
  type WorkspaceIntegrationProvider,
} from '../api/workspace-integrations';
import { useMutationWithToast } from './use-mutation-with-toast';

const QK = ['workspace', 'integrations'] as const;

export function useWorkspaceIntegrations() {
  return useQuery({ queryKey: QK, queryFn: workspaceIntegrationsApi.list });
}

export function useConnectWorkspaceIntegration() {
  const qc = useQueryClient();
  return useMutationWithToast({
    mutationFn: (provider: WorkspaceIntegrationProvider) =>
      workspaceIntegrationsApi.connect(provider),
    successMessage: 'Integrace připojena',
    errorMessage: 'Chyba při připojování integrace.',
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useDisconnectWorkspaceIntegration() {
  const qc = useQueryClient();
  return useMutationWithToast({
    mutationFn: (provider: WorkspaceIntegrationProvider) =>
      workspaceIntegrationsApi.disconnect(provider),
    successMessage: 'Integrace odpojena',
    errorMessage: 'Chyba při odpojování integrace.',
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
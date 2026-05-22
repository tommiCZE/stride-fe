import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  workspaceSecurityApi,
  type UpdateSecurityPolicyRequest,
} from '../api/workspace-security';
import { useMutationWithToast } from './use-mutation-with-toast';

const QK = ['workspace', 'security'] as const;

export function useWorkspaceSecurity() {
  return useQuery({ queryKey: QK, queryFn: workspaceSecurityApi.get });
}

export function useUpdateWorkspaceSecurity() {
  const qc = useQueryClient();
  return useMutationWithToast({
    mutationFn: (body: UpdateSecurityPolicyRequest) => workspaceSecurityApi.update(body),
    successMessage: 'Politika zabezpečení uložena',
    errorMessage: 'Chyba při ukládání politiky zabezpečení.',
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

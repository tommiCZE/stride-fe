import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { workspaceAuditApi, type AuditSearchParams } from '../api/workspace-audit';
import { useMutationWithToast } from './use-mutation-with-toast';

export const workspaceAuditQueryKey = (params: AuditSearchParams) =>
  ['workspace', 'audit', params] as const;

export function useWorkspaceAudit(params: AuditSearchParams) {
  return useQuery({
    queryKey: workspaceAuditQueryKey(params),
    queryFn: () => workspaceAuditApi.search(params),
    placeholderData: keepPreviousData,
  });
}

export function useExportWorkspaceAudit() {
  return useMutationWithToast({
    mutationFn: async (params: AuditSearchParams) => {
      const blob = await workspaceAuditApi.exportCsv(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `workspace-audit-${date}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    errorMessage: 'Chyba při exportu CSV.',
  });
}

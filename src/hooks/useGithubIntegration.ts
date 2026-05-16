import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { githubIntegrationApi } from '../api/github-integration';

const keys = {
  integration: (projectKey: string) => ['github-integration', projectKey] as const,
  repos: (projectKey: string) => ['github-repos', projectKey] as const,
};

export function useGithubIntegration(projectKey: string) {
  const qc = useQueryClient();

  const integrationQuery = useQuery({
    queryKey: keys.integration(projectKey),
    queryFn: () => githubIntegrationApi.get(projectKey),
    enabled: !!projectKey,
    staleTime: 1000 * 30,
  });

  const isConnected = !!integrationQuery.data;

  const reposQuery = useQuery({
    queryKey: keys.repos(projectKey),
    queryFn: () => githubIntegrationApi.listRepos(projectKey),
    enabled: isConnected,
    staleTime: 1000 * 60,
  });

  const disconnect = useMutation({
    mutationFn: () => githubIntegrationApi.disconnect(projectKey),
    onSuccess: () => {
      qc.setQueryData(keys.integration(projectKey), null);
      qc.removeQueries({ queryKey: keys.repos(projectKey) });
    },
  });

  const setRepo = useMutation({
    mutationFn: (r: { id: number; fullName: string }) =>
      githubIntegrationApi.updateRepo(projectKey, r.id, r.fullName),
    onSuccess: (next) => qc.setQueryData(keys.integration(projectKey), next),
  });

  return {
    integration: integrationQuery.data ?? null,
    isConnected,
    isLoading: integrationQuery.isLoading,
    repos: reposQuery.data ?? [],
    reposLoading: reposQuery.isLoading,
    disconnect: () => disconnect.mutate(),
    setRepo: (r: { id: number; fullName: string }) => setRepo.mutate(r),
    disconnecting: disconnect.isPending,
    settingRepo: setRepo.isPending,
  };
}

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { gitlabIntegrationApi } from '../api/gitlab-integration';

const keys = {
  integration: (projectKey: string) => ['gitlab-integration', projectKey] as const,
  projects: (projectKey: string) => ['gitlab-projects', projectKey] as const,
};

export function useGitlabIntegration(projectKey: string) {
  const qc = useQueryClient();

  const integrationQuery = useQuery({
    queryKey: keys.integration(projectKey),
    queryFn: () => gitlabIntegrationApi.get(projectKey),
    enabled: !!projectKey,
    staleTime: 1000 * 30,
  });

  const isConnected = !!integrationQuery.data;

  const projectsQuery = useQuery({
    queryKey: keys.projects(projectKey),
    queryFn: () => gitlabIntegrationApi.listProjects(projectKey),
    enabled: isConnected,
    staleTime: 1000 * 60,
  });

  const disconnect = useMutation({
    mutationFn: () => gitlabIntegrationApi.disconnect(projectKey),
    onSuccess: () => {
      qc.setQueryData(keys.integration(projectKey), null);
      qc.removeQueries({ queryKey: keys.projects(projectKey) });
    },
  });

  const setProject = useMutation({
    mutationFn: (p: { id: number; path: string }) =>
      gitlabIntegrationApi.updateProject(projectKey, p.id, p.path),
    onSuccess: (next) => qc.setQueryData(keys.integration(projectKey), next),
  });

  return {
    integration: integrationQuery.data ?? null,
    isConnected,
    isLoading: integrationQuery.isLoading,
    projects: projectsQuery.data ?? [],
    projectsLoading: projectsQuery.isLoading,
    disconnect: () => disconnect.mutate(),
    setProject: (p: { id: number; path: string }) => setProject.mutate(p),
    disconnecting: disconnect.isPending,
    settingProject: setProject.isPending,
  };
}

import api from './axios';

export type WorkspaceIntegrationProvider = 'slack' | 'github' | 'gitlab' | 'google';

export interface WorkspaceIntegrationDto {
  id: string;
  provider: WorkspaceIntegrationProvider;
  connected: boolean;
  connectedAt: string | null;
  webhookUrl: string | null;
}

export const workspaceIntegrationsApi = {
  list: () =>
    api.get<WorkspaceIntegrationDto[]>('/api/workspace/integrations').then(r => r.data),
  connect: (provider: WorkspaceIntegrationProvider) =>
    api.post<WorkspaceIntegrationDto>(`/api/workspace/integrations/${provider}/connect`)
      .then(r => r.data),
  disconnect: (provider: WorkspaceIntegrationProvider) =>
    api.delete<void>(`/api/workspace/integrations/${provider}`),
};

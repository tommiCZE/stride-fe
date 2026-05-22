import api from './axios';

export interface WorkspaceSettingsDto {
  name: string;
  slug: string;
  timezone: string;
  language: string;
}

export interface UpdateWorkspaceSettingsRequest {
  name?: string;
  slug?: string;
  timezone?: string;
  language?: string;
}

export const workspaceSettingsApi = {
  get: () => api.get<WorkspaceSettingsDto>('/api/workspace/settings').then(r => r.data),
  update: (body: UpdateWorkspaceSettingsRequest) =>
    api.patch<void>('/api/workspace/settings', body),
};

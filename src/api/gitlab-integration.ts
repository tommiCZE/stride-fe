import api from './axios';
import type { GitlabIntegrationDto, GitlabProject } from './types';

export const gitlabIntegrationApi = {
  startInstall: (projectKey: string) =>
    api.get<{ url: string }>('/api/integrations/gitlab/install', {
      params: { projectKey },
    }).then(r => r.data),

  get: (projectKey: string) =>
    api.get<GitlabIntegrationDto>(`/api/projects/${projectKey}/integrations/gitlab`)
      .then(r => r.data)
      .catch((err) => {
        if (err?.response?.status === 404) return null;
        throw err;
      }),

  disconnect: (projectKey: string) =>
    api.delete<void>(`/api/projects/${projectKey}/integrations/gitlab`).then(r => r.data),

  listProjects: (projectKey: string) =>
    api.get<GitlabProject[]>(`/api/projects/${projectKey}/integrations/gitlab/projects`)
      .then(r => r.data),

  updateProject: (projectKey: string, projectId: number, projectPath: string) =>
    api.patch<GitlabIntegrationDto>(`/api/projects/${projectKey}/integrations/gitlab`, {
      projectId,
      projectPath,
    }).then(r => r.data),
};

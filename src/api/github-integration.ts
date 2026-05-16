import api from './axios';
import type { GithubIntegrationDto, GithubRepo } from './types';

export const githubIntegrationApi = {
  startInstall: (projectKey: string) =>
    api.get<{ url: string }>('/api/integrations/github/install', {
      params: { projectKey },
    }).then(r => r.data),

  get: (projectKey: string) =>
    api.get<GithubIntegrationDto>(`/api/projects/${projectKey}/integrations/github`)
      .then(r => r.data)
      .catch((err) => {
        if (err?.response?.status === 404) return null;
        throw err;
      }),

  disconnect: (projectKey: string) =>
    api.delete<void>(`/api/projects/${projectKey}/integrations/github`).then(r => r.data),

  listRepos: (projectKey: string) =>
    api.get<GithubRepo[]>(`/api/projects/${projectKey}/integrations/github/repos`)
      .then(r => r.data),

  updateRepo: (projectKey: string, repoId: number, repoFullName: string) =>
    api.patch<GithubIntegrationDto>(`/api/projects/${projectKey}/integrations/github`, {
      repoId,
      repoFullName,
    }).then(r => r.data),
};

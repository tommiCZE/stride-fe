import api from './axios';
import type { SlackChannel, SlackIntegrationDto } from './types';

export const slackIntegrationApi = {
  startInstall: (projectKey: string) =>
    api.get<{ url: string }>('/api/integrations/slack/install', {
      params: { projectKey },
    }).then(r => r.data),

  get: (projectKey: string) =>
    api.get<SlackIntegrationDto>(`/api/projects/${projectKey}/integrations/slack`)
      .then(r => r.data)
      .catch((err) => {
        if (err?.response?.status === 404) return null;
        throw err;
      }),

  disconnect: (projectKey: string) =>
    api.delete<void>(`/api/projects/${projectKey}/integrations/slack`).then(r => r.data),

  listChannels: (projectKey: string) =>
    api.get<SlackChannel[]>(`/api/projects/${projectKey}/integrations/slack/channels`)
      .then(r => r.data),

  updateChannel: (projectKey: string, channelId: string, channelName: string) =>
    api.patch<SlackIntegrationDto>(`/api/projects/${projectKey}/integrations/slack`, {
      channelId,
      channelName,
    }).then(r => r.data),
};

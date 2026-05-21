import api from './axios';
import type { RemoteLinkProvider, RemoteLinkState, TaskRemoteLinkDto } from './types';

export interface CreateRemoteLinkRequest {
  url?: string;
  provider?: RemoteLinkProvider;
  remoteNumber?: number;
}

export interface RemoteSearchResultDto {
  provider: RemoteLinkProvider;
  repoRef: string;
  remoteNumber: number;
  title: string;
  state: RemoteLinkState;
  remoteUrl: string;
  updatedAt: string;
  author: string | null;
}

export const taskRemoteLinksApi = {
  list: (taskId: string) =>
    api.get<TaskRemoteLinkDto[]>(`/api/tasks/${taskId}/remote-links`).then(r => r.data),

  create: (taskId: string, body: CreateRemoteLinkRequest) =>
    api.post<TaskRemoteLinkDto>(`/api/tasks/${taskId}/remote-links`, body).then(r => r.data),

  remove: (taskId: string, linkId: string) =>
    api.delete<void>(`/api/tasks/${taskId}/remote-links/${linkId}`).then(r => r.data),

  search: (taskId: string, provider: RemoteLinkProvider, q: string) =>
    api.get<RemoteSearchResultDto[]>(
      `/api/tasks/${taskId}/remote-links/search`,
      { params: { provider, q } },
    ).then(r => r.data),
};

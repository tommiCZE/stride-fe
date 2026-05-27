import api from './axios';
import type {
  ReleaseDto, CreateReleaseRequest, UpdateReleaseRequest, TaskSummaryDto,
  ReleaseActivityItemDto,
} from './types';

export const releasesApi = {
  listByProject: (projectId: string) =>
    api.get<ReleaseDto[]>(`/api/projects/${projectId}/releases`).then(r => r.data),

  get: (id: string) =>
    api.get<ReleaseDto>(`/api/releases/${id}`).then(r => r.data),

  create: (body: CreateReleaseRequest) =>
    api.post<ReleaseDto>('/api/releases', body).then(r => r.data),

  update: (id: string, body: UpdateReleaseRequest) =>
    api.patch<ReleaseDto>(`/api/releases/${id}`, body).then(r => r.data),

  remove: (id: string) =>
    api.delete<void>(`/api/releases/${id}`).then(r => r.data),

  tasks: (id: string) =>
    api.get<TaskSummaryDto[]>(`/api/releases/${id}/tasks`).then(r => r.data),

  activity: (id: string) =>
    api.get<ReleaseActivityItemDto[]>(`/api/releases/${id}/activity`).then(r => r.data),
};

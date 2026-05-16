import api from './axios';
import type { ProjectDto, CreateProjectRequest, UpdateProjectRequest } from './types';

export const projectsApi = {
  list: () =>
    api.get<ProjectDto[]>('/api/projects').then(r => r.data),

  getByKey: (key: string) =>
    api.get<ProjectDto>(`/api/projects/by-key/${key}`).then(r => r.data),

  create: (body: CreateProjectRequest) =>
    api.post<ProjectDto>('/api/projects', body).then(r => r.data),

  update: (id: string, body: UpdateProjectRequest) =>
    api.patch<void>(`/api/projects/${id}`, body).then(r => r.data),

  remove: (id: string) =>
    api.delete<void>(`/api/projects/${id}`).then(r => r.data),
};

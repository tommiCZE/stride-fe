import api from './axios';
import type {
  CreateWorklogRequest,
  UpdateWorklogRequest,
  WorklogDto,
} from './types';

export const worklogsApi = {
  list: (taskId: string) =>
    api.get<WorklogDto[]>(`/api/tasks/${taskId}/worklogs`).then(r => r.data),

  create: (taskId: string, body: CreateWorklogRequest) =>
    api.post<WorklogDto>(`/api/tasks/${taskId}/worklogs`, body).then(r => r.data),

  listForUser: (userId: string, from: string, to: string) =>
    api
      .get<WorklogDto[]>(`/api/users/${userId}/worklogs`, { params: { from, to } })
      .then(r => r.data),

  createForUser: (userId: string, body: CreateWorklogRequest) =>
    api.post<WorklogDto>(`/api/users/${userId}/worklogs`, body).then(r => r.data),

  updateForUser: (userId: string, id: string, patch: UpdateWorklogRequest) =>
    api.patch<WorklogDto>(`/api/users/${userId}/worklogs/${id}`, patch).then(r => r.data),

  deleteForUser: (userId: string, id: string) =>
    api.delete<void>(`/api/users/${userId}/worklogs/${id}`).then(r => r.data),
};

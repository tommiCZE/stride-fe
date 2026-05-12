import api from './axios';
import type { WorklogDto, CreateWorklogRequest } from './types';

export const worklogsApi = {
  list: (taskId: string) =>
    api.get<WorklogDto[]>(`/api/tasks/${taskId}/worklogs`).then(r => r.data),

  create: (taskId: string, body: CreateWorklogRequest) =>
    api.post<void>(`/api/tasks/${taskId}/worklogs`, body).then(r => r.data),
};

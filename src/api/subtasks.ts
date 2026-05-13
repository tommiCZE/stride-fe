import api from './axios';
import type { CreateSubtaskRequest, SubtaskDto, UpdateSubtaskRequest } from './types';

export const subtasksApi = {
  list: (taskId: string) =>
    api.get<SubtaskDto[]>(`/api/tasks/${taskId}/subtasks`).then(r => r.data),

  create: (taskId: string, body: CreateSubtaskRequest) =>
    api.post<void>(`/api/tasks/${taskId}/subtasks`, body).then(r => r.data),

  update: (id: string, body: UpdateSubtaskRequest) =>
    api.patch<void>(`/api/subtasks/${id}`, body).then(r => r.data),

  delete: (id: string) =>
    api.delete<void>(`/api/subtasks/${id}`).then(r => r.data),

  reorder: (taskId: string, ids: string[]) =>
    api.put<void>(`/api/tasks/${taskId}/subtasks/reorder`, { ids }).then(r => r.data),
};

import api from './axios';
import type { TaskDto, TaskSummaryDto, CreateTaskRequest, UpdateTaskRequest, TaskFilters } from './types';

export const tasksApi = {
  list: (projectId: string, filters?: TaskFilters) =>
    api.get<{ content: TaskSummaryDto[] }>(`/api/projects/${projectId}/tasks`, { params: filters })
      .then(r => r.data.content ?? r.data as unknown as TaskSummaryDto[]),

  get: (id: string) =>
    api.get<TaskDto>(`/api/tasks/${id}`).then(r => r.data),

  create: (body: CreateTaskRequest) =>
    api.post<TaskDto>('/api/tasks', body).then(r => r.data),

  update: (id: string, body: UpdateTaskRequest) =>
    api.patch<void>(`/api/tasks/${id}`, body).then(r => r.data),

  delete: (id: string) =>
    api.delete<void>(`/api/tasks/${id}`).then(r => r.data),
};

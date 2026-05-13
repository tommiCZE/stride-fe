import api from './axios';
import type { UserDto } from './types';

export const watchersApi = {
  list: (taskId: string) =>
    api.get<UserDto[]>(`/api/tasks/${taskId}/watchers`).then(r => r.data),

  watch: (taskId: string) =>
    api.post<void>(`/api/tasks/${taskId}/watchers`).then(r => r.data),

  unwatch: (taskId: string) =>
    api.delete<void>(`/api/tasks/${taskId}/watchers/me`).then(r => r.data),
};

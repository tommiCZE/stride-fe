import api from './axios';
import type { ActivityItemDto } from './types';
import type { ActivityDto } from '../types';

export const activityApi = {
  list: (taskId: string) =>
    api.get<ActivityItemDto[]>(`/api/tasks/${taskId}/activity`).then(r => r.data),

  global: (limit = 20) =>
    api.get<ActivityDto[]>('/api/activity', { params: { limit } }).then(r => r.data),
};

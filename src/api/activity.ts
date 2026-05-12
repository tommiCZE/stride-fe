import api from './axios';
import type { ActivityItemDto } from './types';

export const activityApi = {
  list: (taskId: string) =>
    api.get<ActivityItemDto[]>(`/api/tasks/${taskId}/activity`).then(r => r.data),
};

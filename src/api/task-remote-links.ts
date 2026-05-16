import api from './axios';
import type { TaskRemoteLinkDto } from './types';

export const taskRemoteLinksApi = {
  list: (taskId: string) =>
    api.get<TaskRemoteLinkDto[]>(`/api/tasks/${taskId}/remote-links`).then(r => r.data),
};

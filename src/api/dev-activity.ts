import api from './axios';
import type { TaskDevActivity } from '../types/dev-activity';

export const devActivityApi = {
  get: (taskId: string) =>
    api.get<TaskDevActivity>(`/api/tasks/${taskId}/dev-activity`).then(r => r.data),
};

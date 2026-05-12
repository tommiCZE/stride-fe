import api from './axios';
import type { EpicDto } from './types';

export const epicsApi = {
  list: (projectId: string) =>
    api.get<EpicDto[]>(`/api/projects/${projectId}/epics`).then(r => r.data),
};

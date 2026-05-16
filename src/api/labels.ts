import api from './axios';
import type { LabelDto } from './types';

export const labelsApi = {
  list: (projectId: string) =>
    api.get<LabelDto[]>(`/api/projects/${projectId}/labels`).then(r => r.data),

  replace: (projectId: string, body: LabelDto[]) =>
    api.put<LabelDto[]>(`/api/projects/${projectId}/labels`, body).then(r => r.data),
};

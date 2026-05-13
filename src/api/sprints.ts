import api from './axios';
import type { SprintDto, CreateSprintRequest, UpdateSprintRequest } from './types';

export const sprintsApi = {
  list: (projectId: string) =>
    api.get<SprintDto[]>(`/api/projects/${projectId}/sprints`).then(r => r.data),

  create: (body: CreateSprintRequest) =>
    api.post<SprintDto>('/api/sprints', body).then(r => r.data),

  update: (id: string, body: UpdateSprintRequest) =>
    api.patch<void>(`/api/sprints/${id}`, body).then(r => r.data),
};

export interface SprintBurndownPoint {
  date: string;          // ISO date 'YYYY-MM-DD'
  remainingPoints: number;
  idealRemaining: number;
}

export async function getSprintBurndown(sprintId: string): Promise<SprintBurndownPoint[]> {
  const { data } = await api.get<SprintBurndownPoint[]>(`/api/sprints/${sprintId}/burndown`);
  return data;
}

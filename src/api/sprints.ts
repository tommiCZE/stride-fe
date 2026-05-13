import api from './axios';
import type { SprintDto, CreateSprintRequest, UpdateSprintRequest } from './types';

export interface SprintVelocityPoint {
  sprintId: string;
  sprintName: string;
  planned: number;
  completed: number;
  completedAt: string | null;
}

export const sprintsApi = {
  list: (projectId: string) =>
    api.get<SprintDto[]>(`/api/projects/${projectId}/sprints`).then(r => r.data),

  create: (body: CreateSprintRequest) =>
    api.post<SprintDto>('/api/sprints', body).then(r => r.data),

  update: (id: string, body: UpdateSprintRequest) =>
    api.patch<void>(`/api/sprints/${id}`, body).then(r => r.data),

  velocity: (projectId: string, lastN = 6) =>
    api
      .get<SprintVelocityPoint[]>(`/api/projects/${projectId}/sprints/velocity`, {
        params: { last: lastN },
      })
      .then(r => r.data),
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

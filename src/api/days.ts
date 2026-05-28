import api from './axios';
import type { DayDto, UpsertDayRequest } from './types';

export const daysApi = {
  list: (userId: string, from: string, to: string) =>
    api.get<DayDto[]>(`/api/users/${userId}/days`, { params: { from, to } }).then(r => r.data),

  upsert: (userId: string, date: string, body: UpsertDayRequest) =>
    api.put<DayDto>(`/api/users/${userId}/days/${date}`, body).then(r => r.data),
};

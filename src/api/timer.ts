import api from './axios';
import type { RunningTimerDto, StartTimerRequest, StopTimerResponse } from './types';

export const timerApi = {
  get: () =>
    api.get<RunningTimerDto | null>('/api/timer', { validateStatus: s => s === 200 || s === 204 })
      .then(r => (r.status === 204 ? null : r.data)),

  start: (body: StartTimerRequest) =>
    api.post<RunningTimerDto>('/api/timer/start', body).then(r => r.data),

  stop: () =>
    api.post<StopTimerResponse>('/api/timer/stop').then(r => r.data),
};

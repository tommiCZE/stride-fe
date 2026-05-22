import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { timerApi } from '../api/timer';
import type { RunningTimerDto, StopTimerResponse } from '../api/types';
import { useAuthStore } from '../store/auth-store';

export const timerKeys = {
  current: ['timer', 'current'] as const,
};

export function useRunningTimer() {
  const token = useAuthStore(s => s.token);
  return useQuery<RunningTimerDto | null>({
    queryKey: timerKeys.current,
    queryFn: () => timerApi.get(),
    enabled: !!token,
    staleTime: Infinity,
  });
}

export function useStartTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => timerApi.start({ taskId }),
    onSuccess: (data) => {
      qc.setQueryData<RunningTimerDto | null>(timerKeys.current, data);
    },
  });
}

export function useStopTimer() {
  const qc = useQueryClient();
  return useMutation<StopTimerResponse, Error, void>({
    mutationFn: () => timerApi.stop(),
    onSuccess: () => {
      qc.setQueryData<RunningTimerDto | null>(timerKeys.current, null);
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { epicsApi } from '../api/epics';

export const epicKeys = {
  all: ['epics'] as const,
  list: (projectId: string) => [...epicKeys.all, projectId] as const,
};

export function useEpics(projectId: string) {
  return useQuery({
    queryKey: epicKeys.list(projectId),
    queryFn: () => epicsApi.list(projectId),
    enabled: !!projectId,
  });
}

import { useQuery } from '@tanstack/react-query';
import { sprintsApi, type SprintVelocityPoint } from '../api/sprints';

export function useSprintVelocity(projectId: string | undefined, lastN = 6) {
  return useQuery<SprintVelocityPoint[]>({
    queryKey: ['sprint-velocity', projectId, lastN],
    enabled: !!projectId,
    queryFn: () => sprintsApi.velocity(projectId!, lastN),
  });
}

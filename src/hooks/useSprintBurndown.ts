import { useQuery } from '@tanstack/react-query';
import { getSprintBurndown, type SprintBurndownPoint } from '../api/sprints';

export function useSprintBurndown(sprintId: string | undefined) {
  return useQuery<SprintBurndownPoint[]>({
    queryKey: ['sprint-burndown', sprintId],
    enabled: !!sprintId,
    queryFn: () => getSprintBurndown(sprintId!),
  });
}

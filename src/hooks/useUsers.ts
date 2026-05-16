import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';

export const userKeys = {
  all: ['users'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  byUsername: (username: string) => [...userKeys.details(), 'by-username', username] as const,
};

export function useUserByUsername(username: string | undefined) {
  return useQuery({
    queryKey: userKeys.byUsername(username ?? ''),
    queryFn: () => usersApi.getByUsername(username as string),
    enabled: !!username,
  });
}

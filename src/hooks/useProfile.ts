import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import type { UpdateProfileRequest } from '../api/users';
import { useAuthStore } from '../store/auth-store';

export function useMe() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersApi.getMe,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  const login = useAuthStore(s => s.login);
  const token = useAuthStore(s => s.token);
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => usersApi.updateMe(body),
    onSuccess: async () => {
      const fresh = await usersApi.getMe();
      if (token) login(token, fresh);
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
      qc.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

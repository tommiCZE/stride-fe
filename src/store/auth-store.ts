import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '../api/types';

interface AuthStore {
  token: string | null;
  userId: string | null;
  user: UserDto | null;
  login: (token: string, user: UserDto) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      user: null,
      login: (token, user) => set({ token, userId: user.id, user }),
      logout: () => set({ token: null, userId: null, user: null }),
    }),
    { name: 'stride-auth' },
  ),
);

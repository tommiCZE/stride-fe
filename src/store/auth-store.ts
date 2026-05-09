import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  token: string | null;
  userId: string;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      userId: 'u1',
      login: (token) => set({ token }),
      logout: () => set({ token: null }),
    }),
    { name: 'stride-auth' },
  ),
);

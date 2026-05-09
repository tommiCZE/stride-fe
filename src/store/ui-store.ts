import { create } from 'zustand';

interface TimerState {
  taskKey: string | null;
  running: boolean;
  elapsed: number;
}

interface UiStore {
  themeMode: 'light' | 'dark';
  createModalOpen: boolean;
  mobileMenuOpen: boolean;
  timer: TimerState;

  toggleTheme: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  setMobileMenu: (open: boolean) => void;

  startTimer: (taskKey: string) => void;
  stopTimer: () => void;
  toggleTimer: () => void;
  tickTimer: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  themeMode: 'dark',
  createModalOpen: false,
  mobileMenuOpen: false,
  timer: { taskKey: null, running: false, elapsed: 0 },

  toggleTheme: () =>
    set((s) => ({ themeMode: s.themeMode === 'light' ? 'dark' : 'light' })),

  openCreateModal:  () => set({ createModalOpen: true }),
  closeCreateModal: () => set({ createModalOpen: false }),

  setMobileMenu: (open) => set({ mobileMenuOpen: open }),

  startTimer: (taskKey) =>
    set({ timer: { taskKey, running: true, elapsed: 0 } }),

  stopTimer: () =>
    set({ timer: { taskKey: null, running: false, elapsed: 0 } }),

  toggleTimer: () =>
    set((s) => ({
      timer: { ...s.timer, running: !s.timer.running },
    })),

  tickTimer: () =>
    set((s) =>
      s.timer.running
        ? { timer: { ...s.timer, elapsed: s.timer.elapsed + 1 } }
        : s,
    ),
}));

import { create } from 'zustand';

interface UiStore {
  themeMode: 'light' | 'dark';
  createModalOpen: boolean;
  mobileMenuOpen: boolean;

  toggleTheme: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  setMobileMenu: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  themeMode: 'dark',
  createModalOpen: false,
  mobileMenuOpen: false,

  toggleTheme: () =>
    set((s) => ({ themeMode: s.themeMode === 'light' ? 'dark' : 'light' })),

  openCreateModal:  () => set({ createModalOpen: true }),
  closeCreateModal: () => set({ createModalOpen: false }),

  setMobileMenu: (open) => set({ mobileMenuOpen: open }),
}));

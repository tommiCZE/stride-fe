import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedFilterCriteria {
  search?: string;
  assigneeId?: string | null;
  mine?: boolean;
  priority?: string;
  status?: string;
  labels?: string[];
}

export interface SavedFilter {
  id: string;
  name: string;
  projectId: string;
  filters: SavedFilterCriteria;
}

interface SavedFiltersStore {
  filters: SavedFilter[];
  addFilter: (name: string, projectId: string, filters: SavedFilterCriteria) => SavedFilter;
  removeFilter: (id: string) => void;
  renameFilter: (id: string, name: string) => void;
}

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `sf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useSavedFiltersStore = create<SavedFiltersStore>()(
  persist(
    (set) => ({
      filters: [],

      addFilter: (name, projectId, filters) => {
        const newFilter: SavedFilter = {
          id: makeId(),
          name: name.trim(),
          projectId,
          filters,
        };
        set((s) => ({ filters: [...s.filters, newFilter] }));
        return newFilter;
      },

      removeFilter: (id) =>
        set((s) => ({ filters: s.filters.filter((f) => f.id !== id) })),

      renameFilter: (id, name) =>
        set((s) => ({
          filters: s.filters.map((f) =>
            f.id === id ? { ...f, name: name.trim() } : f,
          ),
        })),
    }),
    { name: 'stride-saved-filters' },
  ),
);

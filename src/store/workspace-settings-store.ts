import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SessionMock {
  id: string;
  device: string;
  browser: string;
  ipMasked: string;
  location: string;
  lastActive: string;  // ISO
  isCurrent: boolean;
}

function seedSessions(): SessionMock[] {
  const now = new Date();
  const min = (n: number) => new Date(now.getTime() - n * 60 * 1000).toISOString();
  return [
    { id: 's1', device: 'macOS Sonoma',    browser: 'Chrome 134',  ipMasked: '88.103.xx.xx',  location: 'Praha, CZ',  lastActive: min(0),    isCurrent: true  },
    { id: 's2', device: 'iPhone iOS 18',   browser: 'Safari 18',   ipMasked: '212.158.xx.xx', location: 'Praha, CZ',  lastActive: min(36),   isCurrent: false },
    { id: 's3', device: 'Windows 11',      browser: 'Firefox 138', ipMasked: '93.91.xx.xx',   location: 'Brno, CZ',   lastActive: min(1320), isCurrent: false },
    { id: 's4', device: 'macOS Ventura',   browser: 'Chrome 132',  ipMasked: '178.45.xx.xx',  location: 'Berlin, DE', lastActive: min(4280), isCurrent: false },
  ];
}

interface WorkspaceSettingsStore {
  sessions: SessionMock[];
  removeSession: (id: string) => void;
  removeAllOthers: () => void;
  resetSessions: () => void;
}

export const useWorkspaceSettingsStore = create<WorkspaceSettingsStore>()(
  persist(
    (set) => ({
      sessions: seedSessions(),
      removeSession: (id) => set(s => ({ sessions: s.sessions.filter(x => x.id !== id) })),
      removeAllOthers: () => set(s => ({ sessions: s.sessions.filter(x => x.isCurrent) })),
      resetSessions: () => set({ sessions: seedSessions() }),
    }),
    { name: 'stride-workspace-mock' },
  ),
);

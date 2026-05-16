import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType =
  | 'task:created'
  | 'task:updated'
  | 'comment:added'
  | 'sprint:updated';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: number;
  read: boolean;
  taskKey?: string;
  taskId?: string;
  projectId?: string;
  actorId?: string;
}

interface NotificationsStore {
  items: NotificationItem[];
  addNotification: (input: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const MAX_ITEMS = 100;

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set) => ({
      items: [],

      addNotification: (input) =>
        set((s) => ({
          items: [
            { ...input, id: makeId(), createdAt: Date.now(), read: false },
            ...s.items,
          ].slice(0, MAX_ITEMS),
        })),

      markRead: (id) =>
        set((s) => ({
          items: s.items.map((it) => (it.id === id ? { ...it, read: true } : it)),
        })),

      markAllRead: () =>
        set((s) => ({
          items: s.items.map((it) => (it.read ? it : { ...it, read: true })),
        })),

      clearAll: () => set({ items: [] }),
    }),
    { name: 'stride-notifications' },
  ),
);

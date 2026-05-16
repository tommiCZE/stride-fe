import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '../store/auth-store';
import { useNotificationsStore } from '../store/notifications-store';
import { taskKeys } from './useTasks';
import { commentKeys } from './useComments';
import { sprintKeys } from './useSprints';

/**
 * Backend SSE payload shapes. The server includes `actorId` whenever the event
 * has a known originator so we can skip self-originated refetches.
 */
interface TaskCreatedPayload {
  taskId: string;
  taskKey: string;
  taskTitle?: string;
  projectId: string;
  actorId?: string;
}

interface TaskUpdatedPayload {
  taskId: string;
  taskKey: string;
  projectId: string;
  field?: string;
  toValue?: string;
  actorId?: string;
}

interface CommentAddedPayload {
  taskId: string;
  taskKey: string;
  projectId?: string;
  commentId: string;
  actorId?: string;
}

interface SprintUpdatedPayload {
  sprintId: string;
  projectId: string;
  field?: string;
  actorId?: string;
}

const RECONNECT_DELAY_MS = 5000;

/**
 * Subscribes to the backend SSE stream and reacts to real-time task/comment/sprint
 * events by invalidating the appropriate TanStack Query keys. Self-originated
 * events (where `actorId === currentUserId`) are ignored so the actor's UI
 * isn't double-invalidated — their mutation `onSuccess` already handled it.
 */
export function useRealtimeEvents(): void {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const token = useAuthStore(s => s.token);
  const userId = useAuthStore(s => s.userId);

  // Refs so the EventSource lifecycle isn't restarted on every render — only
  // when token actually changes.
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const parse = <T,>(raw: string): T | null => {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    };

    const isSelf = (actorId?: string): boolean =>
      !!actorId && !!userIdRef.current && actorId === userIdRef.current;

    const connect = () => {
      if (cancelled) return;
      // EventSource can't set Authorization headers — pass the JWT as a query
      // param (the BE accepts both forms for this endpoint).
      source = new EventSource(
        `http://localhost:8080/api/notifications/stream?token=${encodeURIComponent(token)}`,
      );

      source.addEventListener('task:created', (e) => {
        const payload = parse<TaskCreatedPayload>((e as MessageEvent).data);
        if (!payload) return;
        queryClient.invalidateQueries({ queryKey: taskKeys.list(payload.projectId) });
        if (!isSelf(payload.actorId)) {
          enqueueSnackbar(`New task: ${payload.taskKey}`, { variant: 'info' });
          useNotificationsStore.getState().addNotification({
            type: 'task:created',
            message: `New task: ${payload.taskKey}${payload.taskTitle ? ` — ${payload.taskTitle}` : ''}`,
            taskKey: payload.taskKey,
            taskId: payload.taskId,
            projectId: payload.projectId,
            actorId: payload.actorId,
          });
        }
      });

      source.addEventListener('task:updated', (e) => {
        const payload = parse<TaskUpdatedPayload>((e as MessageEvent).data);
        if (!payload) return;
        queryClient.invalidateQueries({ queryKey: taskKeys.list(payload.projectId) });
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(payload.taskId) });
        if (!isSelf(payload.actorId)) {
          enqueueSnackbar(`Colleague updated ${payload.taskKey}`, { variant: 'info' });
          useNotificationsStore.getState().addNotification({
            type: 'task:updated',
            message: `Colleague updated ${payload.taskKey}${payload.field ? ` (${payload.field})` : ''}`,
            taskKey: payload.taskKey,
            taskId: payload.taskId,
            projectId: payload.projectId,
            actorId: payload.actorId,
          });
        }
      });

      source.addEventListener('comment:added', (e) => {
        const payload = parse<CommentAddedPayload>((e as MessageEvent).data);
        if (!payload) return;
        queryClient.invalidateQueries({ queryKey: commentKeys.list(payload.taskId) });
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(payload.taskId) });
        if (!isSelf(payload.actorId)) {
          enqueueSnackbar(`New comment on ${payload.taskKey}`, { variant: 'info' });
          useNotificationsStore.getState().addNotification({
            type: 'comment:added',
            message: `New comment on ${payload.taskKey}`,
            taskKey: payload.taskKey,
            taskId: payload.taskId,
            projectId: payload.projectId,
            actorId: payload.actorId,
          });
        }
      });

      source.addEventListener('sprint:updated', (e) => {
        const payload = parse<SprintUpdatedPayload>((e as MessageEvent).data);
        if (!payload) return;
        queryClient.invalidateQueries({ queryKey: sprintKeys.list(payload.projectId) });
        if (!isSelf(payload.actorId)) {
          useNotificationsStore.getState().addNotification({
            type: 'sprint:updated',
            message: `Sprint updated${payload.field ? ` (${payload.field})` : ''}`,
            projectId: payload.projectId,
            actorId: payload.actorId,
          });
        }
      });

      source.onerror = () => {
        // EventSource auto-reconnects, but if the server closed the connection
        // (e.g. 30-min timeout) we may end up in CLOSED state — force a fresh
        // connection after a short delay.
        if (source && source.readyState === EventSource.CLOSED) {
          source.close();
          source = null;
          if (!cancelled) {
            reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
          }
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (source) source.close();
    };
  }, [token, queryClient, enqueueSnackbar]);
}

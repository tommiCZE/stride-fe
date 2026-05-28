import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { worklogsApi } from '../api/worklogs';
import type {
  CreateWorklogRequest,
  UpdateWorklogRequest,
  WorklogDto,
} from '../api/types';
import { taskKeys } from './useTasks';
import { daysOfWeek } from '../lib/time';

export const worklogKeys = {
  all: ['worklogs'] as const,
  list: (taskId: string) => [...worklogKeys.all, taskId] as const,
  userScope: (userId: string) => [...worklogKeys.all, 'user', userId] as const,
  userWeek: (userId: string, weekIso: string) =>
    [...worklogKeys.all, 'user', userId, weekIso] as const,
  userMonth: (userId: string, monthIso: string) =>
    [...worklogKeys.all, 'user', userId, 'month', monthIso] as const,
};

function rangeForWeek(weekIso: string): { from: string; to: string } {
  const days = daysOfWeek(weekIso);
  return { from: days[0], to: days[6] };
}

export function useWorklogs(taskId: string) {
  return useQuery({
    queryKey: worklogKeys.list(taskId),
    queryFn: () => worklogsApi.list(taskId),
    enabled: !!taskId,
  });
}

export function useCreateWorklog(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorklogRequest) => worklogsApi.create(taskId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: worklogKeys.list(taskId) });
      qc.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
    },
  });
}

export function useUserWorklogsMonth(userId: string | null, monthIso: string) {
  return useQuery({
    queryKey: userId
      ? worklogKeys.userMonth(userId, monthIso)
      : ['worklogs', 'user', 'month', 'disabled'],
    queryFn: () => {
      const start = dayjs(monthIso).startOf('month').format('YYYY-MM-DD');
      const end = dayjs(monthIso).endOf('month').format('YYYY-MM-DD');
      return worklogsApi.listForUser(userId!, start, end);
    },
    enabled: !!userId && !!monthIso,
  });
}

export function useUserWorklogs(userId: string | null, weekIso: string) {
  return useQuery({
    queryKey: userId ? worklogKeys.userWeek(userId, weekIso) : ['worklogs', 'user', 'disabled'],
    queryFn: () => {
      const { from, to } = rangeForWeek(weekIso);
      return worklogsApi.listForUser(userId!, from, to);
    },
    enabled: !!userId && !!weekIso,
  });
}

export function useCreateUserWorklog(userId: string, weekIso: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorklogRequest) => worklogsApi.createForUser(userId, body),
    onMutate: async (body) => {
      const key = worklogKeys.userWeek(userId, weekIso);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<WorklogDto[]>(key);
      if (prev && belongsToWeek(body.loggedAt, weekIso)) {
        const optimistic: WorklogDto = {
          id: 'optimistic-' + Math.random().toString(36).slice(2),
          taskId: body.taskId ?? null,
          userId,
          user: null,
          minutes: body.minutes,
          loggedAt: body.loggedAt,
          date: body.loggedAt,
          start: body.start ?? null,
          end: body.end ?? null,
          note: body.note ?? body.comment ?? null,
          comment: body.comment ?? body.note ?? null,
          kind: body.kind ?? (body.taskId ? 'TASK' : 'MEETING'),
          mode: body.mode ?? (body.start && body.end ? 'TIME' : 'DURATION'),
        };
        qc.setQueryData<WorklogDto[]>(key, [...prev, optimistic]);
      }
      return { prev };
    },
    onError: (_err, _body, ctx) => {
      if (ctx?.prev) qc.setQueryData(worklogKeys.userWeek(userId, weekIso), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: worklogKeys.userScope(userId) });
    },
  });
}

export function useUpdateUserWorklog(userId: string, weekIso: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; patch: UpdateWorklogRequest }) =>
      worklogsApi.updateForUser(userId, input.id, input.patch),
    onMutate: async ({ id, patch }) => {
      const key = worklogKeys.userWeek(userId, weekIso);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<WorklogDto[]>(key);
      if (prev) {
        qc.setQueryData<WorklogDto[]>(key, prev.map(w => w.id === id ? { ...w, ...patch } as WorklogDto : w));
      }
      return { prev };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(worklogKeys.userWeek(userId, weekIso), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: worklogKeys.userScope(userId) });
    },
  });
}

export function useDeleteUserWorklog(userId: string, weekIso: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => worklogsApi.deleteForUser(userId, id),
    onMutate: async (id) => {
      const key = worklogKeys.userWeek(userId, weekIso);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<WorklogDto[]>(key);
      if (prev) qc.setQueryData<WorklogDto[]>(key, prev.filter(w => w.id !== id));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(worklogKeys.userWeek(userId, weekIso), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: worklogKeys.userScope(userId) });
    },
  });
}

function belongsToWeek(dateIso: string, weekIso: string): boolean {
  const target = dayjs(dateIso);
  const days = daysOfWeek(weekIso);
  return !target.isBefore(days[0]) && !target.isAfter(days[6]);
}

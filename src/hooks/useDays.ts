import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { daysApi } from '../api/days';
import type { DayDto, UpsertDayRequest } from '../api/types';
import { daysOfWeek } from '../lib/time';

export const dayKeys = {
  all: ['days'] as const,
  userScope: (userId: string) => [...dayKeys.all, userId] as const,
  userWeek: (userId: string, weekIso: string) => [...dayKeys.all, userId, weekIso] as const,
  userMonth: (userId: string, monthIso: string) => [...dayKeys.all, userId, 'month', monthIso] as const,
};

function rangeForWeek(weekIso: string): { from: string; to: string } {
  const days = daysOfWeek(weekIso);
  return { from: days[0], to: days[6] };
}

export function useDaysMonth(userId: string | null, monthIso: string) {
  return useQuery({
    queryKey: userId
      ? dayKeys.userMonth(userId, monthIso)
      : ['days', 'user', 'month', 'disabled'],
    queryFn: () => {
      const start = dayjs(monthIso).startOf('month').format('YYYY-MM-DD');
      const end = dayjs(monthIso).endOf('month').format('YYYY-MM-DD');
      return daysApi.list(userId!, start, end);
    },
    enabled: !!userId && !!monthIso,
  });
}

export function useDays(userId: string | null, weekIso: string) {
  return useQuery({
    queryKey: userId ? dayKeys.userWeek(userId, weekIso) : ['days', 'disabled'],
    queryFn: () => {
      const { from, to } = rangeForWeek(weekIso);
      return daysApi.list(userId!, from, to);
    },
    enabled: !!userId && !!weekIso,
  });
}

export function useUpsertDay(userId: string, weekIso: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { date: string; patch: UpsertDayRequest }) =>
      daysApi.upsert(userId, input.date, input.patch),
    onMutate: async ({ date, patch }) => {
      const key = dayKeys.userWeek(userId, weekIso);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<DayDto[]>(key);
      if (prev) {
        const existing = prev.find(d => d.date === date);
        const next: DayDto = existing
          ? { ...existing, ...applyPatch(existing, patch) }
          : {
              userId,
              date,
              closed: patch.closed ?? false,
              type: patch.clearType ? null : (patch.type ?? null),
              typeNote: patch.typeNote ?? null,
              note: patch.note ?? null,
            };
        const without = prev.filter(d => d.date !== date);
        qc.setQueryData<DayDto[]>(key, [...without, next].sort((a, b) => a.date.localeCompare(b.date)));
      }
      return { prev };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(dayKeys.userWeek(userId, weekIso), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: dayKeys.userScope(userId) });
    },
  });
}

function applyPatch(_day: DayDto, patch: UpsertDayRequest): Partial<DayDto> {
  const out: Partial<DayDto> = {};
  if (patch.closed !== undefined) out.closed = patch.closed;
  if (patch.clearType) {
    out.type = null;
    out.typeNote = null;
  } else if (patch.type !== undefined) {
    out.type = patch.type;
    if (patch.typeNote !== undefined) out.typeNote = patch.typeNote;
  }
  if (patch.note !== undefined) out.note = patch.note;
  return out;
}

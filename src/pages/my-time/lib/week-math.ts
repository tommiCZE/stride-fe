import dayjs from 'dayjs';
import type { DayDto, DayType, WorklogDto } from '../../../api/types';
import { isWeekend } from '../../../lib/time';

export interface DayBreakdown {
  byProject: Map<string, number>;
  totalMin: number;
  count: number;
}

export function aggregateDay(worklogs: WorklogDto[]): DayBreakdown {
  const byProject = new Map<string, number>();
  let totalMin = 0;
  for (const w of worklogs) {
    totalMin += w.minutes;
    const key = w.taskId ?? 'meeting';
    byProject.set(key, (byProject.get(key) ?? 0) + w.minutes);
  }
  return { byProject, totalMin, count: worklogs.length };
}

export function worklogsByDay(worklogs: WorklogDto[]): Map<string, WorklogDto[]> {
  const out = new Map<string, WorklogDto[]>();
  for (const w of worklogs) {
    const date = w.date ?? w.loggedAt;
    const arr = out.get(date) ?? [];
    arr.push(w);
    out.set(date, arr);
  }
  return out;
}

export function daysByIso(days: DayDto[]): Map<string, DayDto> {
  return new Map(days.map(d => [d.date, d]));
}

export type DayStatus =
  | 'closed'
  | 'open'
  | 'today'
  | 'missing'
  | 'future'
  | 'weekend'
  | 'pto'
  | 'sick'
  | 'holiday'
  | 'personal';

export function statusForDay(args: {
  dateIso: string;
  todayIso: string;
  totalMin: number;
  day: DayDto | undefined;
}): DayStatus {
  const { dateIso, todayIso, totalMin, day } = args;
  if (day?.type) {
    switch (day.type) {
      case 'PTO': return 'pto';
      case 'SICK': return 'sick';
      case 'HOLIDAY': return 'holiday';
      case 'PERSONAL': return 'personal';
    }
  }
  if (dateIso === todayIso) return 'today';
  if (dateIso > todayIso) return 'future';
  if (isWeekend(dateIso)) return 'weekend';
  if (day?.closed) return 'closed';
  if (totalMin > 0) return 'open';
  return 'missing';
}

export const DAY_TYPE_COLOR: Record<DayType, string> = {
  PTO: '#0ea5e9',
  SICK: '#8b5cf6',
  HOLIDAY: '#64748b',
  PERSONAL: '#14b8a6',
};

export const DAY_TYPE_LABEL: Record<DayType, string> = {
  PTO: 'Dovolená',
  SICK: 'Nemoc',
  HOLIDAY: 'Svátek',
  PERSONAL: 'Osobní volno',
};

export const DAY_TYPE_ICON: Record<DayType, string> = {
  PTO: '🌴',
  SICK: '🤒',
  HOLIDAY: '🏛',
  PERSONAL: '⛱',
};

export function weekRangeLabel(weekIso: string): string {
  const start = dayjs(weekIso);
  const end = start.add(6, 'day');
  if (start.month() === end.month()) {
    return `${start.format('D.')}–${end.format('D. M. YYYY')}`;
  }
  return `${start.format('D. M.')} – ${end.format('D. M. YYYY')}`;
}

export const WEEKDAY_LABELS = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];
export const WEEKDAY_SHORT = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

export const WEEKLY_GOAL_MIN = 40 * 60;
export const DAILY_GOAL_MIN = 8 * 60;

import dayjs, { type Dayjs } from 'dayjs';

// IMPORTANT: never use d.toISOString().slice(0,10) — that converts to UTC and
// shifts the date for any non-UTC timezone (Prague = UTC+1/+2). Always go
// through dayjs for date-only formatting.

export type DateInput = string | Date | Dayjs;

export function isoLocal(d: DateInput): string {
  return dayjs(d).format('YYYY-MM-DD');
}

export function isoToday(): string {
  return isoLocal(new Date());
}

export function startOfWeek(refIso: DateInput): Dayjs {
  const d = dayjs(refIso);
  const offset = (d.day() + 6) % 7;
  return d.subtract(offset, 'day').startOf('day');
}

export function daysOfWeek(refIso: DateInput): string[] {
  const monday = startOfWeek(refIso);
  return Array.from({ length: 7 }, (_, i) => monday.add(i, 'day').format('YYYY-MM-DD'));
}

export function daysOfMonth(refIso: DateInput): string[] {
  const first = dayjs(refIso).startOf('month');
  const last = dayjs(refIso).endOf('month');
  const out: string[] = [];
  for (let d = first; d.isBefore(last) || d.isSame(last, 'day'); d = d.add(1, 'day')) {
    out.push(d.format('YYYY-MM-DD'));
  }
  return out;
}

export function isWeekend(iso: string): boolean {
  const day = dayjs(iso).day();
  return day === 0 || day === 6;
}

export function fmtHM(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return '0:00';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

export function fmtHours(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return '0h';
  return `${(minutes / 60).toFixed(1)}h`;
}

const HM_RE = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;

export function hmToMin(hm: string | null | undefined): number | null {
  if (!hm) return null;
  const match = HM_RE.exec(hm.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export function normalizeHM(hm: string | null | undefined): string | null {
  const min = hmToMin(hm);
  if (min === null) return null;
  return fmtHM(min);
}

// Tolerant duration parser: "1:30", "90", "1.5h", "1h 30m", "90m".
// Returns minutes, or null if it cannot be parsed.
export function parseDuration(input: string | null | undefined): number | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();
  if (!s) return null;

  // "1:30" or "01:30"
  const hmMatch = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (hmMatch) {
    const h = Number(hmMatch[1]);
    const m = Number(hmMatch[2]);
    if (m > 59) return null;
    return h * 60 + m;
  }

  // "1h 30m" / "1h30m" / "1h" / "30m"
  const composite = /^(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+)\s*m)?$/.exec(s);
  if (composite && (composite[1] || composite[2])) {
    const hPart = composite[1] ? parseFloat(composite[1]) * 60 : 0;
    const mPart = composite[2] ? parseInt(composite[2], 10) : 0;
    return Math.round(hPart + mPart);
  }

  // "1.5h" pure decimal hours
  const decH = /^(\d+(?:\.\d+)?)h$/.exec(s);
  if (decH) return Math.round(parseFloat(decH[1]) * 60);

  // Bare integer = minutes
  const bare = /^(\d+)$/.exec(s);
  if (bare) return parseInt(bare[1], 10);

  return null;
}

export function computeMinutes(start: string | null | undefined, end: string | null | undefined): number | null {
  const s = hmToMin(start);
  const e = hmToMin(end);
  if (s === null || e === null) return null;
  if (e < s) return null;
  return e - s;
}

export function addMinutesToHM(hm: string, minutes: number): string | null {
  const base = hmToMin(hm);
  if (base === null) return null;
  const total = base + minutes;
  if (total < 0 || total >= 24 * 60) return null;
  return fmtHM(total);
}

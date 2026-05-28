import { useTheme } from '@mui/material/styles';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import type { DayDto, WorklogDto } from '../../../api/types';
import {
  DAILY_GOAL_MIN,
  DAY_TYPE_COLOR,
  DAY_TYPE_ICON,
  DAY_TYPE_LABEL,
  WEEKDAY_SHORT,
  aggregateDay,
  daysByIso,
  statusForDay,
  worklogsByDay,
} from '../lib/week-math';
import { fmtHM, isoToday } from '../../../lib/time';

interface Props {
  weekDays: string[];
  worklogs: WorklogDto[];
  days: DayDto[];
  liveExtraMin: number;
  liveDateIso: string | null;
  onDayClick: (iso: string) => void;
}

const HEIGHT = 150;

export default function WeekChart({ weekDays, worklogs, days, liveExtraMin, liveDateIso, onDayClick }: Props) {
  const theme = useTheme();
  const todayIso = isoToday();
  const byDay = worklogsByDay(worklogs);
  const dayMap = daysByIso(days);

  // Determine y-scale: max(8h, max day total) so the cíl line is always visible.
  const totals = weekDays.map(iso => {
    const t = aggregateDay(byDay.get(iso) ?? []).totalMin;
    return iso === liveDateIso ? t + liveExtraMin : t;
  });
  const max = Math.max(DAILY_GOAL_MIN, ...totals, 1);
  const goalY = HEIGHT - (DAILY_GOAL_MIN / max) * HEIGHT;

  const colorForStatus = (status: ReturnType<typeof statusForDay>): string => {
    switch (status) {
      case 'closed':   return theme.palette.success.main;
      case 'open':     return theme.palette.warning.main;
      case 'today':    return theme.palette.primary.main;
      case 'missing':  return theme.palette.error.main;
      case 'pto':      return DAY_TYPE_COLOR.PTO;
      case 'sick':     return DAY_TYPE_COLOR.SICK;
      case 'holiday':  return DAY_TYPE_COLOR.HOLIDAY;
      case 'personal': return DAY_TYPE_COLOR.PERSONAL;
      default:         return theme.palette.action.disabledBackground;
    }
  };

  return (
    <Box sx={{ position: 'relative', mt: 1 }}>
      <Box sx={{
        position: 'absolute', left: 0, right: 0, top: goalY,
        borderTop: `1px dashed ${theme.palette.divider}`,
        pointerEvents: 'none',
      }}/>
      <Typography variant="caption"
        sx={{ position: 'absolute', right: 0, top: goalY - 16, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
        cíl 8h
      </Typography>
      <Stack direction="row" spacing={1} sx={{ height: HEIGHT, alignItems: 'flex-end' }}>
        {weekDays.map((iso, i) => {
          const total = totals[i];
          const status = statusForDay({ dateIso: iso, todayIso, totalMin: total, day: dayMap.get(iso) });
          const day = dayMap.get(iso);
          const fill = colorForStatus(status);
          const heightPct = Math.min(100, (total / max) * 100);
          const isToday = iso === todayIso;
          const titleLines: string[] = [];
          titleLines.push(`${WEEKDAY_SHORT[i]} ${dateLabel(iso)}`);
          if (day?.type) titleLines.push(`${DAY_TYPE_ICON[day.type]} ${DAY_TYPE_LABEL[day.type]}`);
          else titleLines.push(total > 0 ? fmtHM(total) : 'Bez záznamu');
          if (day?.closed) titleLines.push('Uzavřený den');
          return (
            <Tooltip key={iso} title={titleLines.join(' · ')} placement="top" arrow>
              <Stack
                role="button"
                tabIndex={0}
                aria-label={titleLines.join(', ')}
                onClick={() => onDayClick(iso)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onDayClick(iso); }}
                sx={{
                  flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end',
                  cursor: 'pointer', position: 'relative', outline: 'none',
                  '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
                }}>
                <Box sx={{
                  width: '70%',
                  minHeight: total > 0 ? 4 : 0,
                  height: `${heightPct}%`,
                  bgcolor: fill,
                  borderRadius: '4px 4px 0 0',
                  border: isToday ? `1px solid ${theme.palette.primary.dark}` : 'none',
                  position: 'relative',
                  transition: 'height 200ms ease',
                }}>
                  {day?.type && (
                    <Typography variant="caption" sx={{
                      position: 'absolute', top: 4, left: 0, right: 0,
                      textAlign: 'center', lineHeight: 1,
                    }}>
                      {DAY_TYPE_ICON[day.type]}
                    </Typography>
                  )}
                  {isToday && total > 0 && (
                    <Box aria-hidden sx={{
                      position: 'absolute', top: -4, right: -4, width: 8, height: 8,
                      borderRadius: '50%', bgcolor: 'success.main',
                      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                    }}/>
                  )}
                </Box>
              </Stack>
            </Tooltip>
          );
        })}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
        {weekDays.map((iso, i) => (
          <Box key={iso} sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{
              fontWeight: iso === todayIso ? 700 : 500,
              color: iso === todayIso ? 'primary.main' : 'text.secondary',
            }}>
              {WEEKDAY_SHORT[i]}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function dateLabel(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${Number(d)}. ${Number(m)}.`;
}

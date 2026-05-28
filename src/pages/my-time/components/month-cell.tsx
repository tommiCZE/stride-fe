import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { DayDto, WorklogDto } from '../../../api/types';
import { fmtHM, isWeekend } from '../../../lib/time';
import { DAILY_GOAL_MIN, DAY_TYPE_COLOR, DAY_TYPE_ICON, DAY_TYPE_LABEL } from '../lib/week-math';

interface Props {
  dateIso: string;
  inMonth: boolean;
  isToday: boolean;
  worklogs: WorklogDto[];
  day: DayDto | undefined;
  onClick: () => void;
}

export default function MonthCell({ dateIso, inMonth, isToday, worklogs, day, onClick }: Props) {
  const theme = useTheme();
  const totalMin = worklogs.reduce((s, w) => s + w.minutes, 0);
  const weekend = isWeekend(dateIso);
  const past = dateIso < new Date().toISOString().slice(0, 10);
  const missing = inMonth && past && !weekend && totalMin === 0 && !day?.type;

  const d = Number(dateIso.split('-')[2]);

  return (
    <Stack
      role={inMonth ? 'button' : undefined}
      tabIndex={inMonth ? 0 : -1}
      onClick={inMonth ? onClick : undefined}
      onKeyDown={(e) => {
        if (!inMonth) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
      }}
      sx={{
        height: 88, p: 0.75,
        border: 1, borderColor: 'divider',
        bgcolor: inMonth ? 'background.paper' : 'action.disabledBackground',
        cursor: inMonth ? 'pointer' : 'default',
        outline: isToday ? `2px solid ${theme.palette.primary.main}` : 'none',
        outlineOffset: isToday ? -2 : 0,
        position: 'relative',
        '&:hover': inMonth ? { bgcolor: 'action.hover' } : undefined,
        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: -2 },
      }}
    >
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <Typography variant="caption" sx={{
          fontVariantNumeric: 'tabular-nums',
          fontWeight: isToday ? 700 : 500,
          color: !inMonth ? 'text.disabled' : weekend ? 'text.secondary' : 'text.primary',
        }}>{d}</Typography>
        {day?.closed && (
          <Typography component="span" variant="caption" sx={{ color: 'success.main' }} aria-label="uzavřeno">🔒</Typography>
        )}
        {missing && (
          <Box aria-label="chybí výkaz" sx={{
            width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main', ml: 'auto',
          }}/>
        )}
      </Stack>

      <Stack direction="row" sx={{ flex: 1, mt: 0.5, alignItems: 'center', justifyContent: 'center' }}>
        {day?.type ? (
          <Stack spacing={0} sx={{ alignItems: 'center' }}>
            <Typography variant="h6" sx={{ lineHeight: 1 }}>{DAY_TYPE_ICON[day.type]}</Typography>
            <Typography variant="caption" sx={{
              textTransform: 'uppercase', letterSpacing: '0.04em',
              fontSize: '9px', fontWeight: 700,
              color: DAY_TYPE_COLOR[day.type],
            }}>{DAY_TYPE_LABEL[day.type]}</Typography>
          </Stack>
        ) : totalMin > 0 ? (
          <Stack spacing={0.25} sx={{ width: '100%', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{
              fontVariantNumeric: 'tabular-nums', fontWeight: 700,
            }}>{fmtHM(totalMin)}</Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (totalMin / DAILY_GOAL_MIN) * 100)}
              sx={{ width: '80%', height: 3, borderRadius: 1 }}
            />
          </Stack>
        ) : missing ? (
          <Typography variant="caption" sx={{ color: 'error.main', fontStyle: 'italic' }}>chybí</Typography>
        ) : null}
      </Stack>
    </Stack>
  );
}

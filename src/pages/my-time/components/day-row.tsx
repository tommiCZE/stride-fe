import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { DayDto, ProjectDto, TaskSummaryDto, WorklogDto } from '../../../api/types';
import { fmtHM, isoToday, isWeekend } from '../../../lib/time';
import {
  DAY_TYPE_COLOR, DAY_TYPE_ICON, DAY_TYPE_LABEL,
  WEEKDAY_LABELS, statusForDay, type DayStatus,
} from '../lib/week-math';
import DayActionMenu from './day-action-menu';

interface Props {
  userId: string;
  weekIso: string;
  dateIso: string;
  weekdayIndex: number;
  worklogs: WorklogDto[];
  day: DayDto | undefined;
  projects: ProjectDto[];
  tasks: TaskSummaryDto[];
  onOpen: () => void;
}

export default function DayRow({
  userId, weekIso, dateIso, weekdayIndex, worklogs, day, projects, tasks, onOpen,
}: Props) {
  const theme = useTheme();
  const todayIso = isoToday();
  const totalMin = worklogs.reduce((s, w) => s + w.minutes, 0);
  const status = statusForDay({ dateIso, todayIso, totalMin, day });
  const isToday = dateIso === todayIso;
  const weekend = isWeekend(dateIso);

  const projectMap = new Map(projects.map(p => [p.id, p]));
  const taskMap = new Map(tasks.map(t => [t.id, t]));

  const breakdown = new Map<string, number>();
  for (const w of worklogs) {
    const projectId = w.taskId ? taskMap.get(w.taskId)?.projectId ?? 'unknown' : 'meeting';
    breakdown.set(projectId, (breakdown.get(projectId) ?? 0) + w.minutes);
  }
  const segments = Array.from(breakdown.entries()).map(([projectId, min]) => ({
    projectId,
    min,
    color: projectId === 'meeting' ? theme.palette.grey[500]
         : projectMap.get(projectId)?.color ?? theme.palette.grey[400],
    label: projectId === 'meeting' ? 'MEET'
         : projectMap.get(projectId)?.key ?? '?',
  }));

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      aria-label={`${WEEKDAY_LABELS[weekdayIndex]} ${dateIso} – ${fmtHM(totalMin)}`}
      sx={{
        display: 'grid',
        gridTemplateColumns: '110px 78px 1fr 90px 130px',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5, py: 1,
        borderBottom: 1, borderColor: 'divider',
        cursor: 'pointer', userSelect: 'none',
        outline: 'none',
        '&:hover': { bgcolor: 'action.hover' },
        '&:focus-visible': { bgcolor: 'action.hover', outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: -2 },
        opacity: weekend && !day?.type && totalMin === 0 ? 0.55 : 1,
      }}
    >
      <Stack spacing={0}>
        <Typography variant="body2" sx={{ fontWeight: isToday ? 700 : 600,
          color: isToday ? 'primary.main' : 'text.primary' }}>
          {WEEKDAY_LABELS[weekdayIndex]}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {dateLabel(dateIso)}{isToday && ' · dnes'}
        </Typography>
      </Stack>

      <Box>
        {day?.type ? (
          <Stack spacing={0}>
            <Typography variant="h4" sx={{ lineHeight: 1 }}>{DAY_TYPE_ICON[day.type]}</Typography>
            <Typography variant="caption" sx={{
              textTransform: 'uppercase', letterSpacing: '0.06em', color: DAY_TYPE_COLOR[day.type], fontWeight: 700,
            }}>
              {DAY_TYPE_LABEL[day.type]}
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={0}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {totalMin > 0 ? fmtHM(totalMin) : '—'}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {worklogs.length > 0 ? `${worklogs.length} záznamů` : 'bez záznamu'}
            </Typography>
          </Stack>
        )}
      </Box>

      <Box>
        {day?.type ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip
              size="small"
              label={`${DAY_TYPE_ICON[day.type]} ${DAY_TYPE_LABEL[day.type]}`}
              sx={{
                bgcolor: `${DAY_TYPE_COLOR[day.type]}22`,
                color: DAY_TYPE_COLOR[day.type], fontWeight: 600,
              }}
            />
            {day.typeNote && (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {day.typeNote}
              </Typography>
            )}
          </Stack>
        ) : segments.length > 0 ? (
          <Stack spacing={0.5}>
            <Stack direction="row" sx={{ height: 8, borderRadius: 1, overflow: 'hidden', bgcolor: 'action.hover' }}>
              {segments.map(s => (
                <Tooltip key={s.projectId} title={`${s.label} · ${fmtHM(s.min)}`} arrow>
                  <Box sx={{
                    flex: s.min,
                    bgcolor: s.color,
                    transition: 'flex-grow 200ms',
                  }}/>
                </Tooltip>
              ))}
            </Stack>
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
              {segments.map(s => (
                <Stack key={s.projectId} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Box aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }}/>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {s.label} · {fmtHM(s.min)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        ) : (
          <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
            {weekend ? 'Víkend' : 'Bez záznamů'}
          </Typography>
        )}
      </Box>

      <Box>
        <StatusPill status={status} closed={day?.closed} />
      </Box>

      <Stack direction="row" sx={{ justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
        <DayActionMenu
          userId={userId}
          weekIso={weekIso}
          dateIso={dateIso}
          day={day}
          hasEntries={worklogs.length > 0}
          onOpenEditor={onOpen}
        />
      </Stack>
    </Box>
  );
}

function StatusPill({ status, closed }: { status: DayStatus; closed: boolean | undefined }) {
  const theme = useTheme();
  let label = '';
  let color: string = theme.palette.text.disabled;
  switch (status) {
    case 'closed':   label = 'Uzavřeno'; color = theme.palette.success.main; break;
    case 'open':     label = 'Otevřeno'; color = theme.palette.warning.main; break;
    case 'today':    label = 'Dnes';     color = theme.palette.primary.main; break;
    case 'missing':  label = 'Chybí';    color = theme.palette.error.main; break;
    case 'future':   label = 'Plánováno'; color = theme.palette.text.disabled; break;
    case 'weekend':  label = 'Víkend';   color = theme.palette.text.disabled; break;
    case 'pto':      label = 'Dovolená'; color = DAY_TYPE_COLOR.PTO; break;
    case 'sick':     label = 'Nemoc';    color = DAY_TYPE_COLOR.SICK; break;
    case 'holiday':  label = 'Svátek';   color = DAY_TYPE_COLOR.HOLIDAY; break;
    case 'personal': label = 'Volno';    color = DAY_TYPE_COLOR.PERSONAL; break;
  }
  if (closed && status === 'open') { label = 'Uzavřeno'; color = theme.palette.success.main; }
  return (
    <Chip size="small" label={label}
      sx={{
        bgcolor: `${color}1c`, color, fontWeight: 600,
        borderRadius: 1, height: 22,
      }}
    />
  );
}

function dateLabel(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${Number(d)}. ${Number(m)}.`;
}

import { useMemo } from 'react';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { ProjectDto, TaskSummaryDto } from '../../../api/types';
import { fmtHM } from '../../../lib/time';
import { DAILY_GOAL_MIN } from '../lib/week-math';
import type { EntryDraft } from './entry-row';

interface Props {
  drafts: EntryDraft[];
  projects: ProjectDto[];
  tasks: TaskSummaryDto[];
}

export default function DayDistributionBar({ drafts, projects, tasks }: Props) {
  const theme = useTheme();
  const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
  const taskMap = useMemo(() => new Map(tasks.map(t => [t.id, t])), [tasks]);

  const live = drafts.filter(d => d._state !== 'deleted');
  const total = live.reduce((s, d) => s + d.minutes, 0);
  const denom = Math.max(DAILY_GOAL_MIN, total);
  const timeCount = live.filter(d => d.mode === 'TIME').length;
  const durationCount = live.filter(d => d.mode === 'DURATION').length;

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', mb: 0.5 }}>
        <Typography variant="caption" sx={{
          textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, color: 'text.secondary',
        }}>
          Skladba dne
        </Typography>
        <Typography variant="caption" color="text.disabled">
          · {timeCount} s časem · {durationCount} jen doba
        </Typography>
        <Box sx={{ flex: 1 }}/>
        <LegendDot color={theme.palette.primary.main} label="čas" />
        <LegendDot color={theme.palette.primary.main} striped label="jen doba" />
      </Stack>

      <Stack direction="row" sx={{
        height: 22, borderRadius: 1, overflow: 'hidden',
        bgcolor: 'action.hover',
        border: 1, borderColor: 'divider',
      }}>
        {live.map(d => {
          const projectId = d.taskId ? taskMap.get(d.taskId)?.projectId : null;
          const color = projectId
            ? projectMap.get(projectId)?.color ?? theme.palette.grey[400]
            : theme.palette.grey[500];
          const label = d.taskId
            ? taskMap.get(d.taskId)?.key?.split('-').pop() ?? '?'
            : 'MEET';
          const striped = d.mode === 'DURATION';
          const showLabel = (d.minutes / denom) > 0.06;
          return (
            <Tooltip key={d.id} arrow
              title={`${label} · ${fmtHM(d.minutes)}${d.mode === 'DURATION' ? ' · jen doba' : ` · ${d.start}–${d.end}`}${d.note ? ' · ' + d.note : ''}`}>
              <Stack direction="row" sx={{
                flex: d.minutes,
                bgcolor: color,
                color: 'common.white',
                position: 'relative',
                alignItems: 'center', justifyContent: 'center',
                borderRight: '1px solid rgba(0,0,0,0.3)',
                '&:last-of-type': { borderRight: 0 },
                backgroundImage: striped
                  ? `repeating-linear-gradient(135deg, ${color} 0 5px, rgba(255,255,255,0.4) 5px 10px)`
                  : undefined,
                overflow: 'hidden', whiteSpace: 'nowrap', cursor: 'default',
              }}>
                {showLabel && (
                  <Typography variant="caption" sx={{
                    fontWeight: 700, fontSize: '10px', color: 'common.white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                  }}>{label}</Typography>
                )}
              </Stack>
            </Tooltip>
          );
        })}
        {live.length === 0 && (
          <Stack direction="row" sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="caption" color="text.disabled">Žádné záznamy</Typography>
          </Stack>
        )}
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ mt: 0.75, alignItems: 'baseline' }}>
        <Typography variant="caption" color="text.disabled">0:00</Typography>
        <Box sx={{ flex: 1 }}/>
        <Typography variant="caption" color="text.disabled">cíl {fmtHM(DAILY_GOAL_MIN)}</Typography>
      </Stack>

      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
        {live.length} záznam{plural(live.length)} · Vykázáno {fmtHM(total)}
        {total < DAILY_GOAL_MIN ? ` · Do cíle 8h chybí ${fmtHM(DAILY_GOAL_MIN - total)}` : ''}
        {' · Šrafa = jen doba'}
      </Typography>
    </Box>
  );
}

function LegendDot({ color, label, striped }: { color: string; label: string; striped?: boolean }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Box aria-hidden sx={{
        width: 12, height: 12, borderRadius: 0.5, bgcolor: color,
        backgroundImage: striped
          ? `repeating-linear-gradient(135deg, ${color} 0 3px, rgba(255,255,255,0.4) 3px 6px)`
          : undefined,
      }}/>
      <Typography variant="caption" color="text.disabled">{label}</Typography>
    </Stack>
  );
}

function plural(n: number): string {
  if (n === 1) return '';
  if (n >= 2 && n <= 4) return 'y';
  return 'ů';
}

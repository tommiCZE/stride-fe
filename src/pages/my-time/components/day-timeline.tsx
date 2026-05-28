import { useMemo } from 'react';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { ProjectDto, TaskSummaryDto } from '../../../api/types';
import { hmToMin } from '../../../lib/time';
import type { EntryDraft } from './entry-row';

interface Props {
  drafts: EntryDraft[];
  projects: ProjectDto[];
  tasks: TaskSummaryDto[];
  isToday: boolean;
  nowHM: string | null;
}

export default function DayTimeline({ drafts, projects, tasks, isToday, nowHM }: Props) {
  const theme = useTheme();
  const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
  const taskMap = useMemo(() => new Map(tasks.map(t => [t.id, t])), [tasks]);
  const timeDrafts = drafts.filter(d => d.mode === 'TIME' && d.start && d.end && d._state !== 'deleted');

  let minH = 8;
  let maxH = 18;
  for (const d of timeDrafts) {
    const s = hmToMin(d.start)!;
    const e = hmToMin(d.end)!;
    minH = Math.min(minH, Math.floor(s / 60));
    maxH = Math.max(maxH, Math.ceil(e / 60));
  }
  if (maxH - minH < 4) maxH = minH + 4;
  const spanMin = (maxH - minH) * 60;
  const nowMin = nowHM ? hmToMin(nowHM) : null;
  const nowVisible = isToday && nowMin !== null && nowMin >= minH * 60 && nowMin <= maxH * 60;

  return (
    <Box>
      <Box sx={{ position: 'relative', height: 64, mt: 1 }}>
        {Array.from({ length: maxH - minH + 1 }, (_, i) => {
          const h = minH + i;
          const x = (i * 60) / spanMin * 100;
          return (
            <Box key={h} aria-hidden sx={{
              position: 'absolute', top: 0, bottom: 0,
              left: `${x}%`,
              borderLeft: 1, borderColor: 'divider',
            }}>
              <Typography variant="caption" color="text.disabled"
                sx={{ position: 'absolute', top: -14, left: 2, fontVariantNumeric: 'tabular-nums' }}>
                {h}
              </Typography>
            </Box>
          );
        })}
        {timeDrafts.map(d => {
          const s = hmToMin(d.start)!;
          const e = hmToMin(d.end)!;
          const x = ((s - minH * 60) / spanMin) * 100;
          const w = ((e - s) / spanMin) * 100;
          const project = d.taskId ? taskMap.get(d.taskId)?.projectId : null;
          const color = project
            ? projectMap.get(project)?.color ?? theme.palette.grey[400]
            : theme.palette.grey[500];
          const label = d.taskId
            ? taskMap.get(d.taskId)?.key?.split('-').pop() ?? '?'
            : 'MEET';
          return (
            <Tooltip key={d.id} title={`${d.start}–${d.end}${d.note ? ' · ' + d.note : ''}`} arrow>
              <Stack direction="row" sx={{
                position: 'absolute',
                top: 14, height: 30,
                left: `${x}%`, width: `${w}%`,
                bgcolor: color, color: 'common.white',
                borderRadius: 0.75,
                alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                px: 0.5, whiteSpace: 'nowrap',
                cursor: 'default',
                border: `1px solid ${color}`,
              }}>
                <Typography variant="caption" sx={{ color: 'common.white', fontWeight: 700, lineHeight: 1 }}>
                  {label}
                </Typography>
              </Stack>
            </Tooltip>
          );
        })}
        {nowVisible && nowMin !== null && (
          <Box aria-hidden sx={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${((nowMin - minH * 60) / spanMin) * 100}%`,
            borderLeft: `2px solid ${theme.palette.error.main}`,
            pointerEvents: 'none',
          }}/>
        )}
      </Box>
    </Box>
  );
}

import { Box, Stack, Typography } from '@mui/material';
import type { TaskSummaryDto } from '../api/types';

interface Props {
  tasks: Pick<TaskSummaryDto, 'status'>[];
  width?: number;
  showLegend?: boolean;
}

const SEGMENTS = [
  { key: 'DONE',        label: 'done',    color: 'success.main',  legendColor: 'success.dark' },
  { key: 'REVIEW',      label: 'review',  color: 'secondary.main', legendColor: 'text.primary' },
  { key: 'IN_PROGRESS', label: 'v práci', color: 'info.main',     legendColor: 'text.primary' },
  { key: 'TODO',        label: 'todo',    color: 'text.disabled', legendColor: 'text.secondary' },
] as const;

export default function StatusBreakdown({ tasks, width = 180, showLegend = true }: Props) {
  const counts: Record<string, number> = {};
  for (const t of tasks) counts[t.status] = (counts[t.status] ?? 0) + 1;

  const visible = SEGMENTS.map(s => ({ ...s, count: counts[s.key] ?? 0 }))
    .filter(s => s.count > 0);

  if (visible.length === 0) return null;

  return (
    <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
      <Stack direction="row" spacing={0.25} sx={{
        height: 6, width, borderRadius: 999, overflow: 'hidden', bgcolor: 'action.hover',
      }}>
        {visible.map(s => (
          <Box key={s.key} sx={{ flex: s.count, bgcolor: s.color }}/>
        ))}
      </Stack>
      {showLegend && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
          {SEGMENTS.map((s, i) => {
            const n = counts[s.key] ?? 0;
            const sep = i === 0 ? null : <Box component="span" sx={{ mx: 0.6, color: 'text.disabled' }}>·</Box>;
            const isDone = s.key === 'DONE';
            return (
              <Box component="span" key={s.key}>
                {sep}
                <Box component="span" sx={{ color: isDone ? 'success.dark' : 'text.secondary', fontWeight: isDone ? 700 : 400 }}>
                  {n} {s.label}
                </Box>
              </Box>
            );
          })}
        </Typography>
      )}
    </Stack>
  );
}

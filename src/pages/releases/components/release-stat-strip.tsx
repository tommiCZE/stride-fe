import { Box, Divider, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import type { ReleaseDto, TaskSummaryDto } from '../../../api/types';

interface Counts {
  TODO: number;
  IN_PROGRESS: number;
  IN_REVIEW: number;
  DONE: number;
  blockers: number;
  total: number;
}

function compute(tasks: TaskSummaryDto[]): Counts {
  const c: Counts = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0, blockers: 0, total: 0 };
  for (const t of tasks) {
    c.total++;
    if (t.status === 'TODO' || t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW' || t.status === 'DONE') {
      c[t.status]++;
    }
    if (t.priority === 'URGENT' && t.status !== 'DONE') c.blockers++;
  }
  return c;
}

function Bar({ segments }: { segments: Array<{ value: number; color: string }> }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) {
    return <Box sx={{ height: 4, borderRadius: 999, bgcolor: 'action.hover' }}/>;
  }
  return (
    <Stack direction="row" spacing={0.25} sx={{ height: 4 }}>
      {segments.map((s, i) => s.value === 0 ? null : (
        <Box key={i} sx={{ flex: s.value, bgcolor: s.color, borderRadius: 999 }}/>
      ))}
    </Stack>
  );
}

function StatCell({
  label, value, valueColor, bar,
}: {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  bar: React.ReactNode;
}) {
  return (
    <Stack spacing={0.5} sx={{ flex: 1, px: 2 }}>
      <Typography sx={{
        fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'text.secondary',
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: 22, fontWeight: 700, lineHeight: 1.1,
        color: valueColor ?? 'text.primary',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </Typography>
      <Box sx={{ mt: 0.5 }}>{bar}</Box>
    </Stack>
  );
}

interface Props {
  release: ReleaseDto;
  tasks: TaskSummaryDto[];
}

export default function ReleaseStatStrip({ release, tasks }: Props) {
  const c = compute(tasks);
  const total = Math.max(c.total, release.taskCount);
  const donePct = total === 0 ? 0 : Math.round((c.DONE / total) * 100);
  const isReleased = release.status === 'released';

  return (
    <Stack
      direction="row"
      sx={{
        bgcolor: theme => theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50',
        border: 1, borderColor: 'divider', borderRadius: 1.5,
        py: 2, mx: { xs: 2, md: 4 },
        alignItems: 'stretch',
      }}
    >
      <StatCell
        label="Hotovo"
        value={`${donePct} %`}
        bar={<Bar segments={[
          { value: c.DONE,        color: '#10b981' },
          { value: c.IN_REVIEW,   color: '#a855f7' },
          { value: c.IN_PROGRESS, color: '#0ea5e9' },
          { value: c.TODO,        color: '#cbd5e1' },
        ]}/>}
      />
      <Divider orientation="vertical" flexItem/>
      <StatCell
        label="Tasky"
        value={<>{total} <Box component="span" sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary' }}>celkem</Box></>}
        bar={<Bar segments={[
          { value: c.DONE,                                                color: '#10b981' },
          { value: c.TODO + c.IN_PROGRESS + c.IN_REVIEW + c.blockers,    color: '#cbd5e1' },
        ]}/>}
      />
      <Divider orientation="vertical" flexItem/>
      <StatCell
        label="V review"
        value={<>{c.IN_REVIEW} <Box component="span" sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary' }}>čekají</Box></>}
        bar={<Bar segments={[
          { value: c.IN_REVIEW, color: '#a855f7' },
          { value: Math.max(0, total - c.IN_REVIEW), color: '#e5e7eb' },
        ]}/>}
      />
      <Divider orientation="vertical" flexItem/>
      {isReleased ? (
        <StatCell
          label="Vydáno"
          value={
            <Typography sx={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {release.releaseDate ? dayjs(release.releaseDate).format('D. M. YYYY') : '—'}
            </Typography>
          }
          bar={<Bar segments={[{ value: 1, color: '#10b981' }]}/>}
        />
      ) : (
        <StatCell
          label="Bloková"
          value={c.blockers}
          valueColor={c.blockers > 0 ? 'error.main' : undefined}
          bar={<Bar segments={[
            { value: c.blockers, color: '#dc2626' },
            { value: Math.max(0, total - c.blockers), color: '#e5e7eb' },
          ]}/>}
        />
      )}
    </Stack>
  );
}

import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import { useReleaseTasks } from '../../../hooks/useReleases';
import { CaretIcon, CaretRIcon } from '../../../components/icons/icons';
import type { ReleaseDto, ReleaseStatus, TaskSummaryDto } from '../../../api/types';
import ReleaseTaskList, { type ReleaseGroupBy } from './release-task-list';
import AddTaskToReleaseDialog from './add-task-to-release-dialog';

const STATUS_META: Record<ReleaseStatus, { label: string; color: string }> = {
  unreleased: { label: 'Plánováno', color: 'warning.main' },
  released:   { label: 'Vydáno',    color: 'success.main' },
  archived:   { label: 'Archiv',    color: 'text.disabled' },
};

function StatusChip({ status }: { status: ReleaseStatus }) {
  const m = STATUS_META[status];
  return (
    <Box sx={{
      px: 0.75, py: 0.15, borderRadius: 0.75,
      fontSize: '12px', fontWeight: 700,
      color: m.color,
      border: 1, borderColor: m.color,
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: m.color }}/>
      {m.label}
    </Box>
  );
}

const PLACEHOLDER_DATE = '— bez data —';

function pluralWeeks(n: number) {
  if (n === 1) return 'týden';
  if (n >= 2 && n <= 4) return 'týdny';
  return 'týdnů';
}

function pluralMonths(n: number) {
  if (n === 1) return 'měsícem';
  return 'měsíci';
}

function pluralDays(n: number) {
  if (n === 1) return 'den';
  if (n >= 2 && n <= 4) return 'dny';
  return 'dnů';
}

function formatDate(iso: string) {
  return dayjs(iso).format('D. M. YYYY');
}

function unreleasedMeta(releaseDate: string | null): { text: string; color: string } {
  if (!releaseDate) return { text: PLACEHOLDER_DATE, color: 'text.disabled' };
  const days = dayjs(releaseDate).startOf('day').diff(dayjs().startOf('day'), 'day');
  const dateStr = formatDate(releaseDate);
  let suffix: string;
  if (days < 0) suffix = `před ${-days} ${pluralDays(-days)}`;
  else if (days === 0) suffix = 'dnes';
  else if (days < 14) suffix = `za ${days} ${pluralDays(days)}`;
  else {
    const weeks = Math.round(days / 7);
    suffix = `za ${weeks} ${pluralWeeks(weeks)}`;
  }
  let color = 'success.main';
  if (days < 7) color = 'error.main';
  else if (days <= 30) color = 'warning.main';
  return { text: `Vydání: ${dateStr} · ${suffix}`, color };
}

function releasedMeta(releaseDate: string | null): { text: string; color: string } {
  if (!releaseDate) return { text: PLACEHOLDER_DATE, color: 'text.disabled' };
  const months = dayjs().diff(dayjs(releaseDate), 'month');
  const days = dayjs().diff(dayjs(releaseDate), 'day');
  const dateStr = formatDate(releaseDate);
  let suffix: string;
  if (months >= 1) suffix = `před ${months} ${pluralMonths(months)}`;
  else if (days >= 1) suffix = `před ${days} ${pluralDays(days)}`;
  else suffix = 'dnes';
  return { text: `${dateStr} · ${suffix}`, color: 'text.secondary' };
}

function archivedMeta(releaseDate: string | null): { text: string; color: string } {
  if (!releaseDate) return { text: PLACEHOLDER_DATE, color: 'text.disabled' };
  return { text: formatDate(releaseDate), color: 'text.secondary' };
}

function metaForStatus(release: ReleaseDto): { text: string; color: string } {
  switch (release.status) {
    case 'unreleased': return unreleasedMeta(release.releaseDate);
    case 'released':   return releasedMeta(release.releaseDate);
    case 'archived':   return archivedMeta(release.releaseDate);
  }
}

interface BreakdownCounts {
  TODO: number;
  IN_PROGRESS: number;
  IN_REVIEW: number;
  DONE: number;
}

function computeBreakdown(tasks: TaskSummaryDto[]): BreakdownCounts {
  const c: BreakdownCounts = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
  for (const t of tasks) {
    if (t.status === 'TODO' || t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW' || t.status === 'DONE') {
      c[t.status]++;
    }
  }
  return c;
}

const SEGMENT_ORDER: Array<{ key: keyof BreakdownCounts; color: string; label: string }> = [
  { key: 'DONE',        color: '#10b981', label: 'done' },
  { key: 'IN_REVIEW',   color: '#a855f7', label: 'review' },
  { key: 'IN_PROGRESS', color: '#0ea5e9', label: 'progress' },
  { key: 'TODO',        color: '#cbd5e1', label: 'todo' },
];

function BreakdownBar({ counts }: { counts: BreakdownCounts }) {
  const total = counts.TODO + counts.IN_PROGRESS + counts.IN_REVIEW + counts.DONE;
  if (total === 0) {
    return (
      <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.hover' }}/>
    );
  }
  return (
    <Stack direction="row" spacing={0.25} sx={{ flex: 1, height: 6 }}>
      {SEGMENT_ORDER.map(seg => {
        const value = counts[seg.key];
        if (value === 0) return null;
        return (
          <Box key={seg.key} sx={{
            flex: value,
            bgcolor: seg.color,
            borderRadius: 999,
            transition: '0.3s',
          }}/>
        );
      })}
    </Stack>
  );
}

function BreakdownPills({ counts }: { counts: BreakdownCounts }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
      {SEGMENT_ORDER.map(seg => {
        const value = counts[seg.key];
        if (value === 0) return null;
        return (
          <Stack key={seg.key} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: seg.color }}/>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
              {value} {seg.label}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

interface Props {
  release: ReleaseDto;
  expanded: boolean;
  onToggleExpand: () => void;
  onOpenDetail: () => void;
  onOpenTask?: (key: string) => void;
  groupBy: ReleaseGroupBy;
  onChangeGroupBy: (g: ReleaseGroupBy) => void;
  hiddenStatuses: Set<string>;
  onChangeHiddenStatuses: (h: Set<string>) => void;
}

export default function ReleaseCard({
  release, expanded, onToggleExpand, onOpenDetail, onOpenTask,
  groupBy, onChangeGroupBy, hiddenStatuses, onChangeHiddenStatuses,
}: Props) {
  const [addOpen, setAddOpen] = useState(false);
  // Lazy: only fetch tasks when expanded.
  const { data: expandedTasks = [] } = useReleaseTasks(expanded ? release.id : undefined);
  const breakdown = expanded ? computeBreakdown(expandedTasks) : null;

  const hasTasks = release.taskCount > 0;
  const flatProgress = hasTasks ? (release.doneCount / release.taskCount) * 100 : 0;
  const truncatedGoal = release.goal && release.goal.length > 120
    ? release.goal.slice(0, 117) + '…'
    : release.goal;
  const meta = metaForStatus(release);

  return (
    <Stack
      sx={{
        border: 1, borderColor: expanded ? 'primary.main' : 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Stack spacing={1.25}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[data-no-toggle]')) return;
          onToggleExpand();
        }}
        sx={{
          p: 2, cursor: 'pointer',
          '&:hover': {
            bgcolor: theme => alpha(theme.palette.primary.main, 0.02),
          },
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ display: 'flex', color: 'text.secondary' }}>
            {expanded ? <CaretIcon/> : <CaretRIcon/>}
          </Box>
          <Typography sx={{
            fontSize: '16px', fontWeight: 700,
            fontFamily: 'ui-monospace, monospace',
          }}>{release.name}</Typography>
          <StatusChip status={release.status}/>
          <Box
            data-no-toggle
            onClick={(e) => { e.stopPropagation(); onOpenDetail(); }}
            sx={{
              fontSize: 11, color: 'primary.main', fontWeight: 600,
              cursor: 'pointer', '&:hover': { textDecoration: 'underline' },
            }}
          >
            Otevřít detail →
          </Box>
          <Box sx={{ flex: 1 }}/>
          <Typography sx={{ fontSize: '12px', fontWeight: 500, color: meta.color }}>
            {meta.text}
          </Typography>
        </Stack>

        {truncatedGoal && (
          <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
            {truncatedGoal}
          </Typography>
        )}

        {hasTasks ? (
          expanded && breakdown ? (
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <BreakdownBar counts={breakdown}/>
                <Typography sx={{ fontSize: '13px', color: 'text.secondary',
                  fontVariantNumeric: 'tabular-nums', minWidth: 96, textAlign: 'right' }}>
                  {breakdown.DONE} / {release.taskCount} ({Math.round((breakdown.DONE / Math.max(1, release.taskCount)) * 100)}%)
                </Typography>
              </Stack>
              <BreakdownPills counts={breakdown}/>
            </Box>
          ) : (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box sx={{ flex: 1, height: 6, borderRadius: 3,
                bgcolor: 'action.hover', overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: `${flatProgress}%`,
                  bgcolor: release.status === 'released' ? 'success.main' : 'primary.main',
                  transition: '0.3s' }}/>
              </Box>
              <Typography sx={{ fontSize: '13px', color: 'text.secondary',
                fontVariantNumeric: 'tabular-nums', minWidth: 96, textAlign: 'right' }}>
                {release.doneCount} / {release.taskCount} ({Math.round(flatProgress)}%)
              </Typography>
            </Stack>
          )
        ) : (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.hover' }}/>
            <Typography sx={{ fontSize: '13px', color: 'text.disabled', minWidth: 96, textAlign: 'right' }}>
              bez tasků
            </Typography>
          </Stack>
        )}
      </Stack>

      {expanded && (
        <Box sx={{ borderTop: 1, borderColor: 'divider' }} data-no-toggle>
          <ReleaseTaskList
            releaseId={release.id}
            groupBy={groupBy}
            onChangeGroupBy={onChangeGroupBy}
            hiddenStatuses={hiddenStatuses}
            onChangeHiddenStatuses={onChangeHiddenStatuses}
            onAddTasks={() => setAddOpen(true)}
            onOpenTask={onOpenTask}
          />
        </Box>
      )}

      <AddTaskToReleaseDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        release={release}
      />
    </Stack>
  );
}

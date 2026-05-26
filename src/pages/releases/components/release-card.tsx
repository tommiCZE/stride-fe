import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import type { ReleaseDto, ReleaseStatus } from '../../../api/types';

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
  if (n >= 2 && n <= 4) return 'měsíci';
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

interface Props {
  release: ReleaseDto;
  onClick: () => void;
}

export default function ReleaseCard({ release, onClick }: Props) {
  const hasTasks = release.taskCount > 0;
  const progress = hasTasks ? (release.doneCount / release.taskCount) * 100 : 0;
  const truncatedGoal = release.goal && release.goal.length > 120
    ? release.goal.slice(0, 117) + '…'
    : release.goal;
  const meta = metaForStatus(release);

  return (
    <Stack spacing={1.25}
      onClick={onClick}
      sx={{
        border: 1, borderColor: 'divider', borderRadius: 1.5, p: 2,
        cursor: 'pointer',
        '&:hover': { borderColor: 'primary.main', bgcolor: theme => alpha(theme.palette.primary.main, 0.02) } }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography sx={{
          fontSize: '16px', fontWeight: 700,
          fontFamily: 'ui-monospace, monospace',
        }}>{release.name}</Typography>
        <StatusChip status={release.status}/>
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
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ flex: 1, height: 6, borderRadius: 3,
            bgcolor: 'action.hover', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${progress}%`,
              bgcolor: release.status === 'released' ? 'success.main' : 'primary.main',
              transition: '0.3s' }}/>
          </Box>
          <Typography sx={{ fontSize: '13px', color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums', minWidth: 96, textAlign: 'right' }}>
            {release.doneCount} / {release.taskCount} ({Math.round(progress)}%)
          </Typography>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.hover' }}/>
          <Typography sx={{ fontSize: '13px', color: 'text.disabled', minWidth: 96, textAlign: 'right' }}>
            bez tasků
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

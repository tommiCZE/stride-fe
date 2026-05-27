import { Box, Button, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, PlusIcon, OpenInNewIcon } from '../../../components/icons/icons';
import type { ReleaseDto, ReleaseStatus } from '../../../api/types';

const STATUS_META: Record<ReleaseStatus, { label: string; color: string }> = {
  unreleased: { label: 'Plánováno', color: 'warning.main' },
  released:   { label: 'Vydáno',    color: 'success.main' },
  archived:   { label: 'Archiv',    color: 'text.disabled' },
};

function StatusChip({ status }: { status: ReleaseStatus }) {
  const m = STATUS_META[status];
  return (
    <Stack direction="row" spacing={0.5} sx={{
      px: 1, py: 0.25, borderRadius: 1,
      alignItems: 'center', display: 'inline-flex',
      fontSize: '12px', fontWeight: 700,
      color: m.color, border: 1, borderColor: m.color,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: m.color }}/>
      {m.label}
    </Stack>
  );
}

function pluralWeeks(n: number) { return n === 1 ? 'týden' : n >= 2 && n <= 4 ? 'týdny' : 'týdnů'; }
function pluralDays(n: number)  { return n === 1 ? 'den'   : n >= 2 && n <= 4 ? 'dny'   : 'dnů';   }
function pluralMonths(n: number) { return n === 1 ? 'měsícem' : 'měsíci'; }

function metaText(release: ReleaseDto): string | null {
  if (!release.releaseDate) return null;
  const dateStr = dayjs(release.releaseDate).format('D. M. YYYY');
  if (release.status === 'unreleased') {
    const days = dayjs(release.releaseDate).startOf('day').diff(dayjs().startOf('day'), 'day');
    if (days < 0) return `Vydání ${dateStr} · před ${-days} ${pluralDays(-days)}`;
    if (days === 0) return `Vydání ${dateStr} · dnes`;
    if (days < 14) return `Vydání ${dateStr} · za ${days} ${pluralDays(days)}`;
    const weeks = Math.round(days / 7);
    return `Vydání ${dateStr} · za ${weeks} ${pluralWeeks(weeks)}`;
  }
  if (release.status === 'released') {
    const months = dayjs().diff(dayjs(release.releaseDate), 'month');
    const days = dayjs().diff(dayjs(release.releaseDate), 'day');
    if (months >= 1) return `Vydáno ${dateStr} · před ${months} ${pluralMonths(months)}`;
    if (days >= 1) return `Vydáno ${dateStr} · před ${days} ${pluralDays(days)}`;
    return `Vydáno ${dateStr} · dnes`;
  }
  return dateStr;
}

interface Props {
  release: ReleaseDto;
  projectKey: string;
  onPublish: () => void;
  onAddTask: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export default function ReleaseHero({
  release, projectKey, onPublish, onAddTask, onShare, onDelete,
}: Props) {
  const navigate = useNavigate();
  const meta = metaText(release);
  const isReleased = release.status === 'released';

  return (
    <Stack spacing={1.5} sx={{ px: { xs: 2, md: 4 }, pt: 2.5, pb: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography
          variant="caption" color="text.secondary"
          onClick={() => navigate(`/projects/${projectKey}/releases`)}
          sx={{ cursor: 'pointer', '&:hover': { color: 'text.primary', textDecoration: 'underline' } }}
        >
          ← Releases
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography sx={{
          fontSize: '26px', fontWeight: 700, lineHeight: 1.1,
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        }}>
          {release.name}
        </Typography>
        <StatusChip status={release.status}/>
        {meta && (
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            {meta}
          </Typography>
        )}
      </Stack>

      {release.goal && (
        <Typography sx={{
          fontStyle: 'italic', fontSize: 14, color: 'text.secondary',
          maxWidth: '70ch',
        }}>
          {release.goal}
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        {!isReleased && (
          <Button
            variant="contained" color="success" size="small" startIcon={<CheckIcon/>}
            onClick={onPublish}
          >
            Publish release
          </Button>
        )}
        {isReleased && (
          <Button variant="outlined" size="small" startIcon={<CheckIcon/>} onClick={onPublish}>
            Re-publish notes
          </Button>
        )}
        <Button variant="outlined" size="small" startIcon={<PlusIcon/>} onClick={onAddTask}>
          Přidat task
        </Button>
        <Button variant="text" size="small" startIcon={<OpenInNewIcon/>} onClick={onShare}>
          Sdílet
        </Button>
        <Box sx={{ flex: 1 }}/>
        <Button variant="text" size="small" color="error" onClick={onDelete}>
          Smazat
        </Button>
      </Stack>
    </Stack>
  );
}

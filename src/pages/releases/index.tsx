import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useProjects } from '../../hooks/useProjects';
import { useReleases, useCreateRelease } from '../../hooks/useReleases';
import { PlusIcon } from '../../components/icons/icons';
import type { ReleaseDto, ReleaseStatus } from '../../api/types';

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
      fontSize: '14px', fontWeight: 700,
      color: m.color,
      border: 1, borderColor: m.color,
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: m.color }}/>
      {m.label}
    </Box>
  );
}

function ReleaseCard({ release, onClick }: { release: ReleaseDto; onClick: () => void }) {
  const progress = release.taskCount > 0
    ? (release.doneCount / release.taskCount) * 100
    : 0;
  const truncatedGoal = release.goal && release.goal.length > 120
    ? release.goal.slice(0, 117) + '…'
    : release.goal;

  const dateRange = release.startDate || release.releaseDate
    ? `${release.startDate ?? '?'} → ${release.releaseDate ?? '?'}`
    : null;

  return (
    <Stack spacing={1.25}
      onClick={onClick}
      sx={{
        border: 1, borderColor: 'divider', borderRadius: 1.5, p: 2,
        cursor: 'default',
        '&:hover': { borderColor: 'primary.main', bgcolor: theme => alpha(theme.palette.primary.main, 0.02) } }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography sx={{
          fontSize: '16px', fontWeight: 700,
          fontFamily: 'ui-monospace, monospace',
        }}>{release.name}</Typography>
        <StatusChip status={release.status}/>
        <Box sx={{ flex: 1 }}/>
        {dateRange && (
          <Typography sx={{ fontSize: '13px', color: 'text.disabled' }}>
            {dateRange}
          </Typography>
        )}
      </Stack>

      {truncatedGoal && (
        <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
          {truncatedGoal}
        </Typography>
      )}

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
    </Stack>
  );
}

export default function ReleasesPage() {
  const { projectKey } = useParams<{ projectKey: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data: projects = [] } = useProjects();
  const project = projects.find(p => p.key === projectKey);
  const { data: releases = [], isLoading } = useReleases(project?.id);
  const createRelease = useCreateRelease();

  if (!project) return null;

  const handleCreate = () => {
    createRelease.mutate(
      { projectId: project.id, name: `v${releases.length + 1}.0.0` },
      {
        onSuccess: (r) => {
          enqueueSnackbar('Release vytvořen', { variant: 'success' });
          navigate(`/projects/${project.key}/releases/${r.id}`);
        },
        onError: () => enqueueSnackbar('Chyba při vytváření', { variant: 'error' }),
      },
    );
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
      <Stack direction="row" spacing={1.5} sx={{
        position: 'sticky', top: 0, zIndex: 1,
        px: { xs: 2, md: 4 }, pt: 2.5, pb: 2,
        bgcolor: 'background.default',
        borderBottom: 1, borderColor: 'divider',
        alignItems: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '13px', fontWeight: 600,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'text.secondary', mb: 0.25 }}>
            {project.name}
          </Typography>
          <Typography sx={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Releases
          </Typography>
        </Box>
        <Button
          size="small" variant="contained" startIcon={<PlusIcon/>}
          disabled={createRelease.isPending}
          onClick={handleCreate}
        >
          Nová verze
        </Button>
      </Stack>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 960 }}>
        {isLoading && (
          <Stack direction="row" sx={{ justifyContent: 'center', py: 6 }}>
            <CircularProgress size={20}/>
          </Stack>
        )}

        {!isLoading && releases.length === 0 && (
          <Box sx={{
            p: 4, textAlign: 'center', border: 1, borderStyle: 'dashed',
            borderColor: 'divider', borderRadius: 1.5, color: 'text.secondary',
          }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
              Zatím žádné verze
            </Typography>
            <Typography sx={{ fontSize: '14px', mb: 2 }}>
              Verze (např. „v1.2.0”) slouží pro plánování releases a release notes.
            </Typography>
            <Button size="small" variant="outlined" startIcon={<PlusIcon/>} onClick={handleCreate}>
              Vytvořit první verzi
            </Button>
          </Box>
        )}

        <Stack spacing={1.25} >
          {releases.map(r => (
            <ReleaseCard
              key={r.id}
              release={r}
              onClick={() => navigate(`/projects/${project.key}/releases/${r.id}`)}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

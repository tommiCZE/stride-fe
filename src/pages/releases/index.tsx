import { useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useProjects } from '../../hooks/useProjects';
import { useReleases, useCreateRelease } from '../../hooks/useReleases';
import { CaretIcon, CaretRIcon, PlusIcon } from '../../components/icons/icons';
import type { ReleaseDto, ReleaseStatus } from '../../api/types';
import ReleaseCard from './components/release-card';

type GroupKey = ReleaseStatus;

const GROUP_LABELS: Record<GroupKey, string> = {
  unreleased: 'Nadcházející',
  released:   'Vydané',
  archived:   'Archiv',
};

const GROUP_ORDER: GroupKey[] = ['unreleased', 'released', 'archived'];

function compareDates(a: string | null, b: string | null, direction: 'asc' | 'desc'): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
}

function sortGroup(group: GroupKey, releases: ReleaseDto[]): ReleaseDto[] {
  const direction = group === 'unreleased' ? 'asc' : 'desc';
  return [...releases].sort((a, b) => compareDates(a.releaseDate, b.releaseDate, direction));
}

function GroupHeader({
  label, count, collapsible, collapsed, onToggle,
}: {
  label: string;
  count: number;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <Stack
      direction="row" spacing={1}
      onClick={collapsible ? onToggle : undefined}
      sx={{
        alignItems: 'center',
        cursor: collapsible ? 'pointer' : 'default',
        mt: 2.5, mb: 1,
        userSelect: 'none',
      }}
    >
      {collapsible && (
        <Box sx={{ display: 'flex', color: 'text.secondary' }}>
          {collapsed ? <CaretRIcon/> : <CaretIcon/>}
        </Box>
      )}
      <Typography sx={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'text.secondary',
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: '11px', fontWeight: 700,
        color: 'text.disabled', fontVariantNumeric: 'tabular-nums',
      }}>
        {count}
      </Typography>
      <Divider sx={{ flex: 1, ml: 1 }}/>
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
  const [archivedCollapsed, setArchivedCollapsed] = useState(true);

  const groups = useMemo(() => {
    const buckets: Record<GroupKey, ReleaseDto[]> = { unreleased: [], released: [], archived: [] };
    for (const r of releases) buckets[r.status].push(r);
    return {
      unreleased: sortGroup('unreleased', buckets.unreleased),
      released:   sortGroup('released',   buckets.released),
      archived:   sortGroup('archived',   buckets.archived),
    };
  }, [releases]);

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

  const goToDetail = (r: ReleaseDto) =>
    navigate(`/projects/${project.key}/releases/${r.id}`);

  const renderGroup = (key: GroupKey) => {
    const items = groups[key];
    const label = GROUP_LABELS[key];
    const collapsible = key === 'archived';
    const collapsed = key === 'archived' && archivedCollapsed;
    if (items.length === 0) return null;
    return (
      <Box key={key}>
        <GroupHeader
          label={label}
          count={items.length}
          collapsible={collapsible}
          collapsed={collapsed}
          onToggle={() => setArchivedCollapsed(v => !v)}
        />
        {!collapsed && (
          <Stack spacing={1.25}>
            {items.map(r => (
              <ReleaseCard key={r.id} release={r} onClick={() => goToDetail(r)}/>
            ))}
          </Stack>
        )}
      </Box>
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

        {!isLoading && releases.length > 0 && GROUP_ORDER.map(renderGroup)}
      </Box>
    </Box>
  );
}

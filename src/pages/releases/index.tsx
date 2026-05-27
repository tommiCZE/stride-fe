import { useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  DndContext, MeasuringStrategy, PointerSensor,
  useSensor, useSensors, closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import { useProjects } from '../../hooks/useProjects';
import { useReleases, releaseKeys } from '../../hooks/useReleases';
import { useUpdateTask, taskKeys } from '../../hooks/useTasks';
import { CaretIcon, CaretRIcon, PlusIcon } from '../../components/icons/icons';
import type { ReleaseDto, ReleaseStatus } from '../../api/types';
import ReleaseCard from './components/release-card';
import CreateReleaseDrawer from './components/create-release-drawer';
import type { ReleaseGroupBy } from './components/release-task-list';

type GroupKey = ReleaseStatus;

const GROUP_LABELS: Record<GroupKey, string> = {
  unreleased: 'Nadcházející',
  released:   'Vydané',
  archived:   'Archiv',
};

const GROUP_ORDER: GroupKey[] = ['unreleased', 'released', 'archived'];

const GROUP_BY_STORAGE_KEY = 'releases.groupBy';
const HIDDEN_STATUSES_DEFAULT = new Set<string>(['DONE']);

function loadGroupBy(): ReleaseGroupBy {
  if (typeof window === 'undefined') return 'status';
  const raw = window.localStorage.getItem(GROUP_BY_STORAGE_KEY);
  if (raw === 'status' || raw === 'type' || raw === 'priority' || raw === 'assignee') return raw;
  return 'status';
}

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

function parseExpandParam(value: string | null): Set<string> {
  if (!value) return new Set();
  return new Set(value.split(',').filter(Boolean));
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
        mt: 2.5, mb: 1, userSelect: 'none',
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
  const [archivedCollapsed, setArchivedCollapsed] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const expandSet = useMemo(() => parseExpandParam(searchParams.get('expand')), [searchParams]);
  const [groupBy, setGroupBy] = useState<ReleaseGroupBy>(loadGroupBy);
  const [hiddenStatuses, setHiddenStatuses] = useState<Set<string>>(HIDDEN_STATUSES_DEFAULT);
  const updateTask = useUpdateTask(project?.id);
  const qc = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(GROUP_BY_STORAGE_KEY, groupBy);
  }, [groupBy]);

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

  const goToDetail = (r: ReleaseDto) =>
    navigate(`/projects/${project.key}/releases/${r.id}`);

  const openTask = (key: string) =>
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('task', key);
      return next;
    });

  const writeExpand = (next: Set<string>) => {
    setSearchParams(prev => {
      const out = new URLSearchParams(prev);
      if (next.size === 0) out.delete('expand');
      else out.set('expand', [...next].join(','));
      return out;
    });
  };

  const toggleExpand = (release: ReleaseDto) => {
    const next = new Set(expandSet);
    if (next.has(release.id)) next.delete(release.id);
    else next.add(release.id);
    writeExpand(next);
  };

  const expandAll = () => writeExpand(new Set(releases.map(r => r.id)));
  const collapseAll = () => writeExpand(new Set());

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    // active: `t:<releaseId>:<taskId>`
    // over:   `r:<releaseId>:status:<statusId>`
    const taskMatch = activeId.match(/^t:([^:]+):(.+)$/);
    const dropMatch = overId.match(/^r:([^:]+):status:(.+)$/);
    if (!taskMatch || !dropMatch) return;
    const [, fromReleaseId, taskId] = taskMatch;
    const [, toReleaseId, toStatus] = dropMatch;

    const body: { status?: string; fixVersionId?: string | null } = {};
    if (toStatus) body.status = toStatus;
    if (toReleaseId !== fromReleaseId) body.fixVersionId = toReleaseId;
    if (Object.keys(body).length === 0) return;

    updateTask.mutate(
      { id: taskId, body },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: releaseKeys.tasks(fromReleaseId) });
          if (toReleaseId !== fromReleaseId) {
            qc.invalidateQueries({ queryKey: releaseKeys.tasks(toReleaseId) });
            qc.invalidateQueries({ queryKey: releaseKeys.byProject(project.id) });
          }
          qc.invalidateQueries({ queryKey: taskKeys.list(project.id) });
        },
        onError: () => enqueueSnackbar('Nepodařilo se přesunout task', { variant: 'error' }),
      },
    );
  };

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
              <ReleaseCard
                key={r.id}
                release={r}
                expanded={expandSet.has(r.id)}
                onToggleExpand={() => toggleExpand(r)}
                onOpenDetail={() => goToDetail(r)}
                onOpenTask={openTask}
                groupBy={groupBy}
                onChangeGroupBy={setGroupBy}
                hiddenStatuses={hiddenStatuses}
                onChangeHiddenStatuses={setHiddenStatuses}
              />
            ))}
          </Stack>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: 'background.default' }}>
      <Stack direction="row" spacing={1.5} sx={{
        position: 'sticky', top: 0, zIndex: 2,
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
        {releases.length > 0 && (
          <Stack direction="row" spacing={0.5}>
            <Button size="small" variant="text" onClick={expandAll} disabled={expandSet.size === releases.length}>
              Rozbalit vše
            </Button>
            <Button size="small" variant="text" onClick={collapseAll} disabled={expandSet.size === 0}>
              Sbalit vše
            </Button>
          </Stack>
        )}
        <Button
          size="small" variant="contained" startIcon={<PlusIcon/>}
          onClick={() => setCreateOpen(true)}
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
            <Button size="small" variant="outlined" startIcon={<PlusIcon/>} onClick={() => setCreateOpen(true)}>
              Vytvořit první verzi
            </Button>
          </Box>
        )}

        {!isLoading && releases.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
            onDragEnd={onDragEnd}
          >
            {GROUP_ORDER.map(renderGroup)}
          </DndContext>
        )}
      </Box>

      <CreateReleaseDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        projectId={project.id}
        projectKey={project.key}
        releases={releases}
      />
    </Box>
  );
}

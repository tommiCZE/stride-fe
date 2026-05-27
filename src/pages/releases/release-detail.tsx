import { useState } from 'react';
import { Box, CircularProgress, Stack, Tab, Tabs } from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useProjects } from '../../hooks/useProjects';
import {
  useRelease, useReleaseTasks, useUpdateRelease, useDeleteRelease,
} from '../../hooks/useReleases';
import ReleaseHero from './components/release-hero';
import ReleaseStatStrip from './components/release-stat-strip';
import ReleaseDetailMeta from './components/release-detail-meta';
import ReleaseTaskList, { type ReleaseGroupBy } from './components/release-task-list';
import ReleaseNotesTab from './components/release-notes-tab';
import ReleaseActivityTab from './components/release-activity-tab';
import ReleaseDeploymentsTab from './components/release-deployments-tab';
import AddTaskToReleaseDialog from './components/add-task-to-release-dialog';
import {
  DndContext, MeasuringStrategy, PointerSensor,
  useSensor, useSensors, closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateTask, taskKeys } from '../../hooks/useTasks';
import { releaseKeys } from '../../hooks/useReleases';
import type { ReleaseStatus } from '../../api/types';

type TabKey = 'tasky' | 'notes' | 'aktivita' | 'deployments';

const TAB_ORDER: TabKey[] = ['tasky', 'notes', 'aktivita', 'deployments'];

function asTabKey(value: string | undefined): TabKey {
  if (value === 'notes' || value === 'aktivita' || value === 'deployments') return value;
  return 'tasky';
}

export default function ReleaseDetailPage() {
  const { projectKey, releaseId, tab } = useParams<{
    projectKey: string; releaseId: string; tab?: string;
  }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const { data: projects = [] } = useProjects();
  const project = projects.find(p => p.key === projectKey);
  const { data: release, isLoading } = useRelease(releaseId);
  const { data: tasks = [] } = useReleaseTasks(releaseId);
  const updateRelease = useUpdateRelease();
  const deleteRelease = useDeleteRelease(project?.id ?? '');
  const updateTask = useUpdateTask(project?.id);

  const [groupBy, setGroupBy] = useState<ReleaseGroupBy>('status');
  const [hiddenStatuses, setHiddenStatuses] = useState<Set<string>>(new Set(['DONE']));
  const [addOpen, setAddOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const activeTab = asTabKey(tab);

  const openTask = (key: string) =>
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('task', key);
      return next;
    });

  if (!project) return null;
  if (isLoading || !release) {
    return (
      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={20}/>
      </Stack>
    );
  }

  const handleChangeTab = (next: TabKey) => {
    const search = searchParams.toString();
    const url = `/projects/${project.key}/releases/${release.id}/${next}${search ? '?' + search : ''}`;
    navigate(url);
  };

  const handlePublish = () => {
    if (release.status === 'released') {
      enqueueSnackbar('Verze už je vydaná', { variant: 'info' });
      return;
    }
    if (!window.confirm(`Vydat verzi „${release.name}”?`)) return;
    updateRelease.mutate(
      { id: release.id, body: { status: 'released' as ReleaseStatus } },
      {
        onSuccess: () => enqueueSnackbar('Verze vydána', { variant: 'success' }),
        onError: () => enqueueSnackbar('Publish selhal', { variant: 'error' }),
      },
    );
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      enqueueSnackbar('Odkaz zkopírován', { variant: 'success' });
    } catch {
      enqueueSnackbar('Kopírování odkazu selhalo', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    if (!window.confirm(`Smazat verzi „${release.name}”?`)) return;
    deleteRelease.mutate(release.id, {
      onSuccess: () => {
        enqueueSnackbar('Verze smazána', { variant: 'success' });
        navigate(`/projects/${project.key}/releases`);
      },
      onError: () => enqueueSnackbar('Mazání selhalo', { variant: 'error' }),
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const taskMatch = activeId.match(/^t:([^:]+):(.+)$/);
    const dropMatch = overId.match(/^r:([^:]+):status:(.+)$/);
    if (!taskMatch || !dropMatch) return;
    const [, , taskId] = taskMatch;
    const [, , toStatus] = dropMatch;
    if (!toStatus) return;

    updateTask.mutate(
      { id: taskId, body: { status: toStatus } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: releaseKeys.tasks(release.id) });
          qc.invalidateQueries({ queryKey: taskKeys.list(project.id) });
        },
        onError: () => enqueueSnackbar('Změna statusu selhala', { variant: 'error' }),
      },
    );
  };

  const tabLabel = (key: TabKey): string => {
    if (key === 'tasky')       return `Tasky · ${tasks.length}`;
    if (key === 'notes')       return 'Release notes';
    if (key === 'aktivita')    return 'Aktivita';
    return 'Deployments';
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
      <ReleaseHero
        release={release}
        projectKey={project.key}
        onPublish={handlePublish}
        onAddTask={() => setAddOpen(true)}
        onShare={handleShare}
        onDelete={handleDelete}
      />

      <ReleaseStatStrip release={release} tasks={tasks}/>

      <Box sx={{ mt: 3 }}>
        <ReleaseDetailMeta release={release}/>
      </Box>

      <Box sx={{
        borderBottom: 1, borderColor: 'divider',
        px: { xs: 2, md: 4 },
      }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => handleChangeTab(v as TabKey)}
          sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, fontSize: 13, py: 0.5 } }}
        >
          {TAB_ORDER.map(t => (
            <Tab key={t} value={t} label={tabLabel(t)}/>
          ))}
        </Tabs>
      </Box>

      {activeTab === 'tasky' && (
        <Box sx={{
          mx: { xs: 0, md: 0 }, mt: 0,
          border: 0,
        }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
            onDragEnd={onDragEnd}
          >
            <ReleaseTaskList
              releaseId={release.id}
              groupBy={groupBy}
              onChangeGroupBy={setGroupBy}
              hiddenStatuses={hiddenStatuses}
              onChangeHiddenStatuses={setHiddenStatuses}
              onAddTasks={() => setAddOpen(true)}
              onOpenTask={openTask}
            />
          </DndContext>
        </Box>
      )}

      {activeTab === 'notes'       && <ReleaseNotesTab release={release} projectKey={project.key}/>}
      {activeTab === 'aktivita'    && <ReleaseActivityTab releaseId={release.id}/>}
      {activeTab === 'deployments' && <ReleaseDeploymentsTab/>}

      <AddTaskToReleaseDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        release={release}
      />
    </Box>
  );
}

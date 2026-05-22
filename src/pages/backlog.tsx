import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Button, Card, Stack, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCenter, useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSnackbar } from 'notistack';
import { useTasks, useUpdateTask, useCreateTask } from '../hooks/useTasks';
import { useSprints, useUpdateSprint, useCreateSprint } from '../hooks/useSprints';
import { useProjectByKey } from '../hooks/useProjects';
import FluxAvatar from '../components/flux-avatar';
import TypeIcon from '../components/icons/type-icon';
import PriorityIcon from '../components/icons/priority-icon';
import { MonoKey, StatusBadge } from '../components/ui/ui';
import { CaretIcon, BacklogIcon, PlusIcon } from '../components/icons/icons';
import EmptyState from '../components/empty-state/EmptyState';
import QueryError from '../components/query-error/QueryError';
import { taskLinkProps } from '../utils/task-link';
import type { TaskSummaryDto } from '../api/types';

function GripIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
      <circle cx="2.5" cy="2.5" r="1.5"/><circle cx="7.5" cy="2.5" r="1.5"/>
      <circle cx="2.5" cy="7"   r="1.5"/><circle cx="7.5" cy="7"   r="1.5"/>
      <circle cx="2.5" cy="11.5" r="1.5"/><circle cx="7.5" cy="11.5" r="1.5"/>
    </svg>
  );
}

interface RowProps {
  task: TaskSummaryDto;
  onOpen: (key: string) => void;
  showEstimate?: boolean;
  isLast?: boolean;
}

function SortableRow({ task: t, onOpen, showEstimate, isLast }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: t.id });
  const assignee = t.assigneeId
    ? { color: t.assigneeColor ?? '#94a3b8', initials: t.assigneeInitials ?? '?' }
    : undefined;

  return (
    <Stack
      ref={setNodeRef}
      direction="row"
      sx={{
        transform: CSS.Transform.toString(transform),
        transition,
        alignItems: 'center',
        borderBottom: isLast ? 0 : 1, borderColor: 'divider',
        bgcolor: isDragging ? 'action.selected' : 'background.paper',
        opacity: isDragging ? 0.45 : 1,
        '&:hover': { bgcolor: isDragging ? 'action.selected' : 'action.hover' },
        '&:hover .grip': { opacity: 1 },
      }}
    >
      <Box className="grip" {...attributes} {...listeners}
        sx={{ opacity: 0, cursor: 'grab', pl: 1, pr: 0.25, py: 0.85,
          color: 'text.disabled', flexShrink: 0, '&:active': { cursor: 'grabbing' } }}>
        <GripIcon />
      </Box>
      <Stack direction="row" spacing={1}
        {...taskLinkProps(t.key, onOpen)}
        onClick={(e) => {
          if (isDragging) { e.preventDefault(); return; }
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          onOpen(t.key);
        }}
        sx={{ flex: 1, alignItems: 'center', px: 1, py: 0.85, minWidth: 0, cursor: 'default',
          textDecoration: 'none', color: 'text.primary' }}>
        <PriorityIcon priority={t.priority} />
        <TypeIcon type={t.type} size={13} />
        <MonoKey sx={{ minWidth: 60 }}>{t.key}</MonoKey>
        <Typography variant="body2" sx={{ flex: 1, minWidth: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {t.title}
        </Typography>
        {showEstimate && (
          <Typography variant="body2" sx={{ fontWeight: 600, px: 0.5, borderRadius: 0.6, bgcolor: 'action.hover', flexShrink: 0 }}>
            {t.estimate ?? '—'}
          </Typography>
        )}
        <FluxAvatar user={assignee} size={18} />
      </Stack>
    </Stack>
  );
}

function QuickAddTaskRow({
  projectId, sprintId, isPending, onCreate,
}: {
  projectId: string;
  sprintId: string | null;
  isPending: boolean;
  onCreate: (title: string, sprintId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed || !projectId) return;
    onCreate(trimmed, sprintId);
    setTitle('');
  };

  if (!open) {
    return (
      <Stack
        direction="row" spacing={0.75}
        onClick={() => setOpen(true)}
        sx={{ alignItems: 'center', px: 1.5, py: 0.85, cursor: 'default',
          color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
        <PlusIcon/>
        <Typography variant="body2" color="inherit">Přidat task</Typography>
      </Stack>
    );
  }
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 1.5, py: 0.5 }}>
      <TextField
        size="small" autoFocus placeholder="Název tasku…" value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') { setOpen(false); setTitle(''); }
        }}
        onBlur={() => { if (!title.trim()) setOpen(false); }}
        disabled={isPending}
        sx={{ flex: 1, '& .MuiInputBase-root': { height: 30, fontSize: '14px' } }}
      />
      <Button size="small" variant="outlined"
        disabled={!title.trim() || isPending}
        onClick={submit}>
        Přidat
      </Button>
    </Stack>
  );
}

function DroppableList({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Box ref={setNodeRef} sx={{ minHeight: 8, transition: 'background 0.15s',
      bgcolor: isOver ? 'action.hover' : 'transparent' }}>
      {children}
    </Box>
  );
}

export default function Backlog() {
  const { projectKey } = useParams<{ projectKey: string }>();
  const { data: project } = useProjectByKey(projectKey);
  const projectId = project?.id;
  const [, setSearchParams] = useSearchParams();
  const openTask = (key: string) => setSearchParams({ task: key });
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: remoteTasks = [],
    isError: tasksError,
    error: tasksErrorObj,
    refetch: refetchTasks,
  } = useTasks(projectId!);
  const {
    data: sprints = [],
    isError: sprintsError,
    error: sprintsErrorObj,
    refetch: refetchSprints,
  } = useSprints(projectId!);
  const updateTask = useUpdateTask(projectId);
  const updateSprint = useUpdateSprint(projectId!);
  const createSprint = useCreateSprint();
  const createTask = useCreateTask();
  const [newSprintName, setNewSprintName] = useState('');

  const handleCreateTask = (title: string, sprintId: string | null) => {
    if (!projectId) return;
    createTask.mutate(
      { title, projectId, type: 'TASK', priority: 'MEDIUM',
        ...(sprintId ? { sprintId } : {}) },
      { onError: () => enqueueSnackbar('Task se nepodařilo vytvořit', { variant: 'error' }) },
    );
  };

  const [localTasks, setLocalTasks] = useState<TaskSummaryDto[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const tasks = localTasks ?? remoteTasks;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const sprintColor = (state: string) =>
    state === 'ACTIVE'    ? theme.palette.success.main
    : state === 'PLANNED' ? theme.palette.primary.main
    : theme.palette.text.secondary;

  const sprintLabel = (state: string) =>
    state === 'ACTIVE' ? 'Aktivní' : state === 'PLANNED' ? 'Plánovaný' : 'Hotový';

  const getContainerTasks = (sprintId: string | null) =>
    sprintId === null
      ? tasks.filter(t => !t.sprintId)
      : tasks.filter(t => t.sprintId === sprintId);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
    if (!localTasks) setLocalTasks([...remoteTasks]);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const overId = over.id as string;

    setLocalTasks(prev => {
      const arr = prev ?? remoteTasks;
      const activeTask = arr.find(t => t.id === active.id);
      if (!activeTask) return arr;

      const overTask = arr.find(t => t.id === overId);
      const targetSprint = overTask
        ? (overTask.sprintId ?? null)
        : overId === 'backlog' ? null : overId;

      const sourceSprint = activeTask.sprintId ?? null;
      if (sourceSprint === targetSprint) return arr;

      return arr.map(t =>
        t.id === active.id ? { ...t, sprintId: targetSprint } : t
      );
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) { setLocalTasks(null); return; }

    const activeTask = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);

    if (activeTask && overTask && activeTask.sprintId === overTask.sprintId) {
      setLocalTasks(prev => {
        const arr = prev ?? remoteTasks;
        const bucket = arr.filter(t => t.sprintId === activeTask.sprintId);
        const rest = arr.filter(t => t.sprintId !== activeTask.sprintId);
        const from = bucket.findIndex(t => t.id === active.id);
        const to = bucket.findIndex(t => t.id === over.id);
        if (from === -1 || to === -1) return arr;
        return [...rest, ...arrayMove(bucket, from, to)];
      });
      return;
    }

    const originalSprintId = remoteTasks.find(t => t.id === active.id)?.sprintId ?? null;
    const newSprintId = activeTask?.sprintId ?? null;
    if (newSprintId !== originalSprintId) {
      updateTask.mutate(
        { id: active.id as string, body: { sprintId: newSprintId } },
        { onError: () => setLocalTasks(null), onSuccess: () => setLocalTasks(null) },
      );
    } else {
      setLocalTasks(null);
    }
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;
  const backlogTasks = getContainerTasks(null);
  const visibleSprints = sprints.filter(s => s.state !== 'COMPLETED');
  const hasActiveSprint = sprints.some(s => s.state === 'ACTIVE');

  if (tasksError || sprintsError) {
    return (
      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', height: '100%' }}>
        <QueryError
          error={tasksError ? tasksErrorObj : sprintsErrorObj}
          onRetry={() => {
            if (tasksError) void refetchTasks();
            if (sprintsError) void refetchSprints();
          }}
        />
      </Stack>
    );
  }

  if (visibleSprints.length === 0 && backlogTasks.length === 0) {
    return (
      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', height: '100%' }}>
        <EmptyState
          icon={<BacklogIcon />}
          title="Zatím žádné sprinty"
          description="Vytvoř první sprint a začni plánovat práci týmu. Tasky můžeš přetáhnout z backlogu do sprintu."
          action={
            <Button variant="contained" size="small" startIcon={<PlusIcon />}>
              Vytvořit sprint
            </Button>
          }
        />
      </Stack>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}
      onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <Stack spacing={2} sx={{ overflowY: 'auto', p: 2, bgcolor: 'background.default', height: '100%' }}>
        {visibleSprints.map(sp => {
          const sprintTasks = getContainerTasks(sp.id);
          const totalE = sprintTasks.reduce((a, t) => a + (t.estimate ?? 0), 0);
          const totalL = sprintTasks.reduce((a, t) => a + (t.logged ?? 0), 0);

          return (
            <Card key={sp.id} sx={{ borderRadius: 1.5 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <CaretIcon/>
                <Box>
                  <Typography sx={{ fontSize: '13.5px', fontWeight: 700 }}>{sp.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {sp.startDate && new Date(sp.startDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                    {sp.startDate && sp.endDate && ' – '}
                    {sp.endDate && new Date(sp.endDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                    {' · '}{sprintTasks.length} tasků · {totalE}h plán / {totalL}h logged
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}/>
                <StatusBadge badgeColor={sprintColor(sp.state)} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {sprintLabel(sp.state)}
                </StatusBadge>
                {sp.state === 'PLANNED' && (
                  <Tooltip title={hasActiveSprint ? 'Nejdřív dokonči aktivní sprint' : ''}>
                    <span>
                      <Button size="small" variant="contained"
                        disabled={updateSprint.isPending || hasActiveSprint}
                        onClick={() => updateSprint.mutate(
                          { id: sp.id, body: { state: 'ACTIVE' } },
                          {
                            onSuccess: () => enqueueSnackbar(`Sprint "${sp.name}" aktivován`, { variant: 'success' }),
                            onError: (err) => {
                              const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
                              enqueueSnackbar(detail ?? 'Sprint se nepodařilo aktivovat', { variant: 'error' });
                            },
                          },
                        )}>
                        Spustit sprint
                      </Button>
                    </span>
                  </Tooltip>
                )}
                {sp.state === 'ACTIVE' && (
                  <Button size="small" variant="outlined" color="inherit"
                    disabled={updateSprint.isPending}
                    onClick={() => updateSprint.mutate(
                      { id: sp.id, body: { state: 'COMPLETED' } },
                      { onSuccess: () => enqueueSnackbar(`Sprint "${sp.name}" dokončen`, { variant: 'success' }) },
                    )}>
                    Dokončit sprint
                  </Button>
                )}
              </Stack>
              <DroppableList id={sp.id}>
                <SortableContext items={sprintTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {sprintTasks.map((t, i) => (
                    <SortableRow key={t.id} task={t} onOpen={openTask} showEstimate
                      isLast={i === sprintTasks.length - 1}/>
                  ))}
                </SortableContext>
              </DroppableList>
              {projectId && (
                <Box sx={{ borderTop: sprintTasks.length > 0 ? 1 : 0, borderColor: 'divider' }}>
                  <QuickAddTaskRow projectId={projectId} sprintId={sp.id}
                    isPending={createTask.isPending} onCreate={handleCreateTask}/>
                </Box>
              )}
            </Card>
          );
        })}

        <Card sx={{ borderRadius: 1.5 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <CaretIcon/>
            <Typography sx={{ fontSize: '13.5px', fontWeight: 700 }}>Backlog</Typography>
            <Typography variant="caption" color="text.secondary">· {getContainerTasks(null).length} tasků</Typography>
          </Stack>
          <DroppableList id="backlog">
            <SortableContext items={getContainerTasks(null).map(t => t.id)} strategy={verticalListSortingStrategy}>
              {getContainerTasks(null).map((t, i, arr) => (
                <SortableRow key={t.id} task={t} onOpen={openTask}
                  isLast={i === arr.length - 1}/>
              ))}
            </SortableContext>
          </DroppableList>
          {projectId && (
            <Box sx={{ borderTop: getContainerTasks(null).length > 0 ? 1 : 0, borderColor: 'divider' }}>
              <QuickAddTaskRow projectId={projectId} sprintId={null}
                isPending={createTask.isPending} onCreate={handleCreateTask}/>
            </Box>
          )}
          <Stack direction="row" spacing={1} sx={{ p: 1.5, borderTop: 1, borderColor: 'divider',
            alignItems: 'center' }}>
            <TextField
              size="small" placeholder="Název nového sprintu…" value={newSprintName}
              onChange={e => setNewSprintName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newSprintName.trim() && projectId) {
                  createSprint.mutate({ name: newSprintName.trim(), projectId },
                    { onSuccess: () => setNewSprintName('') });
                }
              }}
              sx={{ flex: 1, '& .MuiInputBase-root': { height: 30, fontSize: '14px' } }}
            />
            <Button size="small" variant="outlined"
              disabled={!newSprintName.trim() || createSprint.isPending}
              onClick={() => {
                if (!newSprintName.trim() || !projectId) return;
                createSprint.mutate({ name: newSprintName.trim(), projectId },
                  { onSuccess: () => setNewSprintName('') });
              }}>
              Nový sprint
            </Button>
          </Stack>
        </Card>
      </Stack>

      <DragOverlay>
        {activeTask && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 1.5, py: 0.85,
            bgcolor: 'background.paper', border: 1, borderColor: 'primary.main',
            borderRadius: 0.5, boxShadow: 6 }}>
            <PriorityIcon priority={activeTask.priority}/>
            <TypeIcon type={activeTask.type} size={13}/>
            <MonoKey sx={{ minWidth: 60 }}>{activeTask.key}</MonoKey>
            <Typography variant="body2" sx={{ minWidth: 0,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 320 }}>
              {activeTask.title}
            </Typography>
          </Stack>
        )}
      </DragOverlay>
    </DndContext>
  );
}

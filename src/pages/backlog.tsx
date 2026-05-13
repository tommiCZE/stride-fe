import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Button, Card, TextField, Typography, useTheme } from '@mui/material';
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
import { useTasks, useUpdateTask } from '../hooks/useTasks';
import { useSprints, useUpdateSprint, useCreateSprint } from '../hooks/useSprints';
import FluxAvatar from '../components/flux-avatar';
import TypeIcon from '../components/icons/type-icon';
import PriorityIcon from '../components/icons/priority-icon';
import { MonoKey, StatusBadge } from '../components/ui/ui';
import { CaretIcon, BacklogIcon, PlusIcon } from '../components/icons/icons';
import EmptyState from '../components/empty-state/EmptyState';
import QueryError from '../components/query-error/QueryError';
import SprintBurndownChart from '../components/charts/SprintBurndownChart';
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
  onOpen: (id: string) => void;
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
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{
        display: 'flex', alignItems: 'center',
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
      <Box onClick={() => !isDragging && onOpen(t.id)}
        sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.85, minWidth: 0, cursor: 'default' }}>
        <PriorityIcon priority={t.priority} />
        <TypeIcon type={t.type} size={13} />
        <MonoKey sx={{ minWidth: 60 }}>{t.key}</MonoKey>
        <Typography sx={{ fontSize: 12.5, flex: 1, minWidth: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {t.title}
        </Typography>
        {showEstimate && (
          <Box sx={{ fontSize: 10.5, fontWeight: 600, px: 0.5, borderRadius: 0.6, bgcolor: 'action.hover', flexShrink: 0 }}>
            {t.estimate ?? '—'}
          </Box>
        )}
        <FluxAvatar user={assignee} size={18} />
      </Box>
    </Box>
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
  const { projectId } = useParams<{ projectId: string }>();
  const [, setSearchParams] = useSearchParams();
  const openTask = (id: string) => setSearchParams({ task: id });
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
  const [newSprintName, setNewSprintName] = useState('');

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

    // Reorder within same sprint
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

    // Sprint changed — persist to BE
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

  if (tasksError || sprintsError) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', height: '100%' }}>
        <QueryError
          error={tasksError ? tasksErrorObj : sprintsErrorObj}
          onRetry={() => {
            if (tasksError) void refetchTasks();
            if (sprintsError) void refetchSprints();
          }}
        />
      </Box>
    );
  }

  if (sprints.length === 0 && backlogTasks.length === 0) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', height: '100%' }}>
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
      </Box>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}
      onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'background.default', height: '100%' }}>
        {sprints.map(sp => {
          const sprintTasks = getContainerTasks(sp.id);
          const totalE = sprintTasks.reduce((a, t) => a + (t.estimate ?? 0), 0);
          const totalL = sprintTasks.reduce((a, t) => a + (t.logged ?? 0), 0);

          return (
            <Card key={sp.id} sx={{ borderRadius: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <CaretIcon/>
                <Box>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{sp.name}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                    {sp.startDate && new Date(sp.startDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                    {sp.startDate && sp.endDate && ' – '}
                    {sp.endDate && new Date(sp.endDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                    {' · '}{sprintTasks.length} tasků · {totalE}h plán / {totalL}h logged
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}/>
                <StatusBadge badgeColor={sprintColor(sp.state)} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10.5 }}>
                  {sprintLabel(sp.state)}
                </StatusBadge>
                {sp.state === 'PLANNED' && (
                  <Button size="small" variant="contained"
                    disabled={updateSprint.isPending}
                    onClick={() => updateSprint.mutate(
                      { id: sp.id, body: { state: 'ACTIVE' } },
                      { onSuccess: () => enqueueSnackbar(`Sprint "${sp.name}" aktivován`, { variant: 'success' }) },
                    )}>
                    Spustit sprint
                  </Button>
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
              </Box>
              {sp.state === 'ACTIVE' && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <SprintBurndownChart sprintId={sp.id} sprintName={sp.name} />
                </Box>
              )}
              <DroppableList id={sp.id}>
                <SortableContext items={sprintTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {sprintTasks.map((t, i) => (
                    <SortableRow key={t.id} task={t} onOpen={openTask} showEstimate
                      isLast={i === sprintTasks.length - 1}/>
                  ))}
                </SortableContext>
              </DroppableList>
            </Card>
          );
        })}

        <Card sx={{ borderRadius: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <CaretIcon/>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>Backlog</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>· {getContainerTasks(null).length} tasků</Typography>
          </Box>
          <DroppableList id="backlog">
            <SortableContext items={getContainerTasks(null).map(t => t.id)} strategy={verticalListSortingStrategy}>
              {getContainerTasks(null).map((t, i, arr) => (
                <SortableRow key={t.id} task={t} onOpen={openTask}
                  isLast={i === arr.length - 1}/>
              ))}
            </SortableContext>
          </DroppableList>
          <Box sx={{ p: 1.5, borderTop: getContainerTasks(null).length > 0 ? 1 : 0, borderColor: 'divider',
            display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small" placeholder="Název nového sprintu…" value={newSprintName}
              onChange={e => setNewSprintName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newSprintName.trim() && projectId) {
                  createSprint.mutate({ name: newSprintName.trim(), projectId },
                    { onSuccess: () => setNewSprintName('') });
                }
              }}
              sx={{ flex: 1, '& .MuiInputBase-root': { height: 30, fontSize: 12.5 } }}
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
          </Box>
        </Card>
      </Box>

      <DragOverlay>
        {activeTask && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.85,
            bgcolor: 'background.paper', border: 1, borderColor: 'primary.main',
            borderRadius: 0.5, boxShadow: 6 }}>
            <PriorityIcon priority={activeTask.priority}/>
            <TypeIcon type={activeTask.type} size={13}/>
            <MonoKey sx={{ minWidth: 60 }}>{activeTask.key}</MonoKey>
            <Typography sx={{ fontSize: 12.5, minWidth: 0,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 320 }}>
              {activeTask.title}
            </Typography>
          </Box>
        )}
      </DragOverlay>
    </DndContext>
  );
}

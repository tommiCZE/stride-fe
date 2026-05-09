import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Button, Card, Typography, useTheme } from '@mui/material';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCenter, useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TASKS, SPRINTS, getUser } from '../mocks/data';
import FluxAvatar from '../components/flux-avatar';
import TypeIcon from '../components/icons/type-icon';
import PriorityIcon from '../components/icons/priority-icon';
import { MonoKey, StatusBadge } from '../components/ui/ui';
import { CaretIcon } from '../components/icons/icons';
import type { Task } from '../types';

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
  task: Task;
  onOpen: (id: string) => void;
  showEstimate?: boolean;
  isLast?: boolean;
}

function SortableRow({ task: t, onOpen, showEstimate, isLast }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: t.id });

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
      <Box
        className="grip"
        {...attributes}
        {...listeners}
        sx={{
          opacity: 0, cursor: 'grab', pl: 1, pr: 0.25, py: 0.85,
          color: 'text.disabled', flexShrink: 0,
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <GripIcon />
      </Box>
      <Box
        onClick={() => !isDragging && onOpen(t.id)}
        sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.85, minWidth: 0, cursor: 'default' }}
      >
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
        <FluxAvatar user={t.assignee ? getUser(t.assignee) : undefined} size={18} />
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

  const sprints = SPRINTS.filter(s => s.project === projectId);
  const [tasks, setTasks] = useState<Task[]>(() =>
    TASKS.filter(t => t.project === projectId)
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const sprintColor = (state: string) =>
    state === 'active'    ? theme.palette.success.main
    : state === 'planned' ? theme.palette.primary.main
    : theme.palette.text.secondary;

  const sprintLabel = (state: string) =>
    state === 'active' ? 'Aktivní' : state === 'planned' ? 'Plánovaný' : 'Hotový';

  const getContainerTasks = (sprintId: string | null) =>
    sprintId === null
      ? tasks.filter(t => !t.sprint)
      : tasks.filter(t => t.sprint === sprintId);

  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(active.id as string);

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const overId = over.id as string;

    setTasks(prev => {
      const activeTask = prev.find(t => t.id === active.id);
      if (!activeTask) return prev;

      const overTask = prev.find(t => t.id === overId);
      const targetSprint = overTask
        ? (overTask.sprint ?? null)
        : overId === 'backlog' ? null : overId;

      const sourceSprint = activeTask.sprint ?? null;
      if (sourceSprint === targetSprint) return prev;

      return prev.map(t =>
        t.id === active.id
          ? { ...t, sprint: targetSprint === null ? undefined : targetSprint }
          : t
      );
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    setTasks(prev => {
      const activeTask = prev.find(t => t.id === active.id);
      const overTask = prev.find(t => t.id === over.id);
      if (!activeTask || !overTask) return prev;

      const activeSprint = activeTask.sprint ?? null;
      const overSprint = overTask.sprint ?? null;
      if (activeSprint !== overSprint) return prev;

      const bucket = activeSprint === null
        ? prev.filter(t => !t.sprint)
        : prev.filter(t => t.sprint === activeSprint);
      const rest = activeSprint === null
        ? prev.filter(t => t.sprint)
        : prev.filter(t => t.sprint !== activeSprint);

      const oldIdx = bucket.findIndex(t => t.id === active.id);
      const newIdx = bucket.findIndex(t => t.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return prev;

      return [...rest, ...arrayMove(bucket, oldIdx, newIdx)];
    });
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

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
                    {new Date(sp.start).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })} –{' '}
                    {new Date(sp.end).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })} · {sprintTasks.length} tasků · {totalE}h plán / {totalL}h logged
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}/>
                <StatusBadge badgeColor={sprintColor(sp.state)} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10.5 }}>
                  {sprintLabel(sp.state)}
                </StatusBadge>
                {sp.state === 'planned' && <Button size="small" variant="contained">Spustit sprint</Button>}
              </Box>
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

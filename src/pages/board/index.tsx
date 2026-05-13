import { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Button, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import {
  DndContext, DragOverlay, MeasuringStrategy,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useTasks, useUpdateTask } from '../../hooks/useTasks';
import { useSprints } from '../../hooks/useSprints';
import { useAuthStore } from '../../store/auth-store';
import { useUiStore } from '../../store/ui-store';
import { BOARD_STATUSES } from '../../constants/statuses';
import FluxAvatar from '../../components/flux-avatar';
import { SearchIcon, FilterIcon, BoardIcon, PlusIcon } from '../../components/icons/icons';
import Column from './column';
import { TaskCard } from './task-card';
import EmptyState from '../../components/empty-state/EmptyState';
import type { TaskSummaryDto } from '../../api/types';

export default function Board() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, setSearchParams] = useSearchParams();
  const openTask = (id: string) => setSearchParams({ task: id });
  const [search, setSearch] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  const [filterMine, setFilterMine] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState<TaskSummaryDto[] | null>(null);
  const openCreateModal = useUiStore(s => s.openCreateModal);

  const userId = useAuthStore(s => s.userId);
  const { data: remoteTasks = [] } = useTasks(projectId!);
  const { data: sprints = [] } = useSprints(projectId!);
  const updateTask = useUpdateTask(projectId);

  const tasks = localTasks ?? remoteTasks;

  const sprint = sprints.find(s => s.state === 'ACTIVE');

  const teamMembers = useMemo(() => {
    const seen = new Map<string, { id: string; color: string; initials: string; name: string }>();
    for (const t of tasks) {
      if (t.assigneeId && !seen.has(t.assigneeId)) {
        seen.set(t.assigneeId, {
          id: t.assigneeId,
          color: t.assigneeColor ?? '#94a3b8',
          initials: t.assigneeInitials ?? '?',
          name: t.assigneeName ?? '',
        });
      }
    }
    return [...seen.values()];
  }, [tasks]);

  const filtered = useMemo(() => tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.key.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterAssignee && t.assigneeId !== filterAssignee) return false;
    if (filterMine && t.assigneeId !== userId) return false;
    return true;
  }), [tasks, search, filterAssignee, filterMine, userId]);

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
    if (!localTasks) setLocalTasks([...remoteTasks]);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const dragged = tasks.find(t => t.id === active.id);
    if (!dragged) return;
    const overStatus = BOARD_STATUSES.find(s => s.id === over.id);
    const overTask = tasks.find(t => t.id === over.id);
    const targetStatus = overStatus?.id ?? overTask?.status;
    if (!targetStatus || targetStatus === dragged.status) return;
    setLocalTasks(prev => (prev ?? remoteTasks).map(t => t.id === active.id ? { ...t, status: targetStatus } : t));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) { setLocalTasks(null); return; }

    const dragged = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);

    if (dragged && overTask && dragged.status === overTask.status && active.id !== over.id) {
      setLocalTasks(prev => {
        const arr = prev ?? remoteTasks;
        const from = arr.findIndex(t => t.id === active.id);
        const to = arr.findIndex(t => t.id === over.id);
        return arrayMove(arr, from, to);
      });
    }

    if (dragged && dragged.status !== (remoteTasks.find(t => t.id === active.id)?.status)) {
      updateTask.mutate(
        { id: active.id as string, body: { status: dragged.status } },
        { onError: () => setLocalTasks(null) },
      );
    } else {
      setLocalTasks(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap',
        borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
        {sprint && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'success.main' }}>● {sprint.name}</Typography>
            {sprint.endDate && (
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                · {new Date(sprint.endDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
              </Typography>
            )}
          </Box>
        )}
        <Box sx={{ flex: 1 }}/>
        <TextField placeholder="Hledat…" value={search} onChange={e => setSearch(e.target.value)}
          sx={{ width: 160, '& .MuiOutlinedInput-root': { height: 26, fontSize: 12 } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}><SearchIcon/></InputAdornment> } }}/>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {teamMembers.map(u => (
            <Tooltip key={u.id} title={u.name}>
              <Box onClick={() => setFilterAssignee(filterAssignee === u.id ? null : u.id)}
                sx={{ opacity: filterAssignee && filterAssignee !== u.id ? 0.4 : 1, transition: '0.15s', cursor: 'default' }}>
                <FluxAvatar user={u} size={22} ring={filterAssignee === u.id}/>
              </Box>
            </Tooltip>
          ))}
        </Box>
        <Box onClick={() => setFilterMine(f => !f)}
          sx={{ px: 1, py: 0.4, borderRadius: 1, fontSize: 12, fontWeight: filterMine ? 600 : 400,
            bgcolor: filterMine ? 'primary.main' : 'action.hover',
            color: filterMine ? '#fff' : 'text.secondary', cursor: 'default' }}>
          Pouze moje
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.4, borderRadius: 1,
          fontSize: 12, color: 'text.secondary', bgcolor: 'action.hover', cursor: 'default' }}>
          <FilterIcon/> Filtry
        </Box>
      </Box>

      {tasks.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState
            icon={<BoardIcon />}
            title="Žádné úkoly v tomto sprintu"
            description="Začni přidáním prvního úkolu. Můžeš ho přetáhnout mezi sloupci podle jeho stavu."
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<PlusIcon />}
                onClick={openCreateModal}
              >
                Vytvořit první úkol
              </Button>
            }
          />
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', px: 2, py: 2,
          display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <DndContext sensors={sensors} collisionDetection={closestCorners}
            measuring={{ droppable: { strategy: MeasuringStrategy.WhileDragging } }}
            onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            {BOARD_STATUSES.map(s => (
              <Column key={s.id} status={s}
                tasks={filtered.filter(t => t.status === s.id)}
                onTaskClick={openTask}/>
            ))}
            <DragOverlay>
              {activeTask && <TaskCard task={activeTask} onClick={() => {}}/>}
            </DragOverlay>
          </DndContext>
        </Box>
      )}
    </Box>
  );
}

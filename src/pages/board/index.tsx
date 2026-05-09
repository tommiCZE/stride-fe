import { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import {
  DndContext, DragOverlay,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { TASKS, STATUSES, SPRINTS, getUser } from '../../mocks/data';
import FluxAvatar from '../../components/flux-avatar';
import { SearchIcon, FilterIcon } from '../../components/icons/icons';
import Column from './column';
import { TaskCard } from './task-card';
import type { Task } from '../../types';

export default function Board() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, setSearchParams] = useSearchParams();
  const openTask = (id: string) => setSearchParams({ task: id });
  const [search, setSearch] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  const [filterMine, setFilterMine] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(() => TASKS.filter(t => t.project === projectId));
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const sprint = SPRINTS.find(s => s.project === projectId && s.state === 'active');

  const teamMembers = useMemo(() => {
    const ids = new Set(tasks.map(t => t.assignee).filter(Boolean) as string[]);
    return [...ids].map(id => getUser(id)!);
  }, [tasks]);

  const filtered = useMemo(() => tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.key.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterAssignee && t.assignee !== filterAssignee) return false;
    if (filterMine && t.assignee !== 'u1') return false;
    return true;
  }), [tasks, search, filterAssignee, filterMine]);

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(active.id as string);

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const dragged = tasks.find(t => t.id === active.id);
    if (!dragged) return;
    const newStatus = STATUSES.find(s => s.id === over.id);
    if (newStatus && dragged.status !== newStatus.id) {
      setTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: newStatus.id } : t));
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap',
        borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
        {sprint && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'success.main' }}>● {sprint.name.split(' — ')[0]}</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
              · {new Date(sprint.end).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
            </Typography>
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

      <Box sx={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', px: 2, py: 2,
        display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <DndContext sensors={sensors} collisionDetection={closestCorners}
          onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          {STATUSES.map(s => (
            <Column key={s.id} statusId={s.id}
              tasks={filtered.filter(t => t.status === s.id)}
              onTaskClick={openTask}/>
          ))}
          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} onClick={() => {}} isDragging/>}
          </DragOverlay>
        </DndContext>
      </Box>
    </Box>
  );
}

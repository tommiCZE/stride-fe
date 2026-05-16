import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Box, Button, Divider, InputAdornment, ListItemIcon, ListItemText,
  Menu, MenuItem, TextField, Tooltip, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import {
  DndContext, DragOverlay, MeasuringStrategy,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useTasks, useUpdateTask } from '../../hooks/useTasks';
import { useSprints } from '../../hooks/useSprints';
import { useProjectByKey } from '../../hooks/useProjects';
import { useAuthStore } from '../../store/auth-store';
import { useUiStore } from '../../store/ui-store';
import { BOARD_STATUSES } from '../../constants/statuses';
import FluxAvatar from '../../components/flux-avatar';
import {
  SearchIcon, FilterIcon, BoardIcon, CaretIcon, StarIcon, PlusIcon, CloseIcon, CheckIcon,
} from '../../components/icons/icons';
import { useSavedFiltersStore } from '../../store/saved-filters-store';
import Column from './column';
import { TaskCard } from './task-card';
import SaveFilterDialog from './save-filter-dialog';
import EmptyState from '../../components/empty-state/EmptyState';
import QueryError from '../../components/query-error/QueryError';
import FilterBuilderDialog from '../../components/filter-builder/FilterBuilderDialog';
import {
  countRules,
  emptyGroup,
  evaluate as evaluateFilter,
  type FilterGroup,
} from '../../components/filter-builder/filter-evaluator';
import type { TaskSummaryDto } from '../../api/types';

const advancedFilterStorageKey = (projectId: string) => `stride-board-filter-${projectId}`;

function loadAdvancedFilter(projectId: string | undefined): FilterGroup {
  if (!projectId || typeof window === 'undefined') return emptyGroup('AND');
  try {
    const raw = window.localStorage.getItem(advancedFilterStorageKey(projectId));
    if (!raw) return emptyGroup('AND');
    const parsed = JSON.parse(raw) as FilterGroup;
    if (!parsed || !Array.isArray(parsed.rules)) return emptyGroup('AND');
    return parsed;
  } catch {
    return emptyGroup('AND');
  }
}

export default function Board() {
  const { projectKey } = useParams<{ projectKey: string }>();
  const { data: project } = useProjectByKey(projectKey);
  const projectId = project?.id;
  const [, setSearchParams] = useSearchParams();
  const openTask = (key: string) => setSearchParams({ task: key });
  const [search, setSearch] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  const [filterMine, setFilterMine] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState<TaskSummaryDto[] | null>(null);
  const openCreateModal = useUiStore(s => s.openCreateModal);

  const userId = useAuthStore(s => s.userId);
  const {
    data: remoteTasks = [],
    isError: tasksError,
    error: tasksErrorObj,
    refetch: refetchTasks,
  } = useTasks(projectId!);
  const { data: sprints = [] } = useSprints(projectId!);
  const updateTask = useUpdateTask(projectId);

  const { enqueueSnackbar } = useSnackbar();
  const savedFilters = useSavedFiltersStore(s => s.filters);
  const addSavedFilter = useSavedFiltersStore(s => s.addFilter);
  const removeSavedFilter = useSavedFiltersStore(s => s.removeFilter);

  const projectFilters = useMemo(
    () => savedFilters.filter(f => f.projectId === projectId),
    [savedFilters, projectId],
  );

  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [viewsAnchor, setViewsAnchor] = useState<HTMLElement | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [advancedFilter, setAdvancedFilter] = useState<FilterGroup>(() => loadAdvancedFilter(projectId));
  const [advancedDialogOpen, setAdvancedDialogOpen] = useState(false);

  // Reload from storage when project changes.
  useEffect(() => {
    setAdvancedFilter(loadAdvancedFilter(projectId));
  }, [projectId]);

  // Persist advanced filter to localStorage per project.
  useEffect(() => {
    if (!projectId || typeof window === 'undefined') return;
    try {
      const key = advancedFilterStorageKey(projectId);
      if (advancedFilter.rules.length === 0) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(advancedFilter));
      }
    } catch {
      // ignore quota / unavailable storage
    }
  }, [advancedFilter, projectId]);

  const advancedRuleCount = useMemo(() => countRules(advancedFilter), [advancedFilter]);

  const activeFilter = activeFilterId
    ? projectFilters.find(f => f.id === activeFilterId) ?? null
    : null;

  const closeViewsMenu = () => setViewsAnchor(null);

  const applySavedFilter = (id: string) => {
    const f = projectFilters.find(x => x.id === id);
    if (!f) return;
    setSearch(f.filters.search ?? '');
    setFilterAssignee(f.filters.assigneeId ?? null);
    setFilterMine(f.filters.mine ?? false);
    setActiveFilterId(f.id);
    closeViewsMenu();
  };

  const clearFilters = () => {
    setSearch('');
    setFilterAssignee(null);
    setFilterMine(false);
    setActiveFilterId(null);
    closeViewsMenu();
  };

  const handleSaveCurrent = (name: string) => {
    if (!projectId) return;
    const created = addSavedFilter(name, projectId, {
      search: search || undefined,
      assigneeId: filterAssignee,
      mine: filterMine,
    });
    setActiveFilterId(created.id);
    setSaveDialogOpen(false);
    enqueueSnackbar('Filtr uložen', { variant: 'success' });
  };

  const handleDeleteActive = () => {
    if (!activeFilter) return;
    removeSavedFilter(activeFilter.id);
    setActiveFilterId(null);
    closeViewsMenu();
    enqueueSnackbar('Filtr smazán', { variant: 'info' });
  };

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
    if (advancedRuleCount > 0 && !evaluateFilter(t, advancedFilter)) return false;
    return true;
  }), [tasks, search, filterAssignee, filterMine, userId, advancedFilter, advancedRuleCount]);

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
        <Button
          size="small"
          variant={advancedRuleCount > 0 ? 'contained' : 'text'}
          color={advancedRuleCount > 0 ? 'primary' : 'inherit'}
          startIcon={<FilterIcon/>}
          onClick={() => setAdvancedDialogOpen(true)}
          sx={{
            minHeight: 0,
            px: 1,
            py: 0.4,
            fontSize: 12,
            fontWeight: advancedRuleCount > 0 ? 600 : 400,
            color: advancedRuleCount > 0 ? 'primary.contrastText' : 'text.secondary',
            bgcolor: advancedRuleCount > 0 ? 'primary.main' : 'action.hover',
            '&:hover': {
              bgcolor: advancedRuleCount > 0 ? 'primary.dark' : 'action.selected',
            },
          }}
        >
          {advancedRuleCount > 0 ? `Filtry (${advancedRuleCount})` : 'Filtry'}
        </Button>
        <Tooltip title="Uložená zobrazení filtrů">
          <Box
            onClick={(e) => setViewsAnchor(e.currentTarget)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              px: 1, py: 0.4, borderRadius: 1,
              fontSize: 12, fontWeight: activeFilter ? 600 : 400,
              bgcolor: activeFilter ? 'primary.main' : 'action.hover',
              color: activeFilter ? 'primary.contrastText' : 'text.secondary',
              cursor: 'default', maxWidth: 180, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            <StarIcon/>
            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeFilter ? activeFilter.name : 'Uložená zobrazení'}
            </Box>
            <CaretIcon/>
          </Box>
        </Tooltip>

        <Menu
          anchorEl={viewsAnchor}
          open={!!viewsAnchor}
          onClose={closeViewsMenu}
          slotProps={{ paper: { sx: { minWidth: 240, mt: 0.5 } } }}
        >
          <MenuItem onClick={clearFilters} selected={!activeFilterId}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              {!activeFilterId ? <CheckIcon/> : <Box sx={{ width: 12 }}/>}
            </ListItemIcon>
            <ListItemText
              primary="Bez filtru"
              slotProps={{ primary: { sx: { fontSize: 13 } } }}
            />
          </MenuItem>

          {projectFilters.length > 0 && <Divider/>}

          {projectFilters.map(f => (
            <MenuItem
              key={f.id}
              onClick={() => applySavedFilter(f.id)}
              selected={activeFilterId === f.id}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                {activeFilterId === f.id ? <CheckIcon/> : <Box sx={{ width: 12 }}/>}
              </ListItemIcon>
              <ListItemText
                primary={f.name}
                slotProps={{ primary: { sx: { fontSize: 13 } } }}
              />
            </MenuItem>
          ))}

          <Divider/>

          <MenuItem onClick={() => { closeViewsMenu(); setSaveDialogOpen(true); }}>
            <ListItemIcon sx={{ minWidth: 28 }}><PlusIcon/></ListItemIcon>
            <ListItemText
              primary="Uložit aktuální filtr…"
              slotProps={{ primary: { sx: { fontSize: 13 } } }}
            />
          </MenuItem>

          {activeFilter && (
            <MenuItem onClick={handleDeleteActive} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ minWidth: 28, color: 'error.main' }}><CloseIcon/></ListItemIcon>
              <ListItemText
                primary="Smazat tento filtr"
                slotProps={{ primary: { sx: { fontSize: 13 } } }}
              />
            </MenuItem>
          )}
        </Menu>
      </Box>

      <SaveFilterDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveCurrent}
      />

      <FilterBuilderDialog
        open={advancedDialogOpen}
        initialValue={advancedFilter}
        onClose={() => setAdvancedDialogOpen(false)}
        onApply={(group) => {
          setAdvancedFilter(group);
          setAdvancedDialogOpen(false);
        }}
      />

      {tasksError ? (
        <QueryError error={tasksErrorObj} onRetry={() => { void refetchTasks(); }} />
      ) : tasks.length === 0 ? (
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

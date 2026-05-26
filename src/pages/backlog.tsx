import { Fragment, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Button, Card, Chip, Stack, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
import { MonoKey } from '../components/ui/ui';
import { CaretIcon, BacklogIcon, PlusIcon } from '../components/icons/icons';
import EmptyState from '../components/empty-state/EmptyState';
import QueryError from '../components/query-error/QueryError';
import StatusBreakdown from '../components/status-breakdown';
import { taskLinkProps } from '../utils/task-link';
import {
  applyFilter, applySort,
  type QuickChip, type SortBy,
} from '../utils/backlog-filter';
import {
  groupTasks, type GroupBy, type GroupSection,
} from '../utils/backlog-group';
import BacklogToolbar from '../components/backlog-toolbar';
import { useAuthStore } from '../store/auth-store';
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

function formatDateRange(start: string | null, end: string | null) {
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return fmt(start ?? end ?? '');
}

function daysBetween(end: string | null) {
  if (!end) return 0;
  return Math.max(0, Math.ceil((new Date(end).getTime() - Date.now()) / 86_400_000));
}

function czechDaysPlural(n: number) {
  if (n === 1) return 'den';
  if (n >= 2 && n <= 4) return 'dny';
  return 'dní';
}

function SprintStateBadge({ state, daysRemaining }: { state: string; daysRemaining: number }) {
  if (state === 'ACTIVE') {
    return (
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.6,
        px: 1.2, py: 0.3, borderRadius: 999,
        bgcolor: 'rgba(16,185,129,0.10)', color: 'success.dark',
        border: '1px solid rgba(16,185,129,0.30)',
        fontSize: 11, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap',
      }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }}/>
        Aktivní · {daysRemaining} {czechDaysPlural(daysRemaining)} zbývá
      </Box>
    );
  }
  if (state === 'PLANNED') {
    return (
      <Box sx={{
        display: 'inline-flex', alignItems: 'center',
        px: 1.2, py: 0.3, borderRadius: 999,
        bgcolor: 'background.paper', color: 'text.secondary',
        border: 1, borderColor: 'divider',
        fontSize: 11, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap',
      }}>
        Plánovaný
      </Box>
    );
  }
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.6,
      px: 1.2, py: 0.3, borderRadius: 999,
      bgcolor: 'action.hover', color: 'text.disabled',
      fontSize: 11, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap',
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.disabled' }}/>
      Hotový
    </Box>
  );
}

function SprintMeta({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline' }}>
      <Typography sx={{ fontSize: 11, color: 'text.disabled', textTransform: 'lowercase' }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: 12, fontWeight: 600,
        color: valueColor ?? 'text.primary',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </Typography>
    </Stack>
  );
}

interface RowProps {
  task: TaskSummaryDto;
  onOpen: (key: string) => void;
  showEstimate?: boolean;
  showStatus?: boolean;
  isLast?: boolean;
}

const STATUS_PILL: Record<string, { bg: string; fg: string; label: string }> = {
  TODO:        { bg: 'action.hover',         fg: 'text.secondary', label: 'todo' },
  IN_PROGRESS: { bg: 'rgba(14,165,233,0.10)', fg: '#075985',       label: 'v práci' },
  REVIEW:      { bg: 'rgba(168,85,247,0.10)', fg: '#6b21a8',       label: 'review' },
  DONE:        { bg: 'rgba(16,185,129,0.10)', fg: 'success.dark',  label: 'done' },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_PILL[status] ?? STATUS_PILL.TODO;
  return (
    <Box sx={{
      fontSize: 10.5, fontWeight: 600,
      px: 0.9, py: 0.15, borderRadius: 999,
      bgcolor: s.bg, color: s.fg,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {s.label}
    </Box>
  );
}

function SortableRow({ task: t, onOpen, showEstimate, showStatus, isLast }: RowProps) {
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
        '&:hover .grip': { opacity: 0.8 },
      }}
    >
      <Box className="grip" {...attributes} {...listeners}
        sx={{ opacity: 0.35, cursor: 'grab', transition: 'opacity 0.12s',
          pl: 1, pr: 0.25, py: 1.1,
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
        sx={{ flex: 1, alignItems: 'center', px: 1, py: 1.1, minWidth: 0, cursor: 'default',
          textDecoration: 'none', color: 'text.primary' }}>
        <PriorityIcon priority={t.priority} />
        <TypeIcon type={t.type} size={13} />
        <MonoKey sx={{ minWidth: 60, fontSize: 11 }}>{t.key}</MonoKey>
        <Typography sx={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 500,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {t.title}
        </Typography>
        {showStatus && <StatusPill status={t.status}/>}
        {showEstimate && (
          <Box sx={{
            border: 1, borderColor: 'divider', borderRadius: 1,
            px: 0.8, py: 0.1, minWidth: 28, textAlign: 'center',
            fontSize: 11, fontWeight: 600, color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums', flexShrink: 0,
          }}>
            {t.estimate ?? '—'}
          </Box>
        )}
        <FluxAvatar user={assignee} size={20} />
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

const GROUP_TONE_COLOR: Record<string, string> = {
  success: 'success.dark',
  warning: 'warning.dark',
  info:    'info.dark',
  danger:  'error.dark',
  neutral: 'text.secondary',
};

function GroupSectionHeader({
  section, collapsed, onToggle, collapsible = true,
}: {
  section: GroupSection;
  collapsed: boolean;
  onToggle: () => void;
  collapsible?: boolean;
}) {
  const toneColor = section.tone ? GROUP_TONE_COLOR[section.tone] : 'text.secondary';
  return (
    <Stack
      direction="row" spacing={0.75}
      onClick={collapsible ? onToggle : undefined}
      sx={{
        alignItems: 'center', px: 1.5, py: 0.85,
        cursor: collapsible ? 'default' : 'auto',
        bgcolor: 'background.default',
        borderBottom: 1, borderColor: 'divider',
        userSelect: 'none',
        ...(collapsible && { '&:hover': { bgcolor: 'action.hover' } }),
      }}
    >
      {collapsible && (
        <Box sx={{
          display: 'inline-flex',
          transform: collapsed ? 'rotate(-90deg)' : 'none',
          transition: 'transform 0.15s',
          color: 'text.disabled',
        }}>
          <CaretIcon/>
        </Box>
      )}
      <Typography sx={{
        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: toneColor,
      }}>
        {section.label}
      </Typography>
      <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
        · {section.tasks.length}
      </Typography>
      {section.hint && (
        <Typography sx={{ ml: 0.5, fontSize: 10.5, color: 'text.disabled' }}>
          — {section.hint}
        </Typography>
      )}
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

const QUICK_CHIP_IDS = ['all', 'mine', 'bugs', 'no-estimate', 'overdue'] as const;
const GROUP_IDS = ['readiness', 'priority', 'status', 'none'] as const;
const SORT_IDS = ['manual', 'priority', 'updated', 'created', 'estimate'] as const;
const isQuickChip = (v: string | null): v is QuickChip => !!v && (QUICK_CHIP_IDS as readonly string[]).includes(v);
const isGroupBy = (v: string | null): v is GroupBy => !!v && (GROUP_IDS as readonly string[]).includes(v);
const isSortBy = (v: string | null): v is SortBy => !!v && (SORT_IDS as readonly string[]).includes(v);

export default function Backlog() {
  const { projectKey } = useParams<{ projectKey: string }>();
  const { data: project } = useProjectByKey(projectKey);
  const projectId = project?.id;
  const [searchParams, setSearchParams] = useSearchParams();
  const openTask = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('task', key);
    setSearchParams(next);
  };
  const theme = useTheme();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const currentUserId = useAuthStore(s => s.userId);

  const quickChip: QuickChip = isQuickChip(searchParams.get('filter')) ? (searchParams.get('filter') as QuickChip) : 'all';
  const groupBy: GroupBy   = isGroupBy(searchParams.get('group')) ? (searchParams.get('group') as GroupBy) : 'readiness';
  const sortBy: SortBy     = isSortBy(searchParams.get('sort')) ? (searchParams.get('sort') as SortBy) : 'priority';
  const search = searchParams.get('q') ?? '';

  const updateParam = (key: string, value: string | null, defaultValue: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };
  const setQuickChip = (v: QuickChip) => updateParam('filter', v, 'all');
  const setGroupBy   = (v: GroupBy)   => updateParam('group',  v, 'readiness');
  const setSortBy    = (v: SortBy)    => updateParam('sort',   v, 'priority');
  const setSearch    = (v: string)    => updateParam('q',      v, '');

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

  const collapsedKey = projectId ? `stride.backlog.${projectId}.collapsed` : null;
  const [collapsedSections, setCollapsedSections] = useState<string[]>(['ICEBOX']);
  useEffect(() => {
    if (!collapsedKey) return;
    try {
      const raw = window.localStorage.getItem(collapsedKey);
      if (raw) setCollapsedSections(JSON.parse(raw) as string[]);
    } catch { /* ignore parse errors */ }
  }, [collapsedKey]);
  useEffect(() => {
    if (!collapsedKey) return;
    try { window.localStorage.setItem(collapsedKey, JSON.stringify(collapsedSections)); }
    catch { /* ignore quota errors */ }
  }, [collapsedKey, collapsedSections]);
  const toggleSection = (key: string) => {
    setCollapsedSections(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
      if (activeTask.sprintId === null && sortBy !== 'manual') {
        const previousSort = sortBy;
        setSortBy('manual');
        enqueueSnackbar('Pořadí backlogu uloženo. Sort přepnut na Manual.', {
          variant: 'info',
          action: (key) => (
            <Button color="inherit" size="small"
              onClick={() => { setSortBy(previousSort); closeSnackbar(key); }}>
              Undo
            </Button>
          ),
        });
      }
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
  const backlogTotalEstimate = backlogTasks.reduce((a, t) => a + (t.estimate ?? 0), 0);
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
          const isActive = sp.state === 'ACTIVE';
          const progress = Math.min(100, totalE > 0 ? (totalL / totalE) * 100 : 0);
          const daysRemaining = daysBetween(sp.endDate);

          const actionButton =
            sp.state === 'PLANNED' ? (
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
            ) : sp.state === 'ACTIVE' ? (
              <Button size="small" variant="contained"
                sx={{ bgcolor: 'text.primary', color: 'background.paper',
                  '&:hover': { bgcolor: 'text.primary', opacity: 0.9 } }}
                disabled={updateSprint.isPending}
                onClick={() => updateSprint.mutate(
                  { id: sp.id, body: { state: 'COMPLETED' } },
                  { onSuccess: () => enqueueSnackbar(`Sprint "${sp.name}" dokončen`, { variant: 'success' }) },
                )}>
                Dokončit sprint
              </Button>
            ) : null;

          if (sprintTasks.length === 0) {
            return (
              <Card key={sp.id} sx={{
                borderRadius: 1.5,
                ...(isActive && {
                  borderColor: 'rgba(16,185,129,0.30)',
                  boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 0 0 4px rgba(16,185,129,0.06)',
                }),
              }}>
                <DroppableList id={sp.id}>
                  <Stack direction="row" spacing={1.25} sx={{ p: 1.25, alignItems: 'center' }}>
                    <Stack sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>
                        {sp.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Přetáhni tasky z backlogu
                      </Typography>
                    </Stack>
                    <Box sx={{ flex: 1 }}/>
                    <Chip label="Prázdný" size="small" variant="outlined"/>
                    <SprintStateBadge state={sp.state} daysRemaining={daysRemaining}/>
                    {actionButton}
                  </Stack>
                </DroppableList>
              </Card>
            );
          }

          return (
            <Card key={sp.id} sx={{
              borderRadius: 1.5,
              overflow: 'hidden',
              ...(isActive && {
                borderColor: 'rgba(16,185,129,0.30)',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 0 0 4px rgba(16,185,129,0.06)',
              }),
            }}>
              {isActive && (
                <Box sx={{
                  height: 3,
                  background: `linear-gradient(90deg, ${theme.palette.success.main} ${progress}%, ${alpha(theme.palette.success.main, 0.15)} ${progress}%)`,
                }}/>
              )}
              <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>
                    {sp.name}
                  </Typography>
                  <SprintStateBadge state={sp.state} daysRemaining={daysRemaining}/>
                  <Box sx={{ flex: 1 }}/>
                  {actionButton}
                </Stack>
                <Stack direction="row" spacing={2.5} sx={{ mt: 0.6, alignItems: 'baseline', flexWrap: 'wrap', rowGap: 0.6 }}>
                  {(sp.startDate || sp.endDate) && (
                    <SprintMeta label="datum" value={formatDateRange(sp.startDate, sp.endDate)}/>
                  )}
                  <SprintMeta label="tasků" value={sprintTasks.length}/>
                  <SprintMeta label="est" value={`${totalE}h`}/>
                  <SprintMeta label="logged" value={`${totalL}h`}
                    valueColor={totalE > 0 && totalL >= totalE ? 'success.dark' : undefined}/>
                </Stack>
                {sprintTasks.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <StatusBreakdown tasks={sprintTasks} width={180}/>
                  </Box>
                )}
              </Box>
              <DroppableList id={sp.id}>
                <SortableContext items={sprintTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {sprintTasks.map((t, i) => (
                    <SortableRow key={t.id} task={t} onOpen={openTask} showEstimate showStatus
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
          <BacklogToolbar
            count={backlogTasks.length}
            totalEstimate={backlogTotalEstimate}
            search={search}
            onSearchChange={setSearch}
            quickChip={quickChip}
            onQuickChipChange={setQuickChip}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />
          {(() => {
            const filtered = applyFilter(backlogTasks, quickChip, currentUserId, search);
            const sorted = applySort(filtered, sortBy);
            const sections = groupTasks(sorted, groupBy);
            const isCollapsed = (s: GroupSection) =>
              s.collapsible && collapsedSections.includes(s.key);
            const displayedTasks: TaskSummaryDto[] = [];
            for (const s of sections) if (!isCollapsed(s)) displayedTasks.push(...s.tasks);
            return (
              <DroppableList id="backlog">
                <SortableContext items={displayedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {sections.map(s => {
                    const collapsed = isCollapsed(s);
                    const showHeader = s.label.length > 0;
                    return (
                      <Fragment key={s.key}>
                        {showHeader && (
                          <GroupSectionHeader
                            section={s}
                            collapsed={collapsed}
                            collapsible={s.collapsible}
                            onToggle={() => toggleSection(s.key)}
                          />
                        )}
                        {!collapsed && s.tasks.map((t, i) => (
                          <SortableRow key={t.id} task={t} onOpen={openTask}
                            isLast={i === s.tasks.length - 1}/>
                        ))}
                      </Fragment>
                    );
                  })}
                </SortableContext>
              </DroppableList>
            );
          })()}
          {projectId && (
            <Box sx={{ borderTop: backlogTasks.length > 0 ? 1 : 0, borderColor: 'divider' }}>
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

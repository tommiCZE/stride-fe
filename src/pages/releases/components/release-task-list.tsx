import { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Checkbox, CircularProgress, ListItemIcon, ListItemText,
  Menu, MenuItem, Stack, Typography,
} from '@mui/material';
import { useReleaseTasks } from '../../../hooks/useReleases';
import { BOARD_STATUSES } from '../../../constants/statuses';
import { PRIORITIES } from '../../../constants/priorities';
import { TASK_TYPES } from '../../../constants/taskTypes';
import { PlusIcon, CaretIcon } from '../../../components/icons/icons';
import dayjs from 'dayjs';
import type { TaskSummaryDto } from '../../../api/types';
import TaskGroupHeader from './task-group-header';
import ReleaseTaskRow from './release-task-row';

export type ReleaseGroupBy = 'status' | 'type' | 'priority' | 'assignee';

interface Props {
  releaseId: string;
  groupBy: ReleaseGroupBy;
  onChangeGroupBy: (g: ReleaseGroupBy) => void;
  hiddenStatuses: Set<string>;
  onChangeHiddenStatuses: (h: Set<string>) => void;
  onAddTasks: () => void;
  onOpenTask?: (key: string) => void;
}

interface Group {
  key: string;
  title: string;
  color: string;
  droppableId?: string;
  context?: string;
  defaultCollapsed?: boolean;
  tasks: TaskSummaryDto[];
}

const GROUP_BY_LABELS: Record<ReleaseGroupBy, string> = {
  status: 'Status',
  type: 'Typ',
  priority: 'Priorita',
  assignee: 'Assignee',
};

const PAGE_INITIAL = 30;
const PAGE_STEP = 15;

function statusColor(id: string): string {
  return BOARD_STATUSES.find(s => s.id === id)?.color ?? '#94a3b8';
}

function avgDaysSinceUpdate(tasks: TaskSummaryDto[]): number {
  if (tasks.length === 0) return 0;
  const total = tasks.reduce((acc, t) => acc + dayjs().diff(dayjs(t.updatedAt), 'day'), 0);
  return Math.round(total / tasks.length);
}

function maxDaysSinceUpdate(tasks: TaskSummaryDto[]): number {
  if (tasks.length === 0) return 0;
  return Math.max(...tasks.map(t => dayjs().diff(dayjs(t.updatedAt), 'day')));
}

function buildGroupsByStatus(releaseId: string, tasks: TaskSummaryDto[]): Group[] {
  const blockers = tasks.filter(t => t.priority === 'URGENT' && t.status !== 'DONE');
  const blockerIds = new Set(blockers.map(t => t.id));
  const rest = tasks.filter(t => !blockerIds.has(t.id));

  const review = rest.filter(t => t.status === 'IN_REVIEW');
  const inProgress = rest.filter(t => t.status === 'IN_PROGRESS');
  const todo = rest.filter(t => t.status === 'TODO');
  const done = rest.filter(t => t.status === 'DONE');

  const groups: Group[] = [];
  if (blockers.length > 0) {
    groups.push({
      key: 'blockers',
      title: '⚠ Blokátory',
      color: '#dc2626',
      tasks: blockers,
    });
  }
  groups.push({
    key: 'review',
    title: '● V Review · testování',
    color: statusColor('IN_REVIEW'),
    droppableId: `r:${releaseId}:status:IN_REVIEW`,
    context: review.length > 0 ? `předáno QA · ${maxDaysSinceUpdate(review)} dnů` : undefined,
    tasks: review,
  });
  groups.push({
    key: 'inProgress',
    title: '● Rozpracované',
    color: statusColor('IN_PROGRESS'),
    droppableId: `r:${releaseId}:status:IN_PROGRESS`,
    context: inProgress.length > 0 ? `průměr ${avgDaysSinceUpdate(inProgress)} dnů in-progress` : undefined,
    tasks: inProgress,
  });
  groups.push({
    key: 'todo',
    title: '○ Ještě nezačaté',
    color: '#64748b',
    droppableId: `r:${releaseId}:status:TODO`,
    context: todo.length > 0
      ? `${todo.filter(t => !t.assigneeId).length} bez assignee · ${todo.reduce((a, t) => a + (t.estimate ?? 0), 0)}h estimováno`
      : undefined,
    tasks: todo,
  });
  if (done.length > 0) {
    groups.push({
      key: 'done',
      title: '✓ Hotové',
      color: statusColor('DONE'),
      droppableId: `r:${releaseId}:status:DONE`,
      defaultCollapsed: true,
      tasks: done,
    });
  }
  return groups;
}

function buildGroupsByType(tasks: TaskSummaryDto[]): Group[] {
  return TASK_TYPES.map(type => ({
    key: `type:${type.id}`,
    title: type.name,
    color: type.color,
    tasks: tasks.filter(t => t.type === type.id),
  })).filter(g => g.tasks.length > 0);
}

function buildGroupsByPriority(tasks: TaskSummaryDto[]): Group[] {
  return PRIORITIES.map(p => ({
    key: `pri:${p.id}`,
    title: p.name,
    color: p.color,
    tasks: tasks.filter(t => t.priority === p.id),
  })).filter(g => g.tasks.length > 0);
}

function buildGroupsByAssignee(tasks: TaskSummaryDto[]): Group[] {
  const map = new Map<string, { name: string; color: string; tasks: TaskSummaryDto[] }>();
  for (const t of tasks) {
    const id = t.assigneeId ?? '__none__';
    const name = t.assigneeName ?? 'Bez assignee';
    const color = t.assigneeColor ?? '#94a3b8';
    if (!map.has(id)) map.set(id, { name, color, tasks: [] });
    map.get(id)!.tasks.push(t);
  }
  const arr = [...map.entries()].sort(([a], [b]) => {
    if (a === '__none__') return 1;
    if (b === '__none__') return -1;
    return map.get(a)!.name.localeCompare(map.get(b)!.name);
  });
  return arr.map(([key, v]) => ({
    key: `asg:${key}`,
    title: v.name,
    color: v.color,
    tasks: v.tasks,
  }));
}

export default function ReleaseTaskList({
  releaseId, groupBy, onChangeGroupBy,
  hiddenStatuses, onChangeHiddenStatuses,
  onAddTasks, onOpenTask,
}: Props) {
  const { data: tasks = [], isLoading } = useReleaseTasks(releaseId);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [hiddenAnchor, setHiddenAnchor] = useState<HTMLElement | null>(null);
  const [groupByAnchor, setGroupByAnchor] = useState<HTMLElement | null>(null);
  const [visibleLimit, setVisibleLimit] = useState(PAGE_INITIAL);

  const filteredTasks = useMemo(
    () => tasks.filter(t => !hiddenStatuses.has(t.status)),
    [tasks, hiddenStatuses],
  );

  const groups = useMemo<Group[]>(() => {
    if (groupBy === 'status')   return buildGroupsByStatus(releaseId, filteredTasks);
    if (groupBy === 'type')     return buildGroupsByType(filteredTasks);
    if (groupBy === 'priority') return buildGroupsByPriority(filteredTasks);
    return buildGroupsByAssignee(filteredTasks);
  }, [releaseId, groupBy, filteredTasks]);

  useEffect(() => { setVisibleLimit(PAGE_INITIAL); }, [groupBy, hiddenStatuses, releaseId]);

  const toggleHidden = (statusId: string) => {
    const next = new Set(hiddenStatuses);
    if (next.has(statusId)) next.delete(statusId);
    else next.add(statusId);
    onChangeHiddenStatuses(next);
  };

  const toggleCollapsed = (key: string) =>
    setCollapsed(prev => ({ ...prev, [key]: !(prev[key] ?? false) }));

  const isCollapsed = (g: Group) =>
    collapsed[g.key] ?? g.defaultCollapsed ?? false;

  let consumed = 0;
  const totalVisibleTasks = groups.reduce((a, g) => a + g.tasks.length, 0);

  if (isLoading) {
    return (
      <Stack spacing={1} sx={{ py: 2 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <Box key={i} sx={{
            height: 24, mx: 2.25, borderRadius: 0.75, bgcolor: 'action.hover',
            opacity: 1 - i * 0.15,
          }}/>
        ))}
        <Stack direction="row" sx={{ justifyContent: 'center', pt: 0.5 }}>
          <CircularProgress size={14}/>
        </Stack>
      </Stack>
    );
  }

  if (tasks.length === 0) {
    return (
      <Stack spacing={1.25} sx={{ alignItems: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Tato verze zatím nemá žádné tasky.
        </Typography>
        <Button size="small" variant="outlined" startIcon={<PlusIcon/>} onClick={onAddTasks}>
          Přidat task
        </Button>
      </Stack>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{
        alignItems: 'center', px: 2.25, py: 1,
        borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default',
        position: 'sticky', top: 0, zIndex: 1,
      }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
          Tasky · {filteredTasks.length}
        </Typography>
        <Box sx={{ flex: 1 }}/>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Grupuj dle:</Typography>
        <Button
          size="small" variant="outlined"
          onClick={(e) => setGroupByAnchor(e.currentTarget)}
          endIcon={<CaretIcon/>}
          sx={{ fontSize: 12, py: 0.25, px: 0.75, minHeight: 24 }}
        >
          {GROUP_BY_LABELS[groupBy]}
        </Button>
        <Menu
          anchorEl={groupByAnchor}
          open={!!groupByAnchor}
          onClose={() => setGroupByAnchor(null)}
        >
          {(Object.keys(GROUP_BY_LABELS) as ReleaseGroupBy[]).map(g => (
            <MenuItem
              key={g} selected={g === groupBy}
              onClick={() => { onChangeGroupBy(g); setGroupByAnchor(null); }}
            >
              <ListItemText
                primary={GROUP_BY_LABELS[g]}
                slotProps={{ primary: { sx: { fontSize: 13 } } }}
              />
            </MenuItem>
          ))}
        </Menu>
        <Button
          size="small" variant="text" color="inherit"
          onClick={(e) => setHiddenAnchor(e.currentTarget)}
          endIcon={<CaretIcon/>}
          sx={{ fontSize: 12, py: 0.25, px: 0.75, minHeight: 24, color: 'text.secondary' }}
        >
          {hiddenStatuses.size === 0
            ? 'Skrýt: nic'
            : `Skrýt: ${[...hiddenStatuses].map(s => BOARD_STATUSES.find(b => b.id === s)?.name ?? s).join(', ')}`}
        </Button>
        <Menu
          anchorEl={hiddenAnchor}
          open={!!hiddenAnchor}
          onClose={() => setHiddenAnchor(null)}
        >
          {BOARD_STATUSES.map(s => (
            <MenuItem key={s.id} onClick={() => toggleHidden(s.id)}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <Checkbox
                  size="small"
                  checked={hiddenStatuses.has(s.id)}
                  sx={{ p: 0 }}
                />
              </ListItemIcon>
              <ListItemText
                primary={s.name}
                slotProps={{ primary: { sx: { fontSize: 13 } } }}
              />
            </MenuItem>
          ))}
        </Menu>
        <Button
          size="small" variant="contained" startIcon={<PlusIcon/>}
          onClick={onAddTasks}
          sx={{ minHeight: 24, py: 0.25, fontSize: 12 }}
        >
          Přidat task
        </Button>
      </Stack>

      {groups.map(g => {
        if (g.tasks.length === 0 && !g.droppableId) return null;
        const cellCollapsed = isCollapsed(g);
        const tasksLeft = visibleLimit - consumed;
        const tasksToShow = cellCollapsed ? [] : g.tasks.slice(0, Math.max(0, tasksLeft));
        if (!cellCollapsed) consumed += tasksToShow.length;

        const headerTitle = cellCollapsed && g.key === 'done'
          ? `✓ Zobrazit ${g.tasks.length} dokončené`
          : g.title;

        return (
          <Box key={g.key}>
            <TaskGroupHeader
              droppableId={g.droppableId}
              title={headerTitle}
              count={g.tasks.length}
              color={g.color}
              context={g.context}
              collapsible={g.key === 'done' || g.defaultCollapsed === true}
              collapsed={cellCollapsed}
              onToggle={() => toggleCollapsed(g.key)}
            />
            {!cellCollapsed && (
              <Box>
                {tasksToShow.map(t => (
                  <ReleaseTaskRow
                    key={t.id}
                    task={t}
                    draggableId={`t:${releaseId}:${t.id}`}
                    onOpen={onOpenTask}
                  />
                ))}
              </Box>
            )}
          </Box>
        );
      })}

      {totalVisibleTasks > visibleLimit && (
        <Stack direction="row" sx={{ justifyContent: 'center', py: 1.25, borderTop: 1, borderColor: 'divider' }}>
          <Button
            size="small" variant="text"
            onClick={() => setVisibleLimit(l => l + PAGE_STEP)}
          >
            Zobrazit dalších {Math.min(PAGE_STEP, totalVisibleTasks - visibleLimit)} →
          </Button>
        </Stack>
      )}
    </Box>
  );
}

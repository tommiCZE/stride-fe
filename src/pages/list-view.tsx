import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Checkbox, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import Papa from 'papaparse';
import { useSnackbar } from 'notistack';
import { useTasksPaginated } from '../hooks/useTasksPaginated';
import { useProjects, useProjectByKey } from '../hooks/useProjects';
import { BOARD_STATUSES } from '../constants/statuses';
import FluxAvatar from '../components/flux-avatar';
import TypeIcon from '../components/icons/type-icon';
import PriorityIcon from '../components/icons/priority-icon';
import { MonoKey, StatusBadge, ColorDot } from '../components/ui/ui';
import FilterChip from '../components/ui/filter-chip';
import { FilterIcon, ListIcon, PlusIcon, DownloadIcon } from '../components/icons/icons';
import EmptyState from '../components/empty-state/EmptyState';
import QueryError from '../components/query-error/QueryError';
import { useUiStore } from '../store/ui-store';
import { taskLinkProps } from '../utils/task-link';
import ListViewBulkToolbar from './list-view-bulk-toolbar';

const SELECT_COL_W = 32;

const COLS = [
  { key: 'key',      label: 'Key',      w: 84 },
  { key: 'type',     label: 'T',        w: 28 },
  { key: 'priority', label: 'P',        w: 28 },
  { key: 'title',    label: 'Title',    flex: 1 },
  { key: 'assignee', label: 'Assignee', w: 130 },
  { key: 'status',   label: 'Status',   w: 110 },
  { key: 'estimate', label: 'Est',      w: 50 },
  { key: 'logged',   label: 'Logged',   w: 70 },
  { key: 'due',      label: 'Due',      w: 80 },
] as const;

export default function ListView() {
  const { projectKey } = useParams<{ projectKey: string }>();
  const { data: project } = useProjectByKey(projectKey);
  const projectId = project?.id;
  const [, setSearchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const openTask = (key: string) => setSearchParams({ task: key });
  const {
    data,
    isError: tasksError,
    error: tasksErrorObj,
    refetch: refetchTasks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTasksPaginated(projectId!);
  const tasks = useMemo(
    () => (data?.pages ?? []).flatMap(p => p.items),
    [data],
  );
  const { data: projects = [] } = useProjects();
  const openCreateModal = useUiStore(s => s.openCreateModal);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);
  const allSelected = taskIds.length > 0 && taskIds.every(id => selectedIds.has(id));
  const someSelected = !allSelected && taskIds.some(id => selectedIds.has(id));

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(prev => {
      if (taskIds.every(id => prev.has(id))) return new Set();
      return new Set(taskIds);
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (!hasNextPage) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting) && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, tasks.length]);

  if (tasksError) {
    return (
      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper', height: '100%' }}>
        <QueryError error={tasksErrorObj} onRetry={() => { void refetchTasks(); }} />
      </Stack>
    );
  }

  if (data && tasks.length === 0) {
    return (
      <Stack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper', height: '100%' }}>
        <EmptyState
          icon={<ListIcon />}
          title="Žádné úkoly"
          description="V tomto projektu zatím nejsou žádné úkoly. Vytvoř první a začni sledovat práci."
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<PlusIcon />}
              onClick={openCreateModal}
            >
              Vytvořit úkol
            </Button>
          }
        />
      </Stack>
    );
  }

  const handleExportCsv = () => {
    if (tasks.length === 0) return;
    const rows = tasks.map(t => ({
      'Klíč': t.key,
      'Typ': t.type,
      'Priorita': t.priority,
      'Název': t.title,
      'Přiřazeno': t.assigneeName ?? '',
      'Status': BOARD_STATUSES.find(s => s.id === t.status)?.name ?? t.status,
      'Odhad': t.estimate ?? '',
      'Logged': t.logged,
      'Due date': t.dueDate ?? '',
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const projectKey = projects.find(p => p.id === projectId)?.key ?? projectId ?? 'export';
    const date = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stride-tasks-${projectKey}-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    enqueueSnackbar('Export hotov', { variant: 'success' });
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper', height: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider',
        position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
        <TextField placeholder="Filtr…" size="small"
          sx={{ width: 200, '& .MuiOutlinedInput-root': { height: 26, fontSize: '14px' } }}/>
        <FilterChip label="Filtry" icon={<FilterIcon/>} onClick={() => {}}/>
        <Button size="small" variant="outlined" startIcon={<DownloadIcon/>}
          onClick={handleExportCsv} disabled={tasks.length === 0}>Export</Button>
        <Box sx={{ flex: 1 }}/>
        <Typography variant="caption" color="text.secondary">{tasks.length} tasků</Typography>
      </Stack>

      {projectId && (
        <ListViewBulkToolbar
          projectId={projectId}
          selectedIds={Array.from(selectedIds)}
          onClear={clearSelection}
        />
      )}

      <Box sx={{ minWidth: 900 }}>
        <Stack direction="row" sx={{ alignItems: 'center', px: 1.5, py: 0.75, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary',
          borderBottom: 1, borderColor: 'divider', position: 'sticky',
          top: selectedIds.size > 0 ? 86 : 43,
          bgcolor: 'background.paper', zIndex: 1 }}>
          <Stack sx={{ width: SELECT_COL_W, alignItems: 'center', justifyContent: 'center' }}>
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleAll}
              aria-label="Vybrat všechny úkoly"
              sx={{ p: 0 }}
            />
          </Stack>
          {COLS.map(c => (
            <Box key={c.key} sx={{ width: 'w' in c ? c.w : undefined, flex: 'flex' in c ? c.flex : undefined, px: 0.5 }}>{c.label}</Box>
          ))}
        </Stack>

        {tasks.map(t => {
          const status   = BOARD_STATUSES.find(s => s.id === t.status);
          const assignee = t.assigneeId
            ? { color: t.assigneeColor ?? '#94a3b8', initials: t.assigneeInitials ?? '?' }
            : null;
          const isSelected = selectedIds.has(t.id);
          return (
            <Stack key={t.id} direction="row" {...taskLinkProps(t.key, openTask)}
              sx={{ alignItems: 'center', px: 1.5, py: 0.75,
                borderBottom: 1, borderColor: 'divider', cursor: 'default',
                textDecoration: 'none', color: 'text.primary',
                bgcolor: isSelected ? 'action.selected' : 'transparent',
                '&:hover': { bgcolor: isSelected ? 'action.selected' : 'action.hover' } }}>
              <Stack
                sx={{ width: SELECT_COL_W, alignItems: 'center', justifyContent: 'center' }}
                onClick={e => e.stopPropagation()}
              >
                <Checkbox
                  size="small"
                  checked={isSelected}
                  onChange={() => toggleOne(t.id)}
                  aria-label={`Vybrat ${t.key}`}
                  sx={{ p: 0 }}
                />
              </Stack>
              <Box sx={{ width: 84, px: 0.5 }}>
                <MonoKey sx={{ fontSize: '13px' }}>{t.key}</MonoKey>
              </Box>
              <Box sx={{ width: 28, px: 0.5 }}><TypeIcon type={t.type} size={13}/></Box>
              <Box sx={{ width: 28, px: 0.5 }}><PriorityIcon priority={t.priority}/></Box>
              <Box sx={{ flex: 1, px: 0.5, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</Box>
              <Stack direction="row" spacing={0.75} sx={{ width: 130, px: 0.5, alignItems: 'center' }}>
                <FluxAvatar user={assignee} size={18}/>
                {t.assigneeName && <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.assigneeName.split(' ')[0]}</Box>}
              </Stack>
              <Box sx={{ width: 110, px: 0.5 }}>
                {status && (
                  <StatusBadge badgeColor={status.color}>
                    <ColorDot dotColor={status.color} dotSize={5}/>
                    {status.name}
                  </StatusBadge>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ width: 50, px: 0.5, fontVariantNumeric: 'tabular-nums' }}>{t.estimate ?? '—'}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ width: 70, px: 0.5, fontVariantNumeric: 'tabular-nums' }}>{t.logged}h</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ width: 80, px: 0.5 }}>
                {t.dueDate ? new Date(t.dueDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' }) : '—'}
              </Typography>
            </Stack>
          );
        })}

        {isFetchingNextPage && (
          <Stack>
            {Array.from({ length: 3 }).map((_, i) => (
              <Stack
                key={`loading-${i}`}
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.75,
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Skeleton variant="text" width={56} height={13} />
                <Skeleton variant="circular" width={13} height={13} />
                <Skeleton variant="circular" width={12} height={12} />
                <Skeleton variant="text" sx={{ flex: 1 }} height={13} />
                <Skeleton variant="text" width={110} height={13} />
                <Skeleton variant="text" width={90} height={13} />
              </Stack>
            ))}
          </Stack>
        )}

        <Box ref={sentinelRef} sx={{ height: 1 }} aria-hidden />
      </Box>
    </Box>
  );
}

import { useMemo, useState } from 'react';
import { Box, Button, Checkbox, TextField, Typography } from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import Papa from 'papaparse';
import { useSnackbar } from 'notistack';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { BOARD_STATUSES } from '../constants/statuses';
import FluxAvatar from '../components/flux-avatar';
import TypeIcon from '../components/icons/type-icon';
import PriorityIcon from '../components/icons/priority-icon';
import { MonoKey, StatusBadge, ColorDot } from '../components/ui/ui';
import { FilterIcon, ListIcon, PlusIcon, DownloadIcon } from '../components/icons/icons';
import EmptyState from '../components/empty-state/EmptyState';
import QueryError from '../components/query-error/QueryError';
import { useUiStore } from '../store/ui-store';
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
  const { projectId } = useParams<{ projectId: string }>();
  const [, setSearchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const openTask = (id: string) => setSearchParams({ task: id });
  const {
    data: tasks = [],
    isError: tasksError,
    error: tasksErrorObj,
    refetch: refetchTasks,
  } = useTasks(projectId!);
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

  if (tasksError) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper', height: '100%' }}>
        <QueryError error={tasksErrorObj} onRetry={() => { void refetchTasks(); }} />
      </Box>
    );
  }

  if (tasks.length === 0) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper', height: '100%' }}>
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
      </Box>
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
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, gap: 1, borderBottom: 1, borderColor: 'divider',
        position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
        <TextField placeholder="Filtr…" size="small"
          sx={{ width: 200, '& .MuiOutlinedInput-root': { height: 26, fontSize: 12.5 } }}/>
        <Button size="small" variant="outlined" startIcon={<FilterIcon/>}>Filtry</Button>
        <Button size="small" variant="outlined" startIcon={<DownloadIcon/>}
          onClick={handleExportCsv} disabled={tasks.length === 0}>Export</Button>
        <Box sx={{ flex: 1 }}/>
        <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{tasks.length} tasků</Typography>
      </Box>

      {projectId && (
        <ListViewBulkToolbar
          projectId={projectId}
          selectedIds={Array.from(selectedIds)}
          onClear={clearSelection}
        />
      )}

      <Box sx={{ minWidth: 900 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.75, fontSize: 10.5, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary',
          borderBottom: 1, borderColor: 'divider', position: 'sticky',
          top: selectedIds.size > 0 ? 86 : 43,
          bgcolor: 'background.paper', zIndex: 1 }}>
          <Box sx={{ width: SELECT_COL_W, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleAll}
              aria-label="Vybrat všechny úkoly"
              sx={{ p: 0 }}
            />
          </Box>
          {COLS.map(c => (
            <Box key={c.key} sx={{ width: 'w' in c ? c.w : undefined, flex: 'flex' in c ? c.flex : undefined, px: 0.5 }}>{c.label}</Box>
          ))}
        </Box>

        {tasks.map(t => {
          const status   = BOARD_STATUSES.find(s => s.id === t.status);
          const assignee = t.assigneeId
            ? { color: t.assigneeColor ?? '#94a3b8', initials: t.assigneeInitials ?? '?' }
            : null;
          const isSelected = selectedIds.has(t.id);
          return (
            <Box key={t.id} onClick={() => openTask(t.id)}
              sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.75, fontSize: 12.5,
                borderBottom: 1, borderColor: 'divider', cursor: 'default',
                bgcolor: isSelected ? 'action.selected' : 'transparent',
                '&:hover': { bgcolor: isSelected ? 'action.selected' : 'action.hover' } }}>
              <Box
                sx={{ width: SELECT_COL_W, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={e => e.stopPropagation()}
              >
                <Checkbox
                  size="small"
                  checked={isSelected}
                  onChange={() => toggleOne(t.id)}
                  aria-label={`Vybrat ${t.key}`}
                  sx={{ p: 0 }}
                />
              </Box>
              <Box sx={{ width: 84, px: 0.5 }}>
                <MonoKey sx={{ fontSize: 11.5 }}>{t.key}</MonoKey>
              </Box>
              <Box sx={{ width: 28, px: 0.5 }}><TypeIcon type={t.type} size={13}/></Box>
              <Box sx={{ width: 28, px: 0.5 }}><PriorityIcon priority={t.priority}/></Box>
              <Box sx={{ flex: 1, px: 0.5, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</Box>
              <Box sx={{ width: 130, px: 0.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <FluxAvatar user={assignee} size={18}/>
                {t.assigneeName && <Box sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.assigneeName.split(' ')[0]}</Box>}
              </Box>
              <Box sx={{ width: 110, px: 0.5 }}>
                {status && (
                  <StatusBadge badgeColor={status.color}>
                    <ColorDot dotColor={status.color} dotSize={5}/>
                    {status.name}
                  </StatusBadge>
                )}
              </Box>
              <Box sx={{ width: 50, px: 0.5, fontVariantNumeric: 'tabular-nums', fontSize: 11.5, color: 'text.secondary' }}>{t.estimate ?? '—'}</Box>
              <Box sx={{ width: 70, px: 0.5, fontVariantNumeric: 'tabular-nums', fontSize: 11.5, color: 'text.secondary' }}>{t.logged}h</Box>
              <Box sx={{ width: 80, px: 0.5, fontSize: 11.5, color: 'text.secondary' }}>
                {t.dueDate ? new Date(t.dueDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' }) : '—'}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

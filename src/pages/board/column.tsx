import { useState } from 'react';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { PlusIcon, MoreIcon } from '../../components/icons/icons';
import { SortableTaskCard } from './task-card';
import { useCreateTask } from '../../hooks/useTasks';
import { useProjectByKey } from '../../hooks/useProjects';
import type { TaskSummaryDto } from '../../api/types';
import type { BoardStatus } from '../../constants/statuses';

interface ColumnProps {
  status: BoardStatus;
  tasks: TaskSummaryDto[];
  onTaskClick: (key: string) => void;
}

export default function Column({ status, tasks, onTaskClick }: ColumnProps) {
  const count = tasks.length;
  const isWipBreached = status.wip != null && count > status.wip;
  const { setNodeRef, isOver } = useDroppable({ id: status.id });
  const { projectKey } = useParams<{ projectKey: string }>();
  const { data: project } = useProjectByKey(projectKey);
  const projectId = project?.id;
  const { enqueueSnackbar } = useSnackbar();
  const createTask = useCreateTask();

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const resetAdding = () => {
    setAdding(false);
    setDraft('');
  };

  const submit = () => {
    const title = draft.trim();
    if (!title || !projectId || createTask.isPending) return;
    createTask.mutate(
      { projectId, title, status: status.id, type: 'TASK', priority: 'MEDIUM' },
      {
        onSuccess: () => {
          resetAdding();
          enqueueSnackbar('Task vytvořen', { variant: 'success' });
        },
        onError: () => {
          enqueueSnackbar('Chyba při vytváření tasku', { variant: 'error' });
        },
      },
    );
  };

  const handleBlur = () => {
    if (!draft.trim()) {
      resetAdding();
      return;
    }
    submit();
  };

  const columnLabelId = `column-label-${status.id}`;
  const wipLabel = status.wip != null
    ? `${isWipBreached ? ', překročen limit ' : ', limit '}${status.wip}`
    : '';
  const ariaLabel = `Sloupec ${status.name}, ${count} ${count === 1 ? 'úkol' : 'úkolů'}${wipLabel}`;

  return (
    <Box
      role="listitem"
      aria-labelledby={columnLabelId}
      sx={{ width: 296, flexShrink: 0, display: 'flex', flexDirection: 'column',
      bgcolor: 'action.hover', borderRadius: 1.5, border: 1,
      borderColor: isOver ? 'primary.main' : 'transparent',
      maxHeight: '100%', minHeight: 0 }}
    >
      <Box sx={{ px: 1.25, py: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box aria-hidden="true" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: status.color }}/>
        <Typography
          id={columnLabelId}
          aria-label={ariaLabel}
          sx={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
          color: 'text.secondary' }}
        >
          {status.name}
        </Typography>
        <Typography aria-hidden="true" sx={{ fontSize: 13, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>{count}</Typography>
        {status.wip && (
          <Box
            aria-hidden="true"
            sx={{ ml: 0.25, fontSize: 13, fontWeight: 700, px: 0.5, borderRadius: 0.5,
            bgcolor: isWipBreached ? 'error.main' : 'action.selected',
            color: isWipBreached ? 'common.white' : 'text.secondary' }}
          >
            WIP {status.wip}
          </Box>
        )}
        <Box sx={{ flex: 1 }}/>
        <IconButton
          size="small"
          sx={{ p: 0.25 }}
          onClick={() => setAdding(true)}
          aria-label={`Přidat úkol do sloupce ${status.name}`}
        >
          <PlusIcon/>
        </IconButton>
        <IconButton size="small" sx={{ p: 0.25 }} aria-label={`Možnosti sloupce ${status.name}`}>
          <MoreIcon/>
        </IconButton>
      </Box>

      <Box
        ref={setNodeRef}
        role="list"
        aria-label={`Úkoly ve sloupci ${status.name}`}
        sx={{ px: 1, pb: 1, display: 'flex', flexDirection: 'column', gap: 0.75,
        overflowY: 'auto', flex: 1, minHeight: 0 }}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(t => (
            <SortableTaskCard key={t.id} task={t} onClick={() => onTaskClick(t.key)}/>
          ))}
        </SortableContext>
        {tasks.length === 0 && !adding && (
          <Box
            role="status"
            sx={{ p: 2, textAlign: 'center', color: 'text.disabled', fontSize: 13,
            border: 1, borderColor: 'divider', borderStyle: 'dashed', borderRadius: 1 }}
          >
            Žádné tasky
          </Box>
        )}
        {adding ? (
          <TextField
            autoFocus
            value={draft}
            disabled={createTask.isPending}
            placeholder="Název úkolu…"
            onChange={e => setDraft(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                resetAdding();
              }
            }}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: 14, bgcolor: 'background.paper' },
              '& .MuiOutlinedInput-input': { px: 1, py: 0.75 } }}
          />
        ) : (
          <Box
            role="button"
            tabIndex={0}
            aria-label={`Přidat úkol do sloupce ${status.name}`}
            onClick={() => setAdding(true)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setAdding(true);
              }
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5, borderRadius: 1,
              color: 'text.disabled', fontSize: 13, cursor: 'pointer', userSelect: 'none',
              '&:hover': { bgcolor: 'action.hover', color: 'text.secondary' },
              '&:focus-visible': { outline: 1, outlineColor: 'primary.main', outlineOffset: 1 } }}>
            <PlusIcon aria-hidden="true"/> Přidat úkol
          </Box>
        )}
      </Box>
    </Box>
  );
}

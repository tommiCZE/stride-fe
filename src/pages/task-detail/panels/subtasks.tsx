import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Checkbox, CircularProgress, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSnackbar } from 'notistack';
import { SectionLabel } from '../../../components/ui/ui';
import {
  useCreateSubtask,
  useDeleteSubtask,
  useReorderSubtasks,
  useSubtasks,
  useUpdateSubtask,
} from '../../../hooks/useSubtasks';
import type { SubtaskDto } from '../../../api/types';

function GripIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
      <circle cx="2.5" cy="2.5" r="1.5" />
      <circle cx="7.5" cy="2.5" r="1.5" />
      <circle cx="2.5" cy="7" r="1.5" />
      <circle cx="7.5" cy="7" r="1.5" />
      <circle cx="2.5" cy="11.5" r="1.5" />
      <circle cx="7.5" cy="11.5" r="1.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
    </svg>
  );
}

interface SortableRowProps {
  subtask: SubtaskDto;
  onToggle: (id: string, done: boolean) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

function SortableRow({ subtask, onToggle, onRename, onDelete }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: subtask.id });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(subtask.title);
  const [confirming, setConfirming] = useState(false);
  const [prevEditing, setPrevEditing] = useState(editing);
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (prevEditing !== editing) {
    setPrevEditing(editing);
    if (editing) {
      setDraft(subtask.title);
    }
  }

  useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [editing]);

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== subtask.title) {
      onRename(subtask.id, trimmed);
    }
    setEditing(false);
  };

  return (
    <Stack direction="row" spacing={0.5}
      ref={setNodeRef}
      sx={{
        transform: CSS.Transform.toString(transform),
        transition,
        alignItems: 'center',
        py: 0.25,
        borderRadius: 1,
        bgcolor: isDragging ? 'action.selected' : 'transparent',
        opacity: isDragging ? 0.6 : 1,
        '&:hover': { bgcolor: isDragging ? 'action.selected' : 'action.hover' },
        '&:hover .subtask-grip, &:hover .subtask-delete': { opacity: 1 } }}
    >
      <Stack direction="row"
        className="subtask-grip"
        {...attributes}
        {...listeners}
        sx={{
        opacity: 0,
          cursor: 'grab',
          px: 0.5,
          color: 'text.disabled',
          alignItems: 'center',
          '&:active': { cursor: 'grabbing' } }}
        aria-label="Přetáhnout pro změnu pořadí"
      >
        <GripIcon />
      </Stack>

      <Checkbox
        size="small"
        checked={subtask.done}
        onChange={e => onToggle(subtask.id, e.target.checked)}
        sx={{ p: 0.5 }}
      />

      {editing ? (
        <Box
          component="input"
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitEdit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setEditing(false);
            }
          }}
          sx={{
            flex: 1,
            minWidth: 0,
            border: 1,
            borderColor: 'primary.main',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            fontSize: '13px',
            bgcolor: 'background.paper',
            color: 'text.primary',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      ) : (
        <Typography
          onClick={() => setEditing(true)}
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: '13px',
            cursor: 'text',
            color: subtask.done ? 'text.disabled' : 'text.primary',
            textDecoration: subtask.done ? 'line-through' : 'none',
            px: 1,
            py: 0.5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {subtask.title}
        </Typography>
      )}

      {confirming ? (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', pr: 0.5 }}>
          <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>Smazat?</Typography>
          <Button
            size="small"
            color="error"
            onClick={() => {
              onDelete(subtask.id);
              setConfirming(false);
            }}
            sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: '13px' }}
          >
            Ano
          </Button>
          <Button
            size="small"
            onClick={() => setConfirming(false)}
            sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: '13px' }}
          >
            Ne
          </Button>
        </Stack>
      ) : (
        <IconButton
          className="subtask-delete"
          size="small"
          aria-label="Smazat podúkol"
          onClick={() => setConfirming(true)}
          sx={{
            opacity: 0,
            color: 'text.disabled',
            '&:hover': { color: 'error.main' },
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
    </Stack>
  );
}

export default function Subtasks({ taskId }: { taskId: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: subtasks = [], isLoading } = useSubtasks(taskId);
  const createMutation = useCreateSubtask(taskId);
  const updateMutation = useUpdateSubtask(taskId);
  const deleteMutation = useDeleteSubtask(taskId);
  const reorderMutation = useReorderSubtasks(taskId);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const newInputRef = useRef<HTMLInputElement | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    if (adding) requestAnimationFrame(() => newInputRef.current?.focus());
  }, [adding]);

  const sorted = useMemo(
    () => [...subtasks].sort((a, b) => a.sortOrder - b.sortOrder),
    [subtasks],
  );

  const total = sorted.length;
  const done = sorted.filter(s => s.done).length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  const submitNew = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setAdding(false);
      setDraft('');
      return;
    }
    createMutation.mutate(
      { title: trimmed },
      {
        onSuccess: () => {
          setDraft('');
          // keep "adding" so user can chain entries
          requestAnimationFrame(() => newInputRef.current?.focus());
        },
        onError: () => enqueueSnackbar('Nepodařilo se přidat podúkol', { variant: 'error' }),
      },
    );
  };

  const handleToggle = (id: string, doneNext: boolean) => {
    updateMutation.mutate({ id, body: { done: doneNext } });
  };

  const handleRename = (id: string, title: string) => {
    updateMutation.mutate(
      { id, body: { title } },
      {
        onError: () => enqueueSnackbar('Nepodařilo se uložit změnu', { variant: 'error' }),
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => enqueueSnackbar('Podúkol smazán', { variant: 'success' }),
      onError: () => enqueueSnackbar('Nepodařilo se smazat podúkol', { variant: 'error' }),
    });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex(s => s.id === active.id);
    const newIndex = sorted.findIndex(s => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(sorted, oldIndex, newIndex).map(s => s.id);
    reorderMutation.mutate(next, {
      onError: () => enqueueSnackbar('Nepodařilo se přeuspořádat', { variant: 'error' }),
    });
  };

  return (
    <Box sx={{ mt: 3, mb: 2 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
        <SectionLabel>
          Podúkoly{total > 0 ? ` · ${done}/${total}` : ''}
        </SectionLabel>
        {isLoading && <CircularProgress size={12} />}
      </Stack>

      {total > 0 && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mb: 1, height: 4, borderRadius: 2 }}
        />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <Stack spacing={0.25} >
            {sorted.map(s => (
              <SortableRow
                key={s.id}
                subtask={s}
                onToggle={handleToggle}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>

      <Box sx={{ mt: 0.5 }}>
        {adding ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pl: 4 }}>
            <Box
              component="input"
              ref={newInputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Název podúkolu…"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submitNew();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setAdding(false);
                  setDraft('');
                }
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                border: 1,
                borderColor: 'primary.main',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                fontSize: '13px',
                bgcolor: 'background.paper',
                color: 'text.primary',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <Button
              size="small"
              onClick={() => {
                setAdding(false);
                setDraft('');
              }}
              sx={{ fontSize: '13px' }}
            >
              Hotovo
            </Button>
          </Stack>
        ) : (
          <Button
            size="small"
            onClick={() => setAdding(true)}
            sx={{
              fontSize: '14px',
              color: 'text.secondary',
              justifyContent: 'flex-start',
              pl: 4,
              '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
            }}
          >
            + Přidat podúkol
          </Button>
        )}
      </Box>
    </Box>
  );
}

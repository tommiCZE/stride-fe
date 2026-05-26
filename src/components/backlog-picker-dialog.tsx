import { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
  InputBase, Stack, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useUpdateTask } from '../hooks/useTasks';
import TypeIcon from './icons/type-icon';
import PriorityIcon from './icons/priority-icon';
import { MonoKey } from './ui/ui';
import { SearchIcon } from './icons/icons';
import { getReadiness } from '../utils/task-readiness';
import type { SprintDto, TaskSummaryDto } from '../api/types';

interface Props {
  open: boolean;
  onClose: () => void;
  sprint: SprintDto;
  backlogTasks: TaskSummaryDto[];
}

export default function BacklogPickerDialog({ open, onClose, sprint, backlogTasks }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const updateTask = useUpdateTask(sprint.projectId);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) { setSelected(new Set()); setSearch(''); }
  }, [open]);

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return backlogTasks.filter(t => {
      if (getReadiness(t) === 'ICEBOX') return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q);
    });
  }, [backlogTasks, search]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = async () => {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      await Promise.all([...selected].map(id =>
        updateTask.mutateAsync({ id, body: { sprintId: sprint.id } }),
      ));
      enqueueSnackbar(`${selected.size} ${selected.size === 1 ? 'task přesunut' : 'tasků přesunuto'} do sprintu`, { variant: 'success' });
      onClose();
    } catch {
      enqueueSnackbar('Část tasků se nepodařilo přesunout', { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Přidat z backlogu do „{sprint.name}"</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ pt: 0.5 }}>
          <Stack direction="row" spacing={0.75} sx={{
            alignItems: 'center', bgcolor: 'background.default',
            borderRadius: 1.5, px: 1.25, py: 0.5,
          }}>
            <Box sx={{ color: 'text.disabled', display: 'inline-flex' }}><SearchIcon/></Box>
            <InputBase
              value={search} onChange={e => setSearch(e.target.value)}
              autoFocus placeholder="Hledat task…"
              sx={{ flex: 1, fontSize: 13 }}
            />
          </Stack>
          <Box sx={{
            maxHeight: 360, overflowY: 'auto',
            border: 1, borderColor: 'divider', borderRadius: 1.5,
          }}>
            {candidates.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                Žádné vhodné tasky.
              </Typography>
            )}
            {candidates.map((t, i) => (
              <Stack key={t.id} direction="row" spacing={1}
                onClick={() => toggle(t.id)}
                sx={{
                  alignItems: 'center', px: 1.25, py: 0.85,
                  borderBottom: i === candidates.length - 1 ? 0 : 1, borderColor: 'divider',
                  cursor: 'default',
                  bgcolor: selected.has(t.id) ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: selected.has(t.id) ? 'action.selected' : 'action.hover' },
                }}>
                <Checkbox size="small" checked={selected.has(t.id)} sx={{ p: 0.5 }}/>
                <PriorityIcon priority={t.priority}/>
                <TypeIcon type={t.type} size={13}/>
                <MonoKey sx={{ minWidth: 60, fontSize: 11 }}>{t.key}</MonoKey>
                <Typography sx={{ flex: 1, minWidth: 0, fontSize: 14,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.title}
                </Typography>
                {t.estimate != null && (
                  <Box sx={{ fontSize: 11, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                    {t.estimate}h
                  </Box>
                )}
              </Stack>
            ))}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Zrušit</Button>
        <Button variant="contained" onClick={submit}
          disabled={selected.size === 0 || busy}>
          Přidat {selected.size > 0 && `${selected.size} ${selected.size === 1 ? 'task' : 'tasků'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

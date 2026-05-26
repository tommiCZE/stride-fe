import { useEffect, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCreateSprint } from '../hooks/useSprints';

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string | undefined;
}

export default function NewSprintDialog({ open, onClose, projectId }: Props) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [goal, setGoal] = useState('');
  const createSprint = useCreateSprint();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) { setName(''); setStartDate(''); setEndDate(''); setGoal(''); }
  }, [open]);

  const submit = () => {
    if (!projectId || !name.trim()) return;
    createSprint.mutate(
      {
        projectId,
        name: name.trim(),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(goal.trim() ? { goal: goal.trim() } : {}),
      },
      {
        onSuccess: () => {
          enqueueSnackbar(`Sprint "${name.trim()}" vytvořen`, { variant: 'success' });
          onClose();
        },
        onError: () => enqueueSnackbar('Sprint se nepodařilo vytvořit', { variant: 'error' }),
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Nový sprint</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <TextField
            autoFocus required size="small"
            label="Název" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) submit(); }}
          />
          <Stack direction="row" spacing={1}>
            <TextField
              size="small" type="date" label="Začátek"
              value={startDate} onChange={e => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small" type="date" label="Konec"
              value={endDate} onChange={e => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Stack>
          <TextField
            size="small" label="Cíl sprintu (volitelné)"
            multiline minRows={2} value={goal}
            onChange={e => setGoal(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zrušit</Button>
        <Button variant="contained"
          disabled={!name.trim() || createSprint.isPending}
          onClick={submit}>
          Vytvořit sprint
        </Button>
      </DialogActions>
    </Dialog>
  );
}

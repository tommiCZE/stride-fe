import { useState } from 'react';
import { Button, InputBase, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCreateWorklog } from '../hooks/useWorklogs';

interface WorklogComposerProps {
  taskId: string;
  onClose: () => void;
  defaultMinutes?: number;
}

export function WorklogComposer({ taskId, onClose, defaultMinutes }: WorklogComposerProps) {
  const { enqueueSnackbar } = useSnackbar();
  const createWorklog = useCreateWorklog(taskId);
  const [hours, setHours] = useState(
    defaultMinutes && defaultMinutes > 0
      ? (defaultMinutes / 60).toFixed(2).replace(/\.?0+$/, '')
      : '',
  );
  const [comment, setComment] = useState('');

  const submit = () => {
    const mins = Math.round(parseFloat(hours) * 60);
    if (isNaN(mins) || mins <= 0) return;
    createWorklog.mutate(
      { minutes: mins, loggedAt: new Date().toISOString().slice(0, 10), comment: comment || undefined },
      {
        onSuccess: () => {
          enqueueSnackbar('Worklog uložen', { variant: 'success' });
          onClose();
        },
      },
    );
  };

  return (
    <Stack spacing={1} sx={{
      p: 1.5, border: 1, borderColor: 'primary.main', borderRadius: 1.5,
      bgcolor: 'background.paper',
    }}>
      <InputBase
        placeholder="Hodiny (např. 1.5)"
        value={hours}
        onChange={e => setHours(e.target.value)}
        autoFocus
        sx={{ border: 1, borderColor: 'divider', borderRadius: 0.5, px: 1, fontSize: '14px', width: 160 }}
      />
      <InputBase
        placeholder="Poznámka (volitelné)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        fullWidth
        sx={{ border: 1, borderColor: 'divider', borderRadius: 0.5, px: 1, fontSize: '14px' }}
      />
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
        <Button size="small" onClick={onClose} disabled={createWorklog.isPending}>Zrušit</Button>
        <Button size="small" variant="contained" onClick={submit} disabled={createWorklog.isPending}>
          Uložit záznam
        </Button>
      </Stack>
    </Stack>
  );
}

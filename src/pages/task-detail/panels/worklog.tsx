import { useState } from 'react';
import { Box, Button, InputBase, Typography, CircularProgress } from '@mui/material';
import { useWorklogs, useCreateWorklog } from '../../../hooks/useWorklogs';
import FluxAvatar from '../../../components/flux-avatar';

export function Worklog({ taskId }: { taskId: string }) {
  const { data: entries = [], isLoading } = useWorklogs(taskId);
  const createWorklog = useCreateWorklog(taskId);
  const [adding, setAdding] = useState(false);
  const [minutes, setMinutes] = useState('');
  const [comment, setComment] = useState('');

  const submit = () => {
    const mins = Math.round(parseFloat(minutes) * 60);
    if (isNaN(mins) || mins <= 0) return;
    createWorklog.mutate(
      { minutes: mins, loggedAt: new Date().toISOString().slice(0, 10), comment: comment || undefined },
      { onSuccess: () => { setAdding(false); setMinutes(''); setComment(''); } },
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {isLoading && <CircularProgress size={16}/>}

      {entries.map(e => (
        <Box key={e.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
          <FluxAvatar user={e.user} size={20}/>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{e.comment ?? '—'}</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>{e.user.name} · {e.loggedAt}</Typography>
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'primary.main' }}>
            {(e.minutes / 60).toFixed(1)}h
          </Typography>
        </Box>
      ))}

      {adding ? (
        <Box sx={{ p: 1.25, border: 1, borderColor: 'primary.main', borderRadius: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <InputBase
              placeholder="Hodiny (např. 1.5)"
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 0.5, px: 1, fontSize: 14, width: 140 }}
            />
          </Box>
          <InputBase
            placeholder="Poznámka (volitelné)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            fullWidth
            sx={{ border: 1, borderColor: 'divider', borderRadius: 0.5, px: 1, fontSize: 14 }}
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" onClick={() => setAdding(false)}>Zrušit</Button>
            <Button size="small" variant="contained" onClick={submit} disabled={createWorklog.isPending}>Uložit</Button>
          </Box>
        </Box>
      ) : (
        <Button size="small" variant="outlined" onClick={() => setAdding(true)} sx={{ alignSelf: 'flex-start' }}>
          + Přidat záznam
        </Button>
      )}
    </Box>
  );
}

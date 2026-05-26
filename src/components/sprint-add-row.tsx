import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { BacklogIcon, PlusIcon } from './icons/icons';

interface Props {
  sprintState: string;
  isPending: boolean;
  readyCount: number;
  onPickFromBacklog: () => void;
  onQuickCreate: (title: string) => void;
}

export default function SprintAddRow({
  sprintState, isPending, readyCount, onPickFromBacklog, onQuickCreate,
}: Props) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [title, setTitle] = useState('');

  const allowQuickAdd = sprintState === 'ACTIVE';

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onQuickCreate(trimmed);
    setTitle('');
  };

  if (quickOpen) {
    return (
      <Stack direction="row" spacing={1} sx={{
        alignItems: 'center', px: 1.5, py: 0.5,
        borderTop: 1, borderColor: 'divider',
      }}>
        <TextField
          size="small" autoFocus placeholder="Název tasku…" value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') { setQuickOpen(false); setTitle(''); }
          }}
          onBlur={() => { if (!title.trim()) setQuickOpen(false); }}
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

  return (
    <Stack direction="row" sx={{ borderTop: 1, borderColor: 'divider' }}>
      <Button
        onClick={onPickFromBacklog}
        sx={{
          flex: 1, borderRadius: 0, justifyContent: 'flex-start', px: 1.5, py: 1,
          color: 'text.secondary', fontWeight: 500,
          '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
        }}
        startIcon={<BacklogIcon/>}
      >
        Z backlogu
        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.disabled' }}>
          — vyber z {readyCount} {readyCount === 1 ? 'tasku' : 'tasků'}
        </Typography>
      </Button>
      {allowQuickAdd && (
        <>
          <Box sx={{ width: 1, bgcolor: 'divider' }}/>
          <Button
            onClick={() => setQuickOpen(true)}
            sx={{
              borderRadius: 0, px: 1.5, py: 1,
              color: 'text.disabled', fontWeight: 500,
              '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
            }}
            startIcon={<PlusIcon/>}
          >
            Quick add
          </Button>
        </>
      )}
    </Stack>
  );
}

import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material';
import { CloseIcon } from '../../components/icons/icons';

interface SaveFilterDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function SaveFilterDialog({ open, onClose, onSave }: SaveFilterDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setName('');
      setError(null);
    }
  }

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Zadej název filtru');
      return;
    }
    onSave(trimmed);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5 }}>
        <Typography sx={{ fontSize: '14px', fontWeight: 600, flex: 1 }}>
          Uložit aktuální filtr
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={1.5} sx={{ pt: 0.5 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Např. Moje bugy, P0 do tohoto sprintu…"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
            error={!!error}
            helperText={error ?? ' '}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button size="small" onClick={onClose}>Zrušit</Button>
        <Button size="small" variant="contained" onClick={handleSave} disabled={!name.trim()}>
          Uložit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

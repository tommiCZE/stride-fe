import { useEffect, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, TextField, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useDeleteRelease } from '../../../hooks/useReleases';
import type { ReleaseDto } from '../../../api/types';

interface Props {
  open: boolean;
  onClose: () => void;
  release: ReleaseDto;
  onDeleted: () => void;
}

export default function DeleteReleaseDialog({ open, onClose, release, onDeleted }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const deleteRelease = useDeleteRelease(release.projectId);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (open) setConfirmText('');
  }, [open]);

  const matches = confirmText.trim() === release.name;

  const submit = () => {
    if (!matches) return;
    deleteRelease.mutate(release.id, {
      onSuccess: () => {
        enqueueSnackbar('Verze smazána', { variant: 'success' });
        onClose();
        onDeleted();
      },
      onError: () => enqueueSnackbar('Mazání selhalo', { variant: 'error' }),
    });
  };

  return (
    <Dialog open={open} onClose={deleteRelease.isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Smazat verzi {release.name}?</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ pt: 0.5 }}>
          <Typography variant="body2">
            Tato akce je trvalá. Tasky přiřazené k verzi zůstanou v projektu, ale
            ztratí přiřazení k této verzi.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Pro potvrzení napiš <strong>{release.name}</strong>:
          </Typography>
          <TextField
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            size="small" fullWidth autoFocus
            placeholder={release.name}
            slotProps={{
              input: {
                sx: { fontFamily: '"JetBrains Mono", ui-monospace, monospace' },
              },
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && matches) { e.preventDefault(); submit(); }
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleteRelease.isPending}>Zrušit</Button>
        <Button
          variant="contained" color="error"
          onClick={submit}
          disabled={!matches || deleteRelease.isPending}
        >
          Smazat
        </Button>
      </DialogActions>
    </Dialog>
  );
}

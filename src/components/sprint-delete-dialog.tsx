import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useDeleteSprint } from '../hooks/useSprints';
import type { SprintDto } from '../api/types';

interface Props {
  open: boolean;
  onClose: () => void;
  sprint: SprintDto;
  taskCount: number;
}

export default function SprintDeleteDialog({ open, onClose, sprint, taskCount }: Props) {
  const deleteSprint = useDeleteSprint(sprint.projectId);
  const { enqueueSnackbar } = useSnackbar();
  const isActive = sprint.state === 'ACTIVE';

  const submit = () => {
    deleteSprint.mutate(sprint.id, {
      onSuccess: () => {
        enqueueSnackbar(
          taskCount > 0
            ? `Sprint "${sprint.name}" smazán. ${taskCount} ${taskCount === 1 ? 'task vrácen' : 'tasků vráceno'} do backlogu.`
            : `Sprint "${sprint.name}" smazán.`,
          { variant: 'success' },
        );
        onClose();
      },
      onError: () => enqueueSnackbar('Sprint se nepodařilo smazat', { variant: 'error' }),
    });
  };

  return (
    <Dialog open={open} onClose={deleteSprint.isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Smazat sprint „{sprint.name}"</DialogTitle>
      <DialogContent>
        {isActive && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Tohle je aktivní sprint. Smazáním přerušíš běžící práci týmu.
          </Alert>
        )}
        <Typography variant="body2">
          {taskCount === 0
            ? 'Sprint je prázdný a bude odstraněn.'
            : <>Sprint obsahuje <b>{taskCount}</b> {taskCount === 1 ? 'task' : 'tasků'}, které se vrátí do backlogu. Akci nelze vrátit.</>}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleteSprint.isPending}>Zrušit</Button>
        <Button variant="contained" color="error" onClick={submit} disabled={deleteSprint.isPending}>
          Smazat sprint
        </Button>
      </DialogActions>
    </Dialog>
  );
}

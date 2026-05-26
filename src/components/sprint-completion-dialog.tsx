import { useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormControlLabel, Radio, RadioGroup,
  Stack, TextField, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCreateSprint, useUpdateSprint } from '../hooks/useSprints';
import { useUpdateTask } from '../hooks/useTasks';
import type { SprintDto, TaskSummaryDto } from '../api/types';

type Disposition = 'new-sprint' | 'backlog' | 'archive';

interface Props {
  open: boolean;
  onClose: () => void;
  sprint: SprintDto;
  incompleteTasks: TaskSummaryDto[];
  suggestedSprintName: string;
}

export default function SprintCompletionDialog({
  open, onClose, sprint, incompleteTasks, suggestedSprintName,
}: Props) {
  const [disposition, setDisposition] = useState<Disposition>('new-sprint');
  const [newName, setNewName] = useState(suggestedSprintName);
  const { enqueueSnackbar } = useSnackbar();
  const createSprint = useCreateSprint();
  const updateSprint = useUpdateSprint(sprint.projectId);
  const updateTask = useUpdateTask(sprint.projectId);
  const [busy, setBusy] = useState(false);

  const hasIncomplete = incompleteTasks.length > 0;

  const submit = async () => {
    setBusy(true);
    try {
      if (hasIncomplete && disposition === 'new-sprint') {
        const created = await createSprint.mutateAsync({
          projectId: sprint.projectId,
          name: newName.trim() || suggestedSprintName,
        });
        await Promise.all(incompleteTasks.map(t =>
          updateTask.mutateAsync({ id: t.id, body: { sprintId: created.id } }),
        ));
      } else if (hasIncomplete && disposition === 'backlog') {
        await Promise.all(incompleteTasks.map(t =>
          updateTask.mutateAsync({ id: t.id, body: { sprintId: null } }),
        ));
      }
      await updateSprint.mutateAsync({ id: sprint.id, body: { state: 'COMPLETED' } });
      enqueueSnackbar(`Sprint "${sprint.name}" dokončen`, { variant: 'success' });
      onClose();
    } catch {
      enqueueSnackbar('Něco se nepovedlo. Zkus to znovu.', { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Dokončit sprint „{sprint.name}"</DialogTitle>
      <DialogContent>
        {!hasIncomplete && (
          <Typography variant="body2" color="text.secondary">
            Všechny tasky jsou hotové.
          </Typography>
        )}
        {hasIncomplete && (
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography variant="body2">
              {incompleteTasks.length} {incompleteTasks.length === 1 ? 'task zůstal' : 'tasků zůstalo'} nedokončených. Co s nimi?
            </Typography>
            <FormControl>
              <RadioGroup
                value={disposition}
                onChange={(_, v) => setDisposition(v as Disposition)}>
                <FormControlLabel value="new-sprint" control={<Radio size="small"/>}
                  label="Přesunout do nového sprintu (doporučeno)"/>
                <FormControlLabel value="backlog" control={<Radio size="small"/>}
                  label="Vrátit zpět do backlogu"/>
                <FormControlLabel value="archive" control={<Radio size="small"/>}
                  label="Jen archivovat sprint"/>
              </RadioGroup>
            </FormControl>
            {disposition === 'new-sprint' && (
              <TextField
                size="small" label="Název nového sprintu"
                value={newName} onChange={e => setNewName(e.target.value)}
              />
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Zrušit</Button>
        <Button variant="contained" onClick={submit} disabled={busy}>
          Dokončit sprint
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import { useMemo, useState } from 'react';
import {
  Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, Stack, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateRelease, useUpdateRelease, releaseKeys } from '../../../hooks/useReleases';
import { useUpdateTask, taskKeys } from '../../../hooks/useTasks';
import { nextVersion } from '../../../utils/semver';
import type { ReleaseDto, TaskSummaryDto } from '../../../api/types';

interface Props {
  open: boolean;
  onClose: () => void;
  release: ReleaseDto;
  tasks: TaskSummaryDto[];
  siblingReleases: ReleaseDto[];
}

interface Counts {
  done: number;
  todo: number;
  inProgress: number;
  review: number;
  open: number;
  total: number;
}

function countByStatus(tasks: TaskSummaryDto[]): Counts {
  const c: Counts = { done: 0, todo: 0, inProgress: 0, review: 0, open: 0, total: tasks.length };
  for (const t of tasks) {
    if (t.status === 'DONE') c.done++;
    else if (t.status === 'IN_REVIEW') c.review++;
    else if (t.status === 'IN_PROGRESS') c.inProgress++;
    else if (t.status === 'TODO') c.todo++;
  }
  c.open = c.todo + c.inProgress + c.review;
  return c;
}

export default function PublishReleaseDialog({
  open, onClose, release, tasks, siblingReleases,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const updateRelease = useUpdateRelease();
  const createRelease = useCreateRelease();
  const updateTask = useUpdateTask(release.projectId);
  const [carryOver, setCarryOver] = useState(true);
  const [busy, setBusy] = useState(false);

  const counts = useMemo(() => countByStatus(tasks), [tasks]);
  const nextPatchName = useMemo(() => nextVersion(siblingReleases, 'patch'), [siblingReleases]);
  const hasOpen = counts.open > 0;
  const hasBlockers = useMemo(
    () => tasks.some(t => t.priority === 'URGENT' && t.status !== 'DONE'),
    [tasks],
  );

  const submit = async () => {
    setBusy(true);
    try {
      if (hasOpen && carryOver) {
        const openTasks = tasks.filter(t => t.status !== 'DONE');
        const created = await createRelease.mutateAsync({
          projectId: release.projectId,
          name: nextPatchName,
        });
        await Promise.all(openTasks.map(t =>
          updateTask.mutateAsync({ id: t.id, body: { fixVersionId: created.id } }),
        ));
        qc.invalidateQueries({ queryKey: releaseKeys.tasks(release.id) });
        qc.invalidateQueries({ queryKey: releaseKeys.tasks(created.id) });
      }
      await updateRelease.mutateAsync({ id: release.id, body: { status: 'released' } });
      qc.invalidateQueries({ queryKey: releaseKeys.byProject(release.projectId) });
      qc.invalidateQueries({ queryKey: taskKeys.list(release.projectId) });
      enqueueSnackbar(`Verze ${release.name} vydána`, { variant: 'success' });
      onClose();
    } catch {
      enqueueSnackbar('Publish selhal', { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Vydat {release.name}?</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ pt: 0.5 }}>
          <Typography variant="body2">
            Vydáváš <strong>{counts.done} / {counts.total}</strong> tasků hotových.{' '}
            {counts.todo > 0 && <>{counts.todo} ještě nezačaté. </>}
            {counts.inProgress > 0 && <>{counts.inProgress} rozpracované. </>}
            {counts.review > 0 && <>{counts.review} čekají na review.</>}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Po vydání:
          </Typography>
          <Stack component="ul" spacing={0.25} sx={{ pl: 3, my: 0, '& li': { fontSize: 13 } }}>
            <li>Verze přejde do skupiny „Vydané"</li>
            <li>Release notes se finalizují</li>
            <li>Pošle se notifikace do Slacku (pokud je nakonfigurováno)</li>
          </Stack>

          {hasBlockers && (
            <Alert severity="error" sx={{ mt: 1 }}>
              Tato verze obsahuje nedokončený blokátor (P1). Doporučujeme ho dořešit před vydáním.
            </Alert>
          )}

          {hasOpen && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Nedokončené tasky se po vydání přesunou do automaticky vytvořené verze {nextPatchName} (patch).
            </Alert>
          )}

          {hasOpen && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={carryOver}
                  onChange={e => setCarryOver(e.target.checked)}
                  size="small"
                />
              }
              label={`Přesunout nedokončené tasky do ${nextPatchName}`}
              slotProps={{ typography: { sx: { fontSize: 13 } } }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Zrušit</Button>
        <Button
          variant="contained" color="success"
          onClick={submit} disabled={busy}
        >
          Vydat {counts.done} hotových →
        </Button>
      </DialogActions>
    </Dialog>
  );
}

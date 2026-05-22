import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useTeamMembers } from '../hooks/useTeam';
import { BOARD_STATUSES } from '../constants/statuses';
import { ColorDot } from '../components/ui/ui';
import { CloseIcon, CaretIcon } from '../components/icons/icons';
import FluxAvatar from '../components/flux-avatar';

interface ListViewBulkToolbarProps {
  projectId: string;
  selectedIds: string[];
  onClear: () => void;
}

export default function ListViewBulkToolbar({ projectId, selectedIds, onClear }: ListViewBulkToolbarProps) {
  const { enqueueSnackbar } = useSnackbar();
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const { data: team = [] } = useTeamMembers();

  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);
  const [assigneeAnchor, setAssigneeAnchor] = useState<null | HTMLElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const count = selectedIds.length;
  if (count === 0) return null;

  const runBulk = async (
    label: string,
    fn: (id: string) => Promise<unknown>,
  ) => {
    setBusy(true);
    try {
      const results = await Promise.allSettled(selectedIds.map(id => fn(id)));
      const failed = results.filter(r => r.status === 'rejected').length;
      const ok = results.length - failed;
      if (failed === 0) {
        enqueueSnackbar(`${ok} úkolů ${label}`, { variant: 'success' });
      } else if (ok === 0) {
        enqueueSnackbar(`Hromadná akce selhala (${failed})`, { variant: 'error' });
      } else {
        enqueueSnackbar(`${ok} úkolů ${label}, ${failed} selhalo`, { variant: 'warning' });
      }
      onClear();
    } finally {
      setBusy(false);
    }
  };

  const handleStatus = (statusId: string) => {
    setStatusAnchor(null);
    void runBulk('aktualizováno', id => updateTask.mutateAsync({ id, body: { status: statusId } }));
  };

  const handleAssign = (assigneeId: string | null) => {
    setAssigneeAnchor(null);
    void runBulk('aktualizováno', id => updateTask.mutateAsync({ id, body: { assigneeId } }));
  };

  const handleDelete = () => {
    setConfirmDelete(false);
    void runBulk('smazáno', id => deleteTask.mutateAsync(id));
  };

  return (
    <>
      <Stack direction="row" spacing={1}
        sx={{
        alignItems: 'center',
          px: 2,
          py: 1,
          position: 'sticky',
          top: 43,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          zIndex: 2,
          borderBottom: 1,
          borderColor: 'divider' }}
      >
        <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
          {count} vybráno
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Button
          size="small"
          variant="contained"
          color="inherit"
          endIcon={<CaretIcon />}
          disabled={busy}
          onClick={e => setStatusAnchor(e.currentTarget)}
          sx={{ bgcolor: 'background.paper', color: 'text.primary', '&:hover': { bgcolor: 'background.paper' } }}
        >
          Změnit status
        </Button>

        <Button
          size="small"
          variant="contained"
          color="inherit"
          endIcon={<CaretIcon />}
          disabled={busy}
          onClick={e => setAssigneeAnchor(e.currentTarget)}
          sx={{ bgcolor: 'background.paper', color: 'text.primary', '&:hover': { bgcolor: 'background.paper' } }}
        >
          Přiřadit
        </Button>

        <Button
          size="small"
          variant="contained"
          color="error"
          disabled={busy}
          onClick={() => setConfirmDelete(true)}
        >
          Smazat
        </Button>

        <IconButton
          size="small"
          onClick={onClear}
          disabled={busy}
          sx={{ color: 'primary.contrastText' }}
          aria-label="Zrušit výběr"
        >
          <CloseIcon />
        </IconButton>
      </Stack>

      <Menu
        anchorEl={statusAnchor}
        open={Boolean(statusAnchor)}
        onClose={() => setStatusAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {BOARD_STATUSES.map(s => (
          <MenuItem key={s.id} onClick={() => handleStatus(s.id)} sx={{ fontSize: '13px', gap: 1 }}>
            <ColorDot dotColor={s.color} dotSize={7} />
            {s.name}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={assigneeAnchor}
        open={Boolean(assigneeAnchor)}
        onClose={() => setAssigneeAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { maxHeight: 320 } } }}
      >
        <MenuItem onClick={() => handleAssign(null)} sx={{ fontSize: '13px', gap: 1, color: 'text.secondary' }}>
          Nepřiřazeno
        </MenuItem>
        {team.map(u => (
          <MenuItem key={u.id} onClick={() => handleAssign(u.id)} sx={{ fontSize: '13px', gap: 1 }}>
            <FluxAvatar user={{ color: u.color, initials: u.initials }} size={18} />
            {u.name}
          </MenuItem>
        ))}
      </Menu>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: '14px', fontWeight: 600 }}>
          Smazat {count} úkol{count === 1 ? '' : count < 5 ? 'y' : 'ů'}?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>
            Tato akce je nevratná. Vybrané úkoly budou trvale odstraněny.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" onClick={() => setConfirmDelete(false)}>Zrušit</Button>
          <Button size="small" variant="contained" color="error" onClick={handleDelete}>
            Smazat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

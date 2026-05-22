import { useState } from 'react';
import {
  Box, Button, IconButton, Stack, Tooltip, Typography,
  Menu, MenuItem, ListItemIcon, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import TypeIcon from '../../../components/icons/type-icon';
import {
  CaretRIcon, ClockIcon, PinIcon, PinFilledIcon,
  ExpandIcon, CollapseIcon, LinkIcon, MoreIcon, CloseIcon,
  EyeIcon, EyeFilledIcon, OpenInNewIcon,
  DeleteIcon, DuplicateIcon, MoveIcon, ConvertIcon,
} from '../../../components/icons/icons';
import { useIsWatching, useToggleWatch } from '../../../hooks/useWatchers';
import { usePermissions } from '../../../hooks/usePermissions';
import { useDeleteTask } from '../../../hooks/useTasks';
import { useRunningTimer, useStartTimer, useStopTimer } from '../../../hooks/useTimer';
import { WorklogDialog } from '../../../components/worklog-dialog';
import type { TaskDto, ProjectDto, StopTimerResponse } from '../../../api/types';

interface Props {
  task: TaskDto;
  proj: ProjectDto | undefined;
  pinned?: boolean;
  expanded?: boolean;
  onPin?: () => void;
  onExpand?: () => void;
  onPopOut?: () => void;
  onClose?: () => void;
}

export default function TaskDetailHeader({ task, proj, pinned, expanded, onPin, onExpand, onPopOut, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const isWatching = useIsWatching(task.id);
  const toggleWatch = useToggleWatch(task.id);
  const { canEdit } = usePermissions();
  const deleteTask = useDeleteTask(task.projectId);
  const { data: runningTimer } = useRunningTimer();
  const startTimerMutation = useStartTimer();
  const stopTimerMutation = useStopTimer();
  const [pendingWorklog, setPendingWorklog] = useState<StopTimerResponse | null>(null);

  const isThisTaskRunning = runningTimer?.taskId === task.id;
  const timerPending = startTimerMutation.isPending || stopTimerMutation.isPending;

  const handleTimerClick = () => {
    if (timerPending) return;
    if (isThisTaskRunning) {
      stopTimerMutation.mutate(undefined, {
        onSuccess: (data) => setPendingWorklog(data),
      });
    } else {
      startTimerMutation.mutate(task.id);
    }
  };

  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const moreOpen = Boolean(moreAnchor);
  const closeMenu = () => setMoreAnchor(null);

  const handleWatchClick = () => {
    if (toggleWatch.isPending) return;
    toggleWatch.mutate(isWatching, {
      onSuccess: (nowWatching) => {
        enqueueSnackbar(
          nowWatching ? 'Sledujete tento úkol' : 'Přestali jste sledovat',
          { variant: 'success' },
        );
      },
      onError: () => {
        enqueueSnackbar('Akci se nepodařilo provést', { variant: 'error' });
      },
    });
  };

  const handleCopyLink = async () => {
    closeMenu();
    const url = `${window.location.origin}/task/${task.key}`;
    try {
      await navigator.clipboard.writeText(url);
      enqueueSnackbar('Odkaz zkopírován', { variant: 'success' });
    } catch {
      enqueueSnackbar('Kopírování odkazu selhalo', { variant: 'error' });
    }
  };

  const handlePinClick = () => { closeMenu(); onPin?.(); };
  const handleExpandClick = () => { closeMenu(); onExpand?.(); };
  const handlePopOutClick = () => { closeMenu(); onPopOut?.(); };
  const handleDeleteClick = () => { closeMenu(); setConfirmDelete(true); };

  const handleDeleteConfirm = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        enqueueSnackbar(`Úkol ${task.key} smazán`, { variant: 'success' });
        setConfirmDelete(false);
        onClose?.();
      },
      onError: () => {
        enqueueSnackbar('Smazání úkolu selhalo', { variant: 'error' });
      },
    });
  };

  return (
    <Stack direction="row" spacing={1} sx={{ px: { xs: 1.5, md: 2 }, py: 1, alignItems: 'center',
      borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', flexWrap: 'wrap' }}>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
        <Stack sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: proj?.color ?? '#64748b',
          alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '13px', fontWeight: 700 }}>{proj?.key[0]}</Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          component={RouterLink}
          to={`/projects/${proj?.key ?? task.key.split('-')[0]}/board`}
          sx={{ textDecoration: 'none',
            '&:hover': { color: 'text.primary', textDecoration: 'underline' } }}
        >
          {proj?.name}
        </Typography>
        <Box component="span" sx={{ color: 'text.disabled', display: 'inline-flex' }}><CaretRIcon/></Box>
        <TypeIcon type={task.type} size={13}/>
        <Typography
          variant="caption"
          color="text.secondary"
          component={RouterLink}
          to={`/task/${task.key}`}
          sx={{ fontFamily: 'ui-monospace, monospace',
            textDecoration: 'none',
            '&:hover': { color: 'text.primary', textDecoration: 'underline' } }}
        >
          {task.key}
        </Typography>
      </Stack>

      <Box sx={{ flex: 1 }}/>

      {canEdit && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ClockIcon/>}
          onClick={handleTimerClick}
          disabled={timerPending}
        >
          {isThisTaskRunning ? 'Stopnout timer' : 'Spustit timer'}
        </Button>
      )}

      <Tooltip title={isWatching ? 'Přestat sledovat' : 'Sledovat'}>
        <span>
          <IconButton
            size="small"
            onClick={handleWatchClick}
            disabled={toggleWatch.isPending}
            sx={{ color: isWatching ? 'primary.main' : 'text.secondary' }}
            aria-pressed={isWatching}
            aria-label={isWatching ? 'Přestat sledovat' : 'Sledovat'}
          >
            {isWatching ? <EyeFilledIcon/> : <EyeIcon/>}
          </IconButton>
        </span>
      </Tooltip>

      {onPopOut && (
        <Tooltip title="Otevřít v novém okně">
          <IconButton size="small" onClick={onPopOut} aria-label="Otevřít v novém okně">
            <OpenInNewIcon/>
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title="Více akcí">
        <IconButton
          size="small"
          onClick={e => setMoreAnchor(e.currentTarget)}
          aria-haspopup="menu"
          aria-expanded={moreOpen}
          aria-label="Více akcí"
        >
          <MoreIcon/>
        </IconButton>
      </Tooltip>

      {onClose && (
        <Tooltip title="Zavřít">
          <IconButton size="small" onClick={onClose} aria-label="Zavřít"><CloseIcon/></IconButton>
        </Tooltip>
      )}

      <Menu
        anchorEl={moreAnchor}
        open={moreOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 240 } } }}
      >
        <MenuItem onClick={handleCopyLink} sx={{ gap: 1 }}>
          <ListItemIcon sx={{ minWidth: 26, color: 'text.secondary' }}><LinkIcon/></ListItemIcon>
          Kopírovat odkaz
          <Box sx={{ ml: 'auto', pl: 2, fontSize: '11px', fontFamily: 'ui-monospace, monospace', color: 'text.disabled' }}>
            ⌘⇧C
          </Box>
        </MenuItem>
        {onPopOut && (
          <MenuItem onClick={handlePopOutClick} sx={{ gap: 1 }}>
            <ListItemIcon sx={{ minWidth: 26, color: 'text.secondary' }}><OpenInNewIcon/></ListItemIcon>
            Otevřít v novém okně
          </MenuItem>
        )}
        {onPin && (
          <MenuItem onClick={handlePinClick} sx={{ gap: 1 }}>
            <ListItemIcon sx={{ minWidth: 26, color: pinned ? 'primary.main' : 'text.secondary' }}>
              {pinned ? <PinFilledIcon/> : <PinIcon/>}
            </ListItemIcon>
            {pinned ? 'Odepnout' : 'Připnout panel'}
          </MenuItem>
        )}
        {onExpand && (
          <MenuItem onClick={handleExpandClick} sx={{ gap: 1 }}>
            <ListItemIcon sx={{ minWidth: 26, color: 'text.secondary' }}>
              {expanded ? <CollapseIcon/> : <ExpandIcon/>}
            </ListItemIcon>
            {expanded ? 'Sbalit' : 'Plné okno'}
          </MenuItem>
        )}
        <Divider sx={{ my: 0.5 }}/>
        <Tooltip title="Bude brzy" placement="left">
          <span>
            <MenuItem disabled sx={{ gap: 1 }}>
              <ListItemIcon sx={{ minWidth: 26 }}><DuplicateIcon/></ListItemIcon>
              Duplikovat task
            </MenuItem>
          </span>
        </Tooltip>
        <Tooltip title="Bude brzy" placement="left">
          <span>
            <MenuItem disabled sx={{ gap: 1 }}>
              <ListItemIcon sx={{ minWidth: 26 }}><MoveIcon/></ListItemIcon>
              Přesunout do…
            </MenuItem>
          </span>
        </Tooltip>
        <Tooltip title="Bude brzy" placement="left">
          <span>
            <MenuItem disabled sx={{ gap: 1 }}>
              <ListItemIcon sx={{ minWidth: 26 }}><ConvertIcon/></ListItemIcon>
              Konvertovat na subtask
            </MenuItem>
          </span>
        </Tooltip>
        {canEdit && [
          <Divider key="del-div" sx={{ my: 0.5 }}/>,
          <MenuItem
            key="del-item"
            onClick={handleDeleteClick}
            sx={{ gap: 1, color: 'error.main' }}
          >
            <ListItemIcon sx={{ minWidth: 26, color: 'error.main' }}><DeleteIcon/></ListItemIcon>
            Smazat task
          </MenuItem>,
        ]}
      </Menu>

      {pendingWorklog && (
        <WorklogDialog
          open
          taskId={pendingWorklog.taskId}
          taskKey={pendingWorklog.taskKey}
          defaultMinutes={Math.round(pendingWorklog.elapsedSeconds / 60)}
          onClose={() => setPendingWorklog(null)}
        />
      )}

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Smazat úkol {task.key}?
        </DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="text.secondary">
            Tato akce je nevratná. Úkol „{task.title}" bude trvale odstraněn.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setConfirmDelete(false)} disabled={deleteTask.isPending}>
            Zrušit
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteTask.isPending}
          >
            Smazat
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

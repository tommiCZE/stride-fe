import { useState } from 'react';
import {
  Box, Button, IconButton, Tooltip, Typography, useTheme,
  Menu, MenuItem, ListItemIcon, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import TypeIcon from '../../../components/icons/type-icon';
import {
  CaretRIcon, ClockIcon, PinIcon, PinFilledIcon,
  ExpandIcon, CollapseIcon, LinkIcon, MoreIcon, CloseIcon,
  EyeIcon, EyeFilledIcon,
  DeleteIcon, DuplicateIcon, MoveIcon, ConvertIcon,
} from '../../../components/icons/icons';
import { useIsWatching, useToggleWatch } from '../../../hooks/useWatchers';
import { usePermissions } from '../../../hooks/usePermissions';
import { useDeleteTask } from '../../../hooks/useTasks';
import type { TaskDto, ProjectDto } from '../../../api/types';

interface Props {
  task: TaskDto;
  proj: ProjectDto | undefined;
  timer: { taskKey: string | null; running: boolean };
  pinned?: boolean;
  expanded?: boolean;
  onPin?: () => void;
  onExpand?: () => void;
  onClose?: () => void;
  onStartTimer: (key: string) => void;
}

export default function TaskDetailHeader({ task, proj, timer, pinned, expanded, onPin, onExpand, onClose, onStartTimer }: Props) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isWatching = useIsWatching(task.id);
  const toggleWatch = useToggleWatch(task.id);
  const { canEdit } = usePermissions();
  const deleteTask = useDeleteTask(task.projectId);

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
    <Box sx={{ px: { xs: 1.5, md: 2 }, py: 1, display: 'flex', alignItems: 'center', gap: 1,
      borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: proj?.color ?? '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13, fontWeight: 700 }}>{proj?.key[0]}</Box>
        <Typography
          component={RouterLink}
          to={`/projects/${proj?.key ?? task.key.split('-')[0]}/board`}
          sx={{ fontSize: 13, color: 'text.secondary', textDecoration: 'none',
            '&:hover': { color: 'text.primary', textDecoration: 'underline' } }}
        >
          {proj?.name}
        </Typography>
        <CaretRIcon style={{ color: theme.palette.text.disabled }}/>
        <TypeIcon type={task.type} size={13}/>
        <Typography
          component={RouterLink}
          to={`/task/${task.key}`}
          sx={{ fontSize: 13, color: 'text.secondary', fontFamily: 'ui-monospace, monospace',
            textDecoration: 'none',
            '&:hover': { color: 'text.primary', textDecoration: 'underline' } }}
        >
          {task.key}
        </Typography>
      </Box>

      <Box sx={{ flex: 1 }}/>

      {canEdit && (
        <Button size="small" variant="outlined" startIcon={<ClockIcon/>} onClick={() => onStartTimer(task.key)}>
          {timer.taskKey === task.key && timer.running ? 'Stopnout timer' : 'Spustit timer'}
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
        <MenuItem onClick={handleCopyLink} sx={{ fontSize: 13, gap: 1 }}>
          <ListItemIcon sx={{ minWidth: 26, color: 'text.secondary' }}><LinkIcon/></ListItemIcon>
          Kopírovat odkaz
          <Box sx={{ ml: 'auto', pl: 2, fontSize: 11, fontFamily: 'ui-monospace, monospace', color: 'text.disabled' }}>
            ⌘⇧C
          </Box>
        </MenuItem>
        {onPin && (
          <MenuItem onClick={handlePinClick} sx={{ fontSize: 13, gap: 1 }}>
            <ListItemIcon sx={{ minWidth: 26, color: pinned ? 'primary.main' : 'text.secondary' }}>
              {pinned ? <PinFilledIcon/> : <PinIcon/>}
            </ListItemIcon>
            {pinned ? 'Odepnout' : 'Připnout panel'}
          </MenuItem>
        )}
        {onExpand && (
          <MenuItem onClick={handleExpandClick} sx={{ fontSize: 13, gap: 1 }}>
            <ListItemIcon sx={{ minWidth: 26, color: 'text.secondary' }}>
              {expanded ? <CollapseIcon/> : <ExpandIcon/>}
            </ListItemIcon>
            {expanded ? 'Sbalit' : 'Plné okno'}
          </MenuItem>
        )}
        <Divider sx={{ my: 0.5 }}/>
        <Tooltip title="Bude brzy" placement="left">
          <span>
            <MenuItem disabled sx={{ fontSize: 13, gap: 1 }}>
              <ListItemIcon sx={{ minWidth: 26 }}><DuplicateIcon/></ListItemIcon>
              Duplikovat task
            </MenuItem>
          </span>
        </Tooltip>
        <Tooltip title="Bude brzy" placement="left">
          <span>
            <MenuItem disabled sx={{ fontSize: 13, gap: 1 }}>
              <ListItemIcon sx={{ minWidth: 26 }}><MoveIcon/></ListItemIcon>
              Přesunout do…
            </MenuItem>
          </span>
        </Tooltip>
        <Tooltip title="Bude brzy" placement="left">
          <span>
            <MenuItem disabled sx={{ fontSize: 13, gap: 1 }}>
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
            sx={{ fontSize: 13, gap: 1, color: 'error.main' }}
          >
            <ListItemIcon sx={{ minWidth: 26, color: 'error.main' }}><DeleteIcon/></ListItemIcon>
            Smazat task
          </MenuItem>,
        ]}
      </Menu>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 600 }}>
          Smazat úkol {task.key}?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            Tato akce je nevratná. Úkol „{task.title}" bude trvale odstraněn.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
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
    </Box>
  );
}

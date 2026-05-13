import { Box, Button, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import TypeIcon from '../../../components/icons/type-icon';
import {
  CaretRIcon, ClockIcon, PinIcon, PinFilledIcon,
  ExpandIcon, CollapseIcon, LinkIcon, MoreIcon, CloseIcon,
  EyeIcon, EyeFilledIcon,
} from '../../../components/icons/icons';
import { useIsWatching, useToggleWatch } from '../../../hooks/useWatchers';
import type { TaskDto, ProjectDto } from '../../../api/types';

interface Props {
  task: TaskDto;
  proj: ProjectDto | undefined;
  timer: { taskKey: string | null; running: boolean };
  pinned: boolean;
  expanded: boolean;
  onPin: () => void;
  onExpand: () => void;
  onClose: () => void;
  onStartTimer: (key: string) => void;
}

function CopyLinkButton({ taskId }: { taskId: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const handleCopy = async () => {
    const url = `${window.location.origin}${window.location.pathname}?task=${taskId}`;
    try {
      await navigator.clipboard.writeText(url);
      enqueueSnackbar('Odkaz zkopírován', { variant: 'success' });
    } catch {
      enqueueSnackbar('Kopírování odkazu selhalo', { variant: 'error' });
    }
  };
  return (
    <Tooltip title="Kopírovat odkaz">
      <IconButton size="small" onClick={handleCopy}><LinkIcon/></IconButton>
    </Tooltip>
  );
}

export default function TaskDetailHeader({ task, proj, timer, pinned, expanded, onPin, onExpand, onClose, onStartTimer }: Props) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isWatching = useIsWatching(task.id);
  const toggleWatch = useToggleWatch(task.id);

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

  return (
    <Box sx={{ px: { xs: 1.5, md: 2 }, py: 1, display: 'flex', alignItems: 'center', gap: 1,
      borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: proj?.color ?? '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 9.5, fontWeight: 700 }}>{proj?.key[0]}</Box>
        <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{proj?.name}</Typography>
        <CaretRIcon style={{ color: theme.palette.text.disabled }}/>
        <TypeIcon type={task.type} size={13}/>
        <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontFamily: 'ui-monospace, monospace' }}>{task.key}</Typography>
      </Box>
      <Box sx={{ flex: 1 }}/>
      <Button size="small" variant="outlined" startIcon={<ClockIcon/>} onClick={() => onStartTimer(task.key)}>
        {timer.taskKey === task.key && timer.running ? 'Stopnout timer' : 'Spustit timer'}
      </Button>
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
      <Tooltip title={pinned ? 'Odepnout' : 'Připnout panel'}>
        <IconButton size="small" onClick={onPin} sx={{ color: pinned ? 'primary.main' : 'text.secondary' }}>
          {pinned ? <PinFilledIcon/> : <PinIcon/>}
        </IconButton>
      </Tooltip>
      <Tooltip title={expanded ? 'Sbalit' : 'Celé okno'}>
        <IconButton size="small" onClick={onExpand}>
          {expanded ? <CollapseIcon/> : <ExpandIcon/>}
        </IconButton>
      </Tooltip>
      <CopyLinkButton taskId={task.id}/>
      <IconButton size="small"><MoreIcon/></IconButton>
      <IconButton size="small" onClick={onClose}><CloseIcon/></IconButton>
    </Box>
  );
}

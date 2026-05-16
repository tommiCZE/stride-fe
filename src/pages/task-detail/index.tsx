import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, useMediaQuery } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useTaskByKey, useUpdateTask } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { useUiStore } from '../../store/ui-store';
import QueryError from '../../components/query-error/QueryError';
import TaskDetailHeader from './components/task-detail-header';
import TaskDetailBody from './task-detail-body';
import type { TaskDetailTab } from './components/task-detail-tabs';
import type { UpdateTaskRequest } from '../../api/types';

const DetailOverlay = styled(Box, {
  shouldForwardProp: p => p !== 'isFullscreen',
})<{ isFullscreen: boolean }>(({ theme, isFullscreen }) => ({
  position: 'fixed',
  inset: 0,
  zIndex: 1300,
  display: 'flex',
  justifyContent: isFullscreen ? 'stretch' : 'flex-end',
  backgroundColor: isFullscreen ? 'transparent' : alpha(theme.palette.common.black, 0.5),
}));

const DetailPanel = styled(Box, {
  shouldForwardProp: p => p !== 'isFullscreen' && p !== 'panelWidth',
})<{ isFullscreen: boolean; panelWidth: number }>(({ theme, isFullscreen, panelWidth }) => ({
  position: 'relative',
  width: isFullscreen ? '100%' : panelWidth,
  height: '100%',
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: isFullscreen ? 'none' : `-12px 0 40px ${alpha(theme.palette.common.black, 0.3)}`,
}));

const ResizeHandle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 6,
  cursor: 'col-resize',
  zIndex: 1,
  transition: 'background-color 0.15s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.35),
  },
}));

export default function TaskDetail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { timer, startTimer } = useUiStore();
  const isMobile = useMediaQuery((t: Theme) => t.breakpoints.down('md'));
  const { enqueueSnackbar } = useSnackbar();

  const taskKey = searchParams.get('task');
  const closeTask = () => setSearchParams({});

  const [pinned, setPinned] = useState(() => localStorage.getItem('stride-detail-pinned') === '1');
  const [expanded, setExpanded] = useState(false);
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    const saved = localStorage.getItem('stride-detail-width');
    return saved ? Number(saved) : 900;
  });
  const [tab, setTab] = useState<TaskDetailTab>('comments');

  const { data: task, isLoading, isError: taskError, error: taskErrorObj, refetch: refetchTask } = useTaskByKey(taskKey ?? '');
  const { data: projects = [] } = useProjects();
  const updateTaskMutation = useUpdateTask(task?.projectId);

  const patchTask = (patch: UpdateTaskRequest, opts?: { successMessage?: string }) => {
    if (!task) return;
    updateTaskMutation.mutate(
      { id: task.id, body: patch },
      opts?.successMessage
        ? { onSuccess: () => enqueueSnackbar(opts.successMessage!, { variant: 'success' }) }
        : undefined,
    );
  };

  useEffect(() => { setTab('comments'); }, [taskKey]);

  useEffect(() => {
    localStorage.setItem('stride-detail-pinned', pinned ? '1' : '0');
  }, [pinned]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeTask(); };
    globalThis.addEventListener('keydown', handler);
    return () => globalThis.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      const next = Math.min(
        Math.max(startWidth + (startX - ev.clientX), 400),
        window.innerWidth * 0.97,
      );
      setPanelWidth(next);
    };

    const onUp = () => {
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      setPanelWidth(prev => {
        localStorage.setItem('stride-detail-width', String(prev));
        return prev;
      });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  if (!taskKey) return null;

  const proj = projects.find(p => p.id === task?.projectId);
  const isFullscreen = isMobile || expanded;

  return (
    <DetailOverlay isFullscreen={isFullscreen} onClick={pinned || isFullscreen ? undefined : closeTask}>
      <DetailPanel isFullscreen={isFullscreen} panelWidth={panelWidth} onClick={e => e.stopPropagation()}>
        {!isFullscreen && <ResizeHandle onMouseDown={handleResizeStart} />}

        {taskError ? (
          <QueryError error={taskErrorObj} onRetry={() => { void refetchTask(); }} />
        ) : isLoading || !task ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress/>
          </Box>
        ) : (
          <>
            <TaskDetailHeader
              task={task}
              proj={proj}
              timer={timer}
              pinned={pinned}
              expanded={expanded}
              onPin={() => setPinned(p => !p)}
              onExpand={() => setExpanded(e => !e)}
              onClose={closeTask}
              onStartTimer={startTimer}
            />
            <TaskDetailBody task={task} proj={proj} tab={tab} onTabChange={setTab} onPatch={patchTask}/>
          </>
        )}
      </DetailPanel>
    </DetailOverlay>
  );
}

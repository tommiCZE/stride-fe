import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, useMediaQuery } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { DEV_DATA } from '../../mocks/data';
import { useTask, useUpdateTask } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { useUiStore } from '../../store/ui-store';
import RichEditor from '../../components/editor/rich-editor';
import { SectionLabel, ColorPill, ColorDot } from '../../components/ui/ui';
import PriorityIcon from '../../components/icons/priority-icon';
import { StatusPicker } from './fields/status-picker';
import { TitleEditor } from './fields/field-editors';
import TaskDetailHeader from './components/task-detail-header';
import TaskDetailTabs from './components/task-detail-tabs';
import TaskDetailSidebar from './components/task-detail-sidebar';
import { PRIORITIES } from '../../constants/priorities';
import { BOARD_STATUSES } from '../../constants/statuses';
import type { UpdateTaskRequest } from '../../api/types';
import type { JSONContent } from '@tiptap/core';
import { attachmentsApi } from '../../api/attachments';

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

  const taskId = searchParams.get('task');
  const closeTask = () => setSearchParams({});

  const [pinned, setPinned] = useState(() => localStorage.getItem('stride-detail-pinned') === '1');
  const [expanded, setExpanded] = useState(false);
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    const saved = localStorage.getItem('stride-detail-width');
    return saved ? Number(saved) : 900;
  });
  const [tab, setTab] = useState<'comments' | 'dev' | 'worklog' | 'activity' | 'attachments'>('comments');

  const { data: task, isLoading } = useTask(taskId ?? '');
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

  useEffect(() => { setTab('comments'); }, [taskId]);

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

  if (!taskId) return null;

  const proj = projects.find(p => p.id === task?.projectId);
  const prio = PRIORITIES.find(p => p.id === task?.priority);
  const isFullscreen = isMobile || expanded;
  const dev = task ? DEV_DATA[task.key] : null;
  const devCount = dev ? dev.branches.length + dev.pulls.length + dev.commits.length : 0;

  return (
    <DetailOverlay isFullscreen={isFullscreen} onClick={pinned || isFullscreen ? undefined : closeTask}>
      <DetailPanel isFullscreen={isFullscreen} panelWidth={panelWidth} onClick={e => e.stopPropagation()}>
        {!isFullscreen && <ResizeHandle onMouseDown={handleResizeStart} />}

        {isLoading || !task ? (
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

            <Box sx={{ flex: 1, display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 300px', lg: '1fr 320px' }, minHeight: 0 }}>

              <Box sx={{ overflowY: 'auto', p: 3 }}>
                <TitleEditor title={task.title} onChange={title => patchTask({ title })}/>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2, flexWrap: 'wrap' }}>
                  <StatusPicker
                    statusId={task.status}
                    onChange={status => {
                      const name = BOARD_STATUSES.find(s => s.id === status)?.name ?? status;
                      patchTask({ status }, { successMessage: `Status změněn na "${name}"` });
                    }}
                  />
                  {prio && (
                    <ColorPill pillColor={prio.color}>
                      <PriorityIcon priority={task.priority}/> {prio.name}
                    </ColorPill>
                  )}
                  {task.epicId && proj && (
                    <ColorPill pillColor="#a855f7">
                      <ColorDot dotColor="#a855f7"/>{task.epicId}
                    </ColorPill>
                  )}
                </Box>
                <SectionLabel sx={{ mb: 0.75 }}>Popis</SectionLabel>
                <RichEditor
                  blocks={task.description ?? ''}
                  showToggle
                  onSave={(json: JSONContent) => patchTask({ description: JSON.stringify(json) })}
                  onUploadImage={(file) => attachmentsApi.uploadImage(task.id, file)}
                />
                <TaskDetailTabs task={task} tab={tab} devCount={devCount} onChange={setTab}/>
              </Box>

              <TaskDetailSidebar task={task} onPatch={patchTask}/>
            </Box>
          </>
        )}
      </DetailPanel>
    </DetailOverlay>
  );
}

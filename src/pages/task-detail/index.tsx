import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, useMediaQuery } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { TASKS, DEV_DATA, getUser, getProject, getPriority, getEpic } from '../../mocks/data';
import { useUiStore } from '../../store/ui-store';
import RichEditor from '../../components/editor/rich-editor';
import { SectionLabel, ColorPill, ColorDot } from '../../components/ui/ui';
import PriorityIcon from '../../components/icons/priority-icon';
import { StatusPicker } from './fields/status-picker';
import { TitleEditor } from './fields/field-editors';
import TaskDetailHeader from './components/task-detail-header';
import TaskSubtasks from './components/task-subtasks';
import TaskDetailTabs from './components/task-detail-tabs';
import TaskDetailSidebar from './components/task-detail-sidebar';
import type { Task } from '../../types';

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
  shouldForwardProp: p => p !== 'isFullscreen',
})<{ isFullscreen: boolean }>(({ theme, isFullscreen }) => ({
  width: isFullscreen ? '100%' : 'min(1100px, 96vw)',
  height: '100%',
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: isFullscreen ? 'none' : `-12px 0 40px ${alpha(theme.palette.common.black, 0.3)}`,
}));

export default function TaskDetail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { timer, startTimer } = useUiStore();
  const isMobile = useMediaQuery((t: Theme) => t.breakpoints.down('md'));

  const taskId = searchParams.get('task');
  const closeTask = () => setSearchParams({});

  const [pinned, setPinned] = useState(() => localStorage.getItem('stride-detail-pinned') === '1');
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<'comments' | 'dev' | 'worklog' | 'activity'>('comments');
  const [localTask, setLocalTask] = useState<Task | null>(() => TASKS.find(t => t.id === taskId) ?? null);

  const updateTask = (fn: (t: Task) => Task) =>
    setLocalTask(prev => prev ? fn(prev) : null);

  useEffect(() => {
    setLocalTask(TASKS.find(t => t.id === taskId) ?? null);
    setTab('comments');
  }, [taskId]);

  useEffect(() => {
    localStorage.setItem('stride-detail-pinned', pinned ? '1' : '0');
  }, [pinned]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeTask(); };
    globalThis.addEventListener('keydown', handler);
    return () => globalThis.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!taskId || !localTask) return null;

  const t = localTask;
  const proj     = getProject(t.project)!;
  const prio     = getPriority(t.priority)!;
  const epic     = t.epic ? getEpic(t.epic) : null;
  const reporter = t.reporter ? getUser(t.reporter) ?? null : null;
  const isFullscreen = isMobile || expanded;
  const dev = DEV_DATA[t.key];
  const devCount = dev ? dev.branches.length + dev.pulls.length + dev.commits.length : 0;

  return (
    <DetailOverlay isFullscreen={isFullscreen} onClick={pinned || isFullscreen ? undefined : closeTask}>
      <DetailPanel isFullscreen={isFullscreen} onClick={e => e.stopPropagation()}>

        <TaskDetailHeader
          task={t}
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
            <TitleEditor title={t.title} onChange={title => updateTask(prev => ({ ...prev, title }))}/>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2, flexWrap: 'wrap' }}>
              <StatusPicker statusId={t.status} onChange={status => updateTask(prev => ({ ...prev, status }))}/>
              <ColorPill pillColor={prio.color}><PriorityIcon priority={t.priority}/> {prio.name}</ColorPill>
              {epic && <ColorPill pillColor={epic.color}><ColorDot dotColor={epic.color}/>{epic.title}</ColorPill>}
            </Box>
            <SectionLabel sx={{ mb: 0.75 }}>Popis</SectionLabel>
            <RichEditor blocks={t.description}/>
            <TaskSubtasks
              subtasks={t.subtasks}
              onToggle={sid => updateTask(prev => ({
                ...prev,
                subtasks: prev.subtasks.map(s => s.id === sid ? { ...s, done: !s.done } : s),
              }))}
            />
            <TaskDetailTabs task={t} tab={tab} devCount={devCount} onChange={setTab}/>
          </Box>

          <TaskDetailSidebar task={t} reporter={reporter} updateTask={updateTask}/>
        </Box>
      </DetailPanel>
    </DetailOverlay>
  );
}

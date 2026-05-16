import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTaskByKey, useUpdateTask } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { useUiStore } from '../../store/ui-store';
import QueryError from '../../components/query-error/QueryError';
import TaskDetailHeader from '../task-detail/components/task-detail-header';
import TaskDetailBody from '../task-detail/task-detail-body';
import type { TaskDetailTab } from '../task-detail/components/task-detail-tabs';
import type { UpdateTaskRequest } from '../../api/types';

export default function TaskPage() {
  const { taskKey = '' } = useParams<{ taskKey: string }>();
  const { timer, startTimer } = useUiStore();
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState<TaskDetailTab>('comments');

  const { data: task, isLoading, isError, error, refetch } = useTaskByKey(taskKey);
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

  if (isError) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <QueryError error={error} onRetry={() => { void refetch(); }} />
      </Box>
    );
  }

  if (isLoading || !task) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress/>
      </Box>
    );
  }

  const proj = projects.find(p => p.id === task.projectId);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, bgcolor: 'background.default' }}>
      <TaskDetailHeader
        task={task}
        proj={proj}
        timer={timer}
        onStartTimer={startTimer}
      />
      <TaskDetailBody task={task} proj={proj} tab={tab} onTabChange={setTab} onPatch={patchTask}/>
    </Box>
  );
}

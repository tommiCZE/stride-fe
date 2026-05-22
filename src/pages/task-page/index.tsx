import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTaskByKey, useUpdateTask } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import QueryError from '../../components/query-error/QueryError';
import TaskDetailHeader from '../task-detail/components/task-detail-header';
import TaskDetailBody from '../task-detail/task-detail-body';
import type { TaskDetailTab } from '../task-detail/components/task-detail-tabs';
import type { UpdateTaskRequest } from '../../api/types';

export default function TaskPage() {
  const { taskKey = '' } = useParams<{ taskKey: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState<TaskDetailTab>('activity');
  const [prevTaskKey, setPrevTaskKey] = useState(taskKey);

  if (prevTaskKey !== taskKey) {
    setPrevTaskKey(taskKey);
    setTab('activity');
  }

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

  if (isError) {
    return (
      <Stack sx={{ height: '100%', minHeight: 0 }}>
        <QueryError error={error} onRetry={() => { void refetch(); }} />
      </Stack>
    );
  }

  if (isLoading || !task) {
    return (
      <Stack sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress/>
      </Stack>
    );
  }

  const proj = projects.find(p => p.id === task.projectId);

  return (
    <Stack sx={{ height: '100%', minHeight: 0, bgcolor: 'background.default' }}>
      <TaskDetailHeader
        task={task}
        proj={proj}
      />
      <TaskDetailBody task={task} proj={proj} tab={tab} onTabChange={setTab} onPatch={patchTask}/>
    </Stack>
  );
}

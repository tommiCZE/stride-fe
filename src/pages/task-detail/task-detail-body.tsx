import { Box, Stack } from '@mui/material';
import RichEditor from '../../components/editor/rich-editor';
import { SectionLabel } from '../../components/ui/ui';
import PriorityIcon from '../../components/icons/priority-icon';
import { StatusPicker } from './fields/status-picker';
import { TitleEditor } from './fields/field-editors';
import TaskDetailTabs, { type TaskDetailTab } from './components/task-detail-tabs';
import TaskDetailSidebar from './components/task-detail-sidebar';
import Subtasks from './panels/subtasks';
import { PRIORITIES } from '../../constants/priorities';
import { BOARD_STATUSES } from '../../constants/statuses';
import { attachmentsApi } from '../../api/attachments';
import { useTaskRemoteLinks } from '../../hooks/useTaskRemoteLinks';
import type { TaskDto, ProjectDto, UpdateTaskRequest } from '../../api/types';
import type { JSONContent } from '@tiptap/core';

interface Props {
  task: TaskDto;
  proj: ProjectDto | undefined;
  tab: TaskDetailTab;
  onTabChange: (tab: TaskDetailTab) => void;
  onPatch: (patch: UpdateTaskRequest, opts?: { successMessage?: string }) => void;
}

export default function TaskDetailBody({ task, proj, tab, onTabChange, onPatch }: Props) {
  const prio = PRIORITIES.find(p => p.id === task.priority);
  const { data: remoteLinks = [] } = useTaskRemoteLinks(task.id);
  const devCount = remoteLinks.length;

  return (
    <Box sx={{ flex: 1, display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '1fr 300px', lg: '1fr 320px' }, minHeight: 0 }}>

      <Box sx={{ overflowY: 'auto', p: 3 }}>
        <TitleEditor title={task.title} onChange={title => onPatch({ title })}/>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          <StatusPicker
            statusId={task.status}
            onChange={status => {
              const name = BOARD_STATUSES.find(s => s.id === status)?.name ?? status;
              onPatch({ status }, { successMessage: `Status změněn na "${name}"` });
            }}
          />
          {prio && (
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              px: 1, py: 0.4, borderRadius: 999,
              border: 1, borderColor: 'divider',
              fontSize: '12px', color: 'text.secondary',
            }}>
              <PriorityIcon priority={task.priority}/> {prio.name}
            </Box>
          )}
          {task.epicId && proj && (
            <Box sx={{
              display: 'inline-flex', alignItems: 'center',
              px: 1, py: 0.4, borderRadius: 999,
              border: 1, borderColor: 'divider',
              fontSize: '12px', fontFamily: 'ui-monospace, monospace', color: 'text.secondary',
            }}>
              {task.epicId}
            </Box>
          )}
        </Stack>
        <SectionLabel sx={{ mb: 0.75 }}>Popis</SectionLabel>
        <RichEditor
          blocks={task.description ?? ''}
          showToggle
          onSave={(json: JSONContent) => onPatch({ description: JSON.stringify(json) })}
          onUploadImage={(file) => attachmentsApi.uploadImage(task.id, file)}
        />
        <Subtasks taskId={task.id}/>
        <TaskDetailTabs task={task} tab={tab} devCount={devCount} onChange={onTabChange}/>
      </Box>

      <TaskDetailSidebar task={task} onPatch={onPatch}/>
    </Box>
  );
}

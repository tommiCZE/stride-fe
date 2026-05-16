import { Box } from '@mui/material';
import { Comments } from '../panels/comments';
import { DevPanel } from '../panels/dev-panel';
import { Worklog } from '../panels/worklog';
import { TaskActivity } from '../panels/task-activity';
import { Attachments } from '../panels/attachments';
import type { TaskDto } from '../../../api/types';

export type TaskDetailTab = 'comments' | 'dev' | 'worklog' | 'activity' | 'attachments';
type TabKey = TaskDetailTab;

interface Props {
  task: TaskDto;
  tab: TabKey;
  devCount: number;
  onChange: (tab: TabKey) => void;
}

export default function TaskDetailTabs({ task, tab, devCount, onChange }: Props) {
  const tabs: [TabKey, string][] = [
    ['comments',    `Komentáře · ${task.commentCount}`],
    ['attachments', 'Přílohy'],
    ['dev',         devCount > 0 ? `Vývoj · ${devCount}` : 'Vývoj'],
    ['worklog',     `Worklog · ${task.logged}h`],
    ['activity',    'Historie'],
  ];

  return (
    <>
      <Box sx={{ mt: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
        {tabs.map(([k, l]) => (
          <Box key={k} onClick={() => onChange(k)}
            sx={{ py: 1, fontSize: 12.5, fontWeight: 600, cursor: 'default',
              color: tab === k ? 'primary.main' : 'text.secondary',
              borderBottom: 2, borderColor: tab === k ? 'primary.main' : 'transparent', mb: '-1px' }}>{l}</Box>
        ))}
      </Box>
      <Box sx={{ mt: 2 }}>
        {tab === 'comments'    && <Comments taskId={task.id}/>}
        {tab === 'attachments' && <Attachments taskId={task.id}/>}
        {tab === 'dev'         && <DevPanel  taskId={task.id} taskKey={task.key} taskTitle={task.title} projectId={task.projectId}/>}
        {tab === 'worklog'     && <Worklog   taskId={task.id}/>}
        {tab === 'activity'    && <TaskActivity taskId={task.id}/>}
      </Box>
    </>
  );
}

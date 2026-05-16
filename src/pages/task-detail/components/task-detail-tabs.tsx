import { Box } from '@mui/material';
import { DevPanel } from '../panels/dev-panel';
import { Attachments } from '../panels/attachments';
import { ActivityStream } from '../panels/activity-stream';
import type { TaskDto } from '../../../api/types';

export type TaskDetailTab = 'activity' | 'attachments' | 'dev';
type TabKey = TaskDetailTab;

interface Props {
  task: TaskDto;
  tab: TabKey;
  devCount: number;
  onChange: (tab: TabKey) => void;
}

export default function TaskDetailTabs({ task, tab, devCount, onChange }: Props) {
  const tabs: [TabKey, string][] = [
    ['activity',    `Aktivita · ${task.commentCount}`],
    ['attachments', 'Přílohy'],
    ['dev',         devCount > 0 ? `Vývoj · ${devCount}` : 'Vývoj'],
  ];

  return (
    <>
      <Box sx={{ mt: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
        {tabs.map(([k, l]) => (
          <Box key={k} onClick={() => onChange(k)}
            sx={{ py: 1, fontSize: 14, fontWeight: 600, cursor: 'default',
              color: tab === k ? 'primary.main' : 'text.secondary',
              borderBottom: 2, borderColor: tab === k ? 'primary.main' : 'transparent', mb: '-1px' }}>{l}</Box>
        ))}
      </Box>
      <Box sx={{ mt: 2 }}>
        {tab === 'activity'    && <ActivityStream taskId={task.id}/>}
        {tab === 'attachments' && <Attachments    taskId={task.id}/>}
        {tab === 'dev'         && <DevPanel       taskId={task.id} taskKey={task.key} taskTitle={task.title} projectId={task.projectId}/>}
      </Box>
    </>
  );
}

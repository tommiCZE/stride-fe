import { Box, Stack } from '@mui/material';
import { ActivityStream } from '../panels/activity-stream';
import { WorklogPanel } from '../panels/worklog-panel';
import type { TaskDto } from '../../../api/types';

export type TaskDetailTab = 'activity' | 'worklog';
type TabKey = TaskDetailTab;

interface Props {
  task: TaskDto;
  tab: TabKey;
  onChange: (tab: TabKey) => void;
}

export default function TaskDetailTabs({ task, tab, onChange }: Props) {
  const tabs: [TabKey, string][] = [
    ['activity', `Aktivita · ${task.commentCount}`],
    ['worklog',  `Worklog · ${task.logged.toFixed(1)}h`],
  ];

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mt: 3, borderBottom: 1, borderColor: 'divider' }}>
        {tabs.map(([k, l]) => (
          <Box key={k} onClick={() => onChange(k)}
            sx={{ py: 1, fontSize: '14px', fontWeight: 600, cursor: 'default',
              color: tab === k ? 'primary.main' : 'text.secondary',
              borderBottom: 2, borderColor: tab === k ? 'primary.main' : 'transparent', mb: '-1px' }}>{l}</Box>
        ))}
      </Stack>
      <Box sx={{ mt: 2 }}>
        {tab === 'activity' && <ActivityStream taskId={task.id}/>}
        {tab === 'worklog'  && <WorklogPanel   taskId={task.id}/>}
      </Box>
    </>
  );
}

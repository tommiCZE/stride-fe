import { Box, Stack } from '@mui/material';
import type { TaskSummaryDto } from '../api/types';

interface Props {
  tasks: Pick<TaskSummaryDto, 'status'>[];
  width?: number | string;
  height?: number;
}

export default function ReleaseScopeStrip({ tasks, width = '100%', height = 6 }: Props) {
  let done = 0, inProgress = 0, todo = 0;
  for (const t of tasks) {
    if (t.status === 'DONE') done++;
    else if (t.status === 'IN_PROGRESS' || t.status === 'REVIEW') inProgress++;
    else todo++;
  }
  const total = tasks.length;
  if (total === 0) return null;

  return (
    <Stack direction="row" spacing={0.25} sx={{
      height, width, borderRadius: 999, overflow: 'hidden', bgcolor: 'action.hover',
    }}>
      {done > 0       && <Box sx={{ flex: done,       bgcolor: 'success.main'  }}/>}
      {inProgress > 0 && <Box sx={{ flex: inProgress, bgcolor: 'info.main'     }}/>}
      {todo > 0       && <Box sx={{ flex: todo,       bgcolor: 'text.disabled' }}/>}
    </Stack>
  );
}

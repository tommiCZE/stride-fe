import { useState } from 'react';
import { Box, Button, CircularProgress, Stack, Tooltip, Typography } from '@mui/material';
import FluxAvatar from '../../../components/flux-avatar';
import { WorklogComposer } from '../../../components/worklog-composer';
import { useWorklogs } from '../../../hooks/useWorklogs';
import { exactDate } from './comments';
import type { WorklogDto } from '../../../api/types';

function WorklogRow({ worklog }: { worklog: WorklogDto }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
      <FluxAvatar user={worklog.user} size={24}/>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', mb: 0.25, flexWrap: 'wrap' }}>
          <Typography component="span" sx={{ fontSize: '13.5px', fontWeight: 600 }}>
            {worklog.user?.name ?? 'Neznámý uživatel'}
          </Typography>
          <Typography component="span" sx={{ fontSize: '12px', color: 'text.disabled' }}>
            zalogoval{' '}
            <Box component="strong" sx={{ color: 'primary.main', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {(worklog.minutes / 60).toFixed(1)}h
            </Box>
          </Typography>
          <Tooltip title={exactDate(worklog.loggedAt)} placement="top">
            <Typography component="span" sx={{ fontSize: '12px', color: 'text.disabled', cursor: 'help' }}>
              · {exactDate(worklog.loggedAt)}
            </Typography>
          </Tooltip>
        </Stack>
        {worklog.comment && (
          <Typography sx={{ fontSize: '13.5px', color: 'text.primary' }}>
            {worklog.comment}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export function WorklogPanel({ taskId }: { taskId: string }) {
  const { data: worklogs = [], isLoading } = useWorklogs(taskId);
  const [composing, setComposing] = useState(false);

  const totalHours = worklogs.reduce((acc, w) => acc + w.minutes, 0) / 60;
  const sorted = [...worklogs].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
  );

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography sx={{ fontSize: '13.5px', fontWeight: 600 }}>
          Celkem zalogováno:{' '}
          <Box component="strong" sx={{ color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>
            {totalHours.toFixed(1)}h
          </Box>
        </Typography>
        <Box sx={{ flex: 1 }}/>
        <Button
          size="small"
          variant="outlined"
          onClick={() => setComposing(true)}
          disabled={composing}
        >
          + Záznam práce
        </Button>
      </Stack>

      {composing && (
        <WorklogComposer taskId={taskId} onClose={() => setComposing(false)}/>
      )}

      {isLoading && (
        <Stack direction="row" sx={{ justifyContent: 'center', py: 2 }}>
          <CircularProgress size={20}/>
        </Stack>
      )}

      {!isLoading && sorted.length === 0 && (
        <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
          Žádné záznamy práce
        </Typography>
      )}

      <Stack spacing={1.75}>
        {sorted.map(w => <WorklogRow key={w.id} worklog={w}/>)}
      </Stack>
    </Stack>
  );
}

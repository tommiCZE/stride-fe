import { Box, CircularProgress, Typography } from '@mui/material';
import { useActivity } from '../../../hooks/useActivity';
import FluxAvatar from '../../../components/flux-avatar';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'právě teď';
  if (m < 60) return `před ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `před ${h} h`;
  return `před ${Math.floor(h / 24)} d`;
}

export function TaskActivity({ taskId }: { taskId: string }) {
  const { data: items = [], isLoading } = useActivity(taskId);

  if (isLoading) return <CircularProgress size={16}/>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map(it => (
        <Box key={it.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12, color: 'text.secondary' }}>
          <FluxAvatar user={it.user} size={18}/>
          <Typography sx={{ fontSize: 12 }}>
            <b>{it.user.name}</b>{' '}
            {it.action}
            {it.toValue && <> → <b>{it.toValue}</b></>}
          </Typography>
          <Box sx={{ flex: 1 }}/>
          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{timeAgo(it.createdAt)}</Typography>
        </Box>
      ))}
      {items.length === 0 && (
        <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>Žádná aktivita</Typography>
      )}
    </Box>
  );
}

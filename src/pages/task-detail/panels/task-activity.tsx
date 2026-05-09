import { Box, Typography } from '@mui/material';
import { getUser, timeAgo } from '../../../mocks/data';
import FluxAvatar from '../../../components/flux-avatar';

export function TaskActivity() {
  const items = [
    { user: 'u2', text: 'změnil/a status z To Do na In Progress', at: '2026-04-27T14:32:00' },
    { user: 'u2', text: 'logoval/a 2.5h', at: '2026-04-27T13:00:00' },
    { user: 'u1', text: 'přiřadil/a → Jana Nováková', at: '2026-04-26T09:00:00' },
    { user: 'u1', text: 'vytvořil/a task', at: '2026-04-21T09:15:00' },
  ];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((it, i) => {
        const u = getUser(it.user)!;
        return (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12, color: 'text.secondary' }}>
            <FluxAvatar user={u} size={18}/>
            <Typography sx={{ fontSize: 12 }}><b>{u.name}</b> {it.text}</Typography>
            <Box sx={{ flex: 1 }}/>
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{timeAgo(it.at)}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

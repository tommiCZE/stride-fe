import { Box, Typography } from '@mui/material';
import { getUser } from '../../../mocks/data';
import FluxAvatar from '../../../components/flux-avatar';

export function Worklog({ logged: _logged, estimate: _estimate }: { logged: number; estimate: number | null }) {
  const entries = [
    { user: 'u2', date: '2026-04-27', hours: 2.5, note: 'Slash menu UI shell, fuzzy search' },
    { user: 'u2', date: '2026-04-26', hours: 1.5, note: 'Heading / list bloky' },
    { user: 'u2', date: '2026-04-23', hours: 0.5, note: 'Setup TipTap, exploration' },
  ];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {entries.map((e, i) => {
        const u = getUser(e.user)!;
        return (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
            <FluxAvatar user={u} size={20}/>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 500 }}>{e.note}</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{u.name} · {e.date}</Typography>
            </Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'primary.main' }}>{e.hours}h</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

import { Box, Card, Typography } from '@mui/material';
import { useLocation, useSearchParams } from 'react-router-dom';
import { TASKS, ACTIVITY, getUser, getStatus } from '../mocks/data';
import FluxAvatar from '../components/flux-avatar';
import TypeIcon from '../components/icons/type-icon';
import PriorityIcon from '../components/icons/priority-icon';
import { MonoKey, StatusBadge, ColorDot } from '../components/ui/ui';

export default function MyWork() {
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const openTask = (id: string) => setSearchParams({ task: id });
  const isInbox = location.pathname === '/inbox';

  const myTasks = TASKS.filter(t => t.assignee === 'u1');

  if (isInbox) {
    return (
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: 'background.default', height: '100%' }}>
        <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>Inbox</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>3 nová oznámení</Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {ACTIVITY.map(a => {
            const u = getUser(a.user)!;
            return (
              <Card key={a.id} sx={{ borderRadius: 1.5, p: 1.5, cursor: 'default',
                '&:hover': { borderColor: 'primary.main' } }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <FluxAvatar user={u} size={30}/>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, lineHeight: 1.4 }}>
                      <b>{u.name}</b>{' '}
                      <Box component="span" sx={{ color: 'text.secondary' }}>{a.action}</Box>
                      {' '}<Box component="span" sx={{ fontFamily: 'ui-monospace, monospace', color: 'primary.main' }}>{a.target}</Box>
                    </Typography>
                    {a.preview && (
                      <Box sx={{ mt: 0.75, p: 1, borderRadius: 1, bgcolor: 'action.hover',
                        fontSize: 12.5, color: 'text.secondary', borderLeft: 2, borderColor: 'primary.main' }}>
                        {a.preview}
                      </Box>
                    )}
                    <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.5 }}>
                      {new Date(a.at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  <ColorDot dotColor="primary.main" dotSize={8} sx={{ mt: 0.75, bgcolor: 'primary.main' }}/>
                </Box>
              </Card>
            );
          })}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: 'background.default', height: '100%' }}>
      <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>Moje práce</Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>{myTasks.length} přiřazených tasků</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {myTasks.map(t => {
          const status = getStatus(t.status)!;
          return (
            <Box key={t.id} onClick={() => openTask(t.id)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1,
                borderRadius: 1.2, border: 1, borderColor: 'divider', bgcolor: 'background.paper',
                cursor: 'default', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}>
              <PriorityIcon priority={t.priority}/>
              <TypeIcon type={t.type} size={13}/>
              <MonoKey sx={{ minWidth: 72 }}>{t.key}</MonoKey>
              <Typography sx={{ fontSize: 13, flex: 1, minWidth: 0,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</Typography>
              <StatusBadge badgeColor={status.color}>
                <ColorDot dotColor={status.color} dotSize={5}/>
                {status.name}
              </StatusBadge>
              {t.due && (
                <Typography sx={{ fontSize: 11, color: 'text.disabled', minWidth: 60, textAlign: 'right' }}>
                  {new Date(t.due).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

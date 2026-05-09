import { Box, Card, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TASKS, PROJECTS, ACTIVITY, getUser, getStatus } from '../mocks/data';
import FluxAvatar from '../components/flux-avatar';
import TypeIcon from '../components/icons/type-icon';
import PriorityIcon from '../components/icons/priority-icon';
import { PlusIcon } from '../components/icons/icons';

export default function Dashboard() {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const openTask = (id: string) => setSearchParams({ task: id });
  const me = getUser('u1')!;
  const myTasks = TASKS.filter(t => t.assignee === 'u1' || t.reporter === 'u1');

  return (
    <Box sx={{ p: 3, overflowY: 'auto', bgcolor: 'background.default', height: '100%' }}>
      {/* Greeting */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' }}>
          Středa 30. dubna 2026
        </Typography>
        <Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Dobré ráno, {me.name.split(' ')[0]} 👋
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
          Sprint 24 končí dnes večer. Máš 3 nedořešené tasky a 2 čekající code review.
        </Typography>
      </Box>

      {/* Stat cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 1.5, mb: 3 }}>
        {[
          { label: 'Přiřazeno mně',       value: 4,       sub: '2 due tento týden', color: '#5A5BFF' },
          { label: 'V code review',        value: 2,       sub: 'WEB-119, WEB-138',  color: '#a855f7' },
          { label: 'Logged tento týden',   value: '14.5h', sub: 'z plánovaných 32h', color: '#10b981' },
          { label: 'Po termínu',           value: 1,       sub: 'WEB-103',           color: '#ef4444' },
        ].map((s, i) => (
          <Card key={i} sx={{ p: 1.75, borderRadius: 1.5 }}>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 500 }}>{s.label}</Typography>
            <Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: s.color, mt: 0.25 }}>{s.value}</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{s.sub}</Typography>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {/* My work */}
        <Card sx={{ borderRadius: 1.5 }}>
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Moje práce</Typography>
            <Box sx={{ flex: 1 }}/>
            <Typography sx={{ fontSize: 11.5, color: 'primary.main', cursor: 'default' }}>Vše →</Typography>
          </Box>
          {myTasks.slice(0, 6).map(t => {
            const status = getStatus(t.status)!;
            return (
              <Box key={t.id} onClick={() => openTask(t.id)}
                sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1,
                  borderBottom: 1, borderColor: 'divider', cursor: 'default',
                  '&:hover': { bgcolor: 'action.hover' },
                  '&:last-child': { borderBottom: 0 } }}>
                <PriorityIcon priority={t.priority}/>
                <TypeIcon type={t.type} size={13}/>
                <Typography sx={{ fontSize: 11, color: 'text.disabled', fontFamily: 'ui-monospace, monospace', minWidth: 60 }}>{t.key}</Typography>
                <Typography sx={{ fontSize: 12.5, flex: 1, minWidth: 0,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, px: 0.6, py: 0.2,
                  borderRadius: 0.6, bgcolor: alpha(status.color, 0.15),
                  color: status.color, fontSize: 10.5, fontWeight: 600 }}>
                  {status.name}
                </Box>
              </Box>
            );
          })}
        </Card>

        {/* Activity */}
        <Card sx={{ borderRadius: 1.5 }}>
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Aktivita týmu</Typography>
          </Box>
          <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {ACTIVITY.map(a => {
              const u = getUser(a.user)!;
              return (
                <Box key={a.id} sx={{ display: 'flex', gap: 1 }}>
                  <FluxAvatar user={u} size={22}/>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12.5, lineHeight: 1.4 }}>
                      <b>{u.name}</b>{' '}
                      <Box component="span" sx={{ color: 'text.secondary' }}>{a.action}</Box>
                      {' '}<Box component="span" sx={{ fontFamily: 'ui-monospace, monospace', color: 'info.main' }}>{a.target}</Box>
                    </Typography>
                    {a.preview && (
                      <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.25,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.preview}</Typography>
                    )}
                    <Typography sx={{ fontSize: 10.5, color: 'text.disabled', mt: 0.1 }}>
                      {new Date(a.at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Card>

        {/* Projects */}
        <Card sx={{ borderRadius: 1.5, gridColumn: '1 / -1' }}>
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Projekty</Typography>
            <Box sx={{ flex: 1 }}/>
            <Box
              component="button"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5,
                px: 1, py: 0.4, borderRadius: 1, fontSize: 12.5, fontWeight: 500,
                bgcolor: 'transparent', border: '1px solid', borderColor: 'divider',
                color: 'text.secondary', cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' } }}>
              <PlusIcon style={{ width: 12, height: 12 }}/> Nový projekt
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 1.5, p: 1.5 }}>
            {PROJECTS.map(p => {
              const lead = getUser(p.lead)!;
              const pct = (p.tasks - p.open) / p.tasks;
              return (
                <Box key={p.id} onClick={() => navigate(`/projects/${p.id}/board`)}
                  sx={{ p: 1.5, borderRadius: 1.2, border: 1, borderColor: 'divider', cursor: 'default',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: p.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 13, fontWeight: 700 }}>{p.key[0]}</Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.1 }}>{p.name}</Typography>
                      <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>{p.key} · {lead.name}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'action.hover', overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${pct * 100}%`, bgcolor: p.color }}/>
                    </Box>
                    <Typography sx={{ fontSize: 10.5, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
                      {p.tasks - p.open}/{p.tasks}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

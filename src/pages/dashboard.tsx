import { Box, Button, Card, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useAllProjectTasks } from '../hooks/useTasks';
import { useAuthStore } from '../store/auth-store';
import { BOARD_STATUSES } from '../constants/statuses';
import FluxAvatar from '../components/flux-avatar';
import TypeIcon from '../components/icons/type-icon';
import PriorityIcon from '../components/icons/priority-icon';
import { PlusIcon, DashboardIcon } from '../components/icons/icons';
import EmptyState from '../components/empty-state/EmptyState';

export default function Dashboard() {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const openTask = (id: string) => setSearchParams({ task: id });

  const me = useAuthStore(s => s.user);
  const userId = useAuthStore(s => s.userId);
  const { data: projects = [] } = useProjects();
  const { data: allTasks } = useAllProjectTasks(projects.map(p => p.id));
  const myTasks = allTasks.filter(t => t.assigneeId === userId);

  const today = new Date();
  const dateLabel = today.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Box sx={{ p: 3, overflowY: 'auto', bgcolor: 'background.default', height: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' }}>
          {dateLabel}
        </Typography>
        <Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Dobré ráno, {me?.name.split(' ')[0] ?? '…'} 👋
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
          Máš {myTasks.length} přiřazených tasků.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 1.5, mb: 3 }}>
        {[
          { label: 'Přiřazeno mně',       value: myTasks.length,                                                         sub: 'celkem',              color: '#5A5BFF' },
          { label: 'V code review',        value: myTasks.filter(t => t.status === 'IN_REVIEW').length,                   sub: 'čeká na review',      color: '#a855f7' },
          { label: 'Logged celkem',        value: `${allTasks.reduce((s, t) => s + (t.logged ?? 0), 0)}h`,               sub: 've všech projektech', color: '#10b981' },
          { label: 'Po termínu',           value: myTasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'DONE').length, sub: 'přiřazeno mně', color: '#ef4444' },
        ].map((s, i) => (
          <Card key={i} sx={{ p: 1.75, borderRadius: 1.5 }}>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 500 }}>{s.label}</Typography>
            <Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: s.color, mt: 0.25 }}>{s.value}</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{s.sub}</Typography>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Card sx={{ borderRadius: 1.5 }}>
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Moje práce</Typography>
            <Box sx={{ flex: 1 }}/>
            <Typography sx={{ fontSize: 11.5, color: 'primary.main', cursor: 'default' }}>Vše →</Typography>
          </Box>
          {myTasks.slice(0, 6).map(t => {
            const status = BOARD_STATUSES.find(s => s.id === t.status);
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
                {status && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, px: 0.6, py: 0.2,
                    borderRadius: 0.6, bgcolor: alpha(status.color, 0.15),
                    color: status.color, fontSize: 10.5, fontWeight: 600 }}>
                    {status.name}
                  </Box>
                )}
              </Box>
            );
          })}
          {myTasks.length === 0 && (
            <Box sx={{ px: 1.5, py: 2, color: 'text.disabled', fontSize: 12.5, textAlign: 'center' }}>
              Žádné přiřazené tasky
            </Box>
          )}
        </Card>

        <Card sx={{ borderRadius: 1.5 }}>
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Aktivita týmu</Typography>
          </Box>
          <Box sx={{ p: 2, color: 'text.disabled', fontSize: 12.5, textAlign: 'center' }}>
            Globální aktivita není dostupná
          </Box>
        </Card>

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
          {projects.length === 0 ? (
            <EmptyState
              icon={<DashboardIcon />}
              title="Zatím žádné projekty"
              description="Vytvoř svůj první projekt a začni organizovat tasky, sprinty a celý tým na jednom místě."
              action={
                <Button variant="contained" size="small" startIcon={<PlusIcon />}>
                  Nový projekt
                </Button>
              }
            />
          ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 1.5, p: 1.5 }}>
            {projects.map(p => {
              const done = p.taskCount - p.openCount;
              const pct = p.taskCount > 0 ? done / p.taskCount : 0;
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
                      <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>
                        {p.key}{p.lead ? ` · ${p.lead.name}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'action.hover', overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${pct * 100}%`, bgcolor: p.color }}/>
                    </Box>
                    <Typography sx={{ fontSize: 10.5, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
                      {done}/{p.taskCount}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}

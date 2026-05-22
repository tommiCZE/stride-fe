import type { ReactNode } from 'react';
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useAllProjectTasks } from '../hooks/useTasks';
import { useAuthStore } from '../store/auth-store';
import { BOARD_STATUSES } from '../constants/statuses';
import TypeIcon from '../components/icons/type-icon';
import PriorityIcon from '../components/icons/priority-icon';
import { PlusIcon, DashboardIcon } from '../components/icons/icons';
import EmptyState from '../components/empty-state/EmptyState';
import QueryError from '../components/query-error/QueryError';
import ActivityFeed from '../components/activity-feed';
import { taskLinkProps } from '../utils/task-link';

function DashboardCard({ title, action, gridColumn, children }: {
  title: string;
  action?: ReactNode;
  gridColumn?: string;
  children: ReactNode;
}) {
  return (
    <Card sx={{ borderRadius: 1.5, gridColumn }}>
      <Stack direction="row" spacing={1} sx={{ p: 1.5, alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="label">{title}</Typography>
        <Box sx={{ flex: 1 }}/>
        {action}
      </Stack>
      {children}
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const openTask = (key: string) => setSearchParams({ task: key });

  const me = useAuthStore(s => s.user);
  const userId = useAuthStore(s => s.userId);
  const {
    data: projects = [],
    isError: projectsError,
    error: projectsErrorObj,
    refetch: refetchProjects,
  } = useProjects();
  const {
    data: allTasks,
    isError: tasksError,
    error: tasksErrorObj,
    refetch: refetchAllTasks,
  } = useAllProjectTasks(projects.map(p => p.id));
  const myTasks = allTasks.filter(t => t.assigneeId === userId);

  const today = new Date();
  const dateLabel = today.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Box sx={{ p: 3, overflowY: 'auto', bgcolor: 'background.default', height: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.secondary">
          {dateLabel}
        </Typography>
        <Typography variant="h2">
          Dobré ráno, {me?.name.split(' ')[0] ?? '…'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
          Máš {myTasks.length} přiřazených tasků.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 1.5, mb: 3 }}>
        {[
          { label: 'Přiřazeno mně', value: myTasks.length,                                                                                      sub: 'celkem',              signal: false },
          { label: 'V code review', value: myTasks.filter(t => t.status === 'IN_REVIEW').length,                                                 sub: 'čeká na review',      signal: false },
          { label: 'Logged celkem', value: `${allTasks.reduce((s, t) => s + (t.logged ?? 0), 0)}h`,                                              sub: 've všech projektech', signal: false },
          { label: 'Po termínu',    value: myTasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'DONE').length,         sub: 'přiřazeno mně',       signal: true  },
        ].map((s, i) => (
          <Card key={i} sx={{ p: 1.75, borderRadius: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{s.label}</Typography>
            <Typography sx={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-0.02em',
              color: s.signal ? 'error.main' : 'text.primary', mt: 0.25 }}>{s.value}</Typography>
            <Typography variant="caption" color="text.disabled">{s.sub}</Typography>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <DashboardCard
          title="Moje práce"
          action={<Typography variant="caption" color="primary.main" sx={{ cursor: 'default' }}>Vše →</Typography>}
        >
          {tasksError && (
            <Box sx={{ p: 1.5 }}>
              <QueryError
                compact
                error={tasksErrorObj}
                onRetry={() => { void refetchAllTasks(); }}
              />
            </Box>
          )}
          {!tasksError && myTasks.slice(0, 6).map(t => {
            const status = BOARD_STATUSES.find(s => s.id === t.status);
            return (
              <Stack key={t.id} direction="row" spacing={1} {...taskLinkProps(t.key, openTask)}
                sx={{ px: 1.5, py: 1, alignItems: 'center',
                  borderBottom: 1, borderColor: 'divider', cursor: 'default',
                  textDecoration: 'none', color: 'text.primary',
                  '&:hover': { bgcolor: 'action.hover' },
                  '&:last-child': { borderBottom: 0 } }}>
                <PriorityIcon priority={t.priority}/>
                <TypeIcon type={t.type} size={13}/>
                <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'ui-monospace, monospace', minWidth: 60 }}>{t.key}</Typography>
                <Typography variant="body2" sx={{ flex: 1, minWidth: 0,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</Typography>
                {status && (
                  <Stack direction="row" spacing={0.4} sx={{ alignItems: 'center', px: 0.6, py: 0.2,
                    borderRadius: 0.6, bgcolor: alpha(status.color, 0.15),
                    color: status.color }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>{status.name}</Typography>
                  </Stack>
                )}
              </Stack>
            );
          })}
          {!tasksError && myTasks.length === 0 && (
            <Typography variant="body2" color="text.disabled" sx={{ px: 1.5, py: 2, textAlign: 'center' }}>
              Žádné přiřazené tasky
            </Typography>
          )}
        </DashboardCard>

        <DashboardCard title="Aktivita týmu">
          <Box sx={{ p: 1.5, maxHeight: 480, overflowY: 'auto' }}>
            <ActivityFeed limit={20} />
          </Box>
        </DashboardCard>

        <DashboardCard
          title="Projekty"
          gridColumn="1 / -1"
          action={
            <Button size="small" variant="outlined" startIcon={<PlusIcon/>}>
              Nový projekt
            </Button>
          }
        >
          {projectsError ? (
            <Box sx={{ p: 1.5 }}>
              <QueryError
                error={projectsErrorObj}
                onRetry={() => { void refetchProjects(); }}
              />
            </Box>
          ) : projects.length === 0 ? (
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
                  <Box key={p.id} onClick={() => navigate(`/projects/${p.key}/board`)}
                    sx={{ p: 1.5, borderRadius: 1.2, border: 1, borderColor: 'divider', cursor: 'default',
                      '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                      <Stack sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: p.color,
                        alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '13px', fontWeight: 700 }}>{p.key[0]}</Stack>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="label" sx={{ display: 'block', lineHeight: 1.1 }}>{p.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {p.key}{p.lead ? ` · ${p.lead.name}` : ''}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Box sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'action.hover', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${pct * 100}%`, bgcolor: p.color }}/>
                      </Box>
                      <Typography variant="body2" color="text.disabled" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {done}/{p.taskCount}
                      </Typography>
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          )}
        </DashboardCard>
      </Box>
    </Box>
  );
}

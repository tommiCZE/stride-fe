import { Box, Card, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useParams } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useAllProjectTasks } from '../hooks/useTasks';
import { useTeamMembers } from '../hooks/useTeam';
import FluxAvatar from '../components/flux-avatar';
import { CardTitle } from '../components/ui/ui';
import SprintVelocityChart from '../components/charts/SprintVelocityChart';

export default function Reports() {
  const { projectKey } = useParams<{ projectKey: string }>();

  const { data: projects = [] } = useProjects();
  const { data: members = [] } = useTeamMembers();
  const { data: allTasks } = useAllProjectTasks(projects.map(p => p.id));

  const projectId = projectKey ? projects.find(p => p.key === projectKey)?.id : undefined;
  const tasks = projectId ? allTasks.filter(t => t.projectId === projectId) : allTasks;

  const membersById = Object.fromEntries(members.map(u => [u.id, u]));
  const projectsById = Object.fromEntries(projects.map(p => [p.id, p]));

  const byUser: Record<string, number> = {};
  for (const t of tasks) {
    if (t.assigneeId) byUser[t.assigneeId] = (byUser[t.assigneeId] ?? 0) + (t.logged ?? 0);
  }
  const userRows = Object.entries(byUser)
    .map(([uid, h]) => ({ user: membersById[uid], h }))
    .filter(r => r.user)
    .sort((a, b) => b.h - a.h);
  const maxH = Math.max(...userRows.map(r => r.h), 1);

  const byProject: Record<string, number> = {};
  for (const t of allTasks) {
    byProject[t.projectId] = (byProject[t.projectId] ?? 0) + (t.logged ?? 0);
  }
  const projRows = Object.entries(byProject)
    .map(([pid, h]) => ({ project: projectsById[pid], h }))
    .filter(r => r.project)
    .sort((a, b) => b.h - a.h);
  const maxP = Math.max(...projRows.map(r => r.h), 1);

  const days = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
  const weekData = [4, 6, 3.5, 5, 7, 0, 0];
  const maxD = Math.max(...weekData);

  const totalLogged = allTasks.reduce((s, t) => s + (t.logged ?? 0), 0);

  // Use the active project from URL, or fall back to the first available project
  // so the chart still shows something on the global /reports route.
  const velocityProjectId = projectId ?? projects[0]?.id;
  const velocityProject = velocityProjectId ? projectsById[velocityProjectId] : undefined;

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: 'background.default', height: '100%' }}>
      <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', mb: 0.25 }}>
        Reporty času
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>
        Všichni členové týmu · {projects.length} projektů
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3,1fr)' }, gap: 1.5, mb: 3 }}>
        {[
          { label: 'Logged celkem',      value: `${totalLogged}h`, sub: 've všech projektech', color: '#5A5BFF' },
          { label: 'Projekty',           value: projects.length,   sub: 'aktivní',             color: '#10b981' },
          { label: 'Členů týmu',         value: members.length,    sub: 'celkem',              color: '#f59e0b' },
        ].map((s, i) => (
          <Card key={i} sx={{ p: 1.75, borderRadius: 1.5 }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>{s.label}</Typography>
            <Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: s.color, mt: 0.25 }}>{s.value}</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>{s.sub}</Typography>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
        <Card sx={{ borderRadius: 1.5, p: 2 }}>
          <CardTitle sx={{ mb: 1.5 }}>Čas podle člověka</CardTitle>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {userRows.map(r => (
              <Box key={r.user.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FluxAvatar user={r.user} size={20}/>
                <Typography sx={{ fontSize: 14, width: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.user.name}</Typography>
                <Box sx={{ flex: 1, height: 8, bgcolor: 'action.hover', borderRadius: 1, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${(r.h / maxH) * 100}%`, bgcolor: r.user.color, borderRadius: 1 }}/>
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, width: 36, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.h}h</Typography>
              </Box>
            ))}
            {userRows.length === 0 && (
              <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>Žádná data</Typography>
            )}
          </Box>
        </Card>

        <Card sx={{ borderRadius: 1.5, p: 2 }}>
          <CardTitle sx={{ mb: 1.5 }}>Čas podle projektu</CardTitle>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {projRows.map(r => (
              <Box key={r.project.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 18, height: 18, borderRadius: 0.6, bgcolor: r.project.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 14, fontWeight: 700 }}>{r.project.key[0]}</Box>
                <Typography sx={{ fontSize: 14, width: 130 }}>{r.project.name}</Typography>
                <Box sx={{ flex: 1, height: 8, bgcolor: 'action.hover', borderRadius: 1, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${(r.h / maxP) * 100}%`, bgcolor: r.project.color, borderRadius: 1 }}/>
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, width: 36, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.h}h</Typography>
              </Box>
            ))}
            {projRows.length === 0 && (
              <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>Žádná data</Typography>
            )}
          </Box>
        </Card>

        <Card sx={{ borderRadius: 1.5, p: 2, gridColumn: '1 / -1' }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
            <CardTitle>Sprint velocity</CardTitle>
            <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>
              {velocityProject ? `${velocityProject.name} · posledních 6 sprintů` : 'posledních 6 sprintů'}
            </Typography>
          </Box>
          <SprintVelocityChart projectId={velocityProjectId} lastN={6} />
        </Card>

        <Card sx={{ borderRadius: 1.5, p: 2, gridColumn: '1 / -1' }}>
          <CardTitle sx={{ mb: 1.5 }}>Tento týden</CardTitle>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 140, mt: 1 }}>
            {weekData.map((v, i) => (
              <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: 14, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
                  {v > 0 ? `${v}h` : ''}
                </Typography>
                <Box sx={{ width: '100%', height: `${(v / maxD) * 100}%`,
                  background: `linear-gradient(180deg, #5A5BFF, ${alpha('#5A5BFF', 0.6)})`,
                  borderRadius: '4px 4px 0 0', minHeight: 2 }}/>
                <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 600 }}>{days[i]}</Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

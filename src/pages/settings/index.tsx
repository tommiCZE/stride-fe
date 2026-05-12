import { Box, Button, Card, IconButton, TextField, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { GIT_INTEGRATIONS } from '../../mocks/data';
import FluxAvatar from '../../components/flux-avatar';
import { CardTitle } from '../../components/ui/ui';
import { PlusIcon, MoreIcon } from '../../components/icons/icons';
import { IntegrationCard, ProviderLogo } from './integration-card';
import { useProjects } from '../../hooks/useProjects';
import { useTeamMembers } from '../../hooks/useTeam';
import { BOARD_STATUSES } from '../../constants/statuses';

export default function Settings() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: projects = [] } = useProjects();
  const { data: members = [] } = useTeamMembers();
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: 'background.default', height: '100%', maxWidth: 720 }}>
      <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', mb: 2 }}>
        Nastavení projektu
      </Typography>

      <Card sx={{ borderRadius: 1.5, p: 2.5, mb: 2 }}>
        <CardTitle sx={{ mb: 1.5 }}>Obecné</CardTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 2, alignItems: 'center' }}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Název</Typography>
          <TextField size="small" defaultValue={project.name}/>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Klíč</Typography>
          <TextField size="small" defaultValue={project.key} sx={{ width: 140, '& .MuiInputBase-root': { fontFamily: 'ui-monospace, monospace' } }}/>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Lead</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {project.lead && (
              <>
                <FluxAvatar user={project.lead} size={22}/>
                <Typography sx={{ fontSize: 13 }}>{project.lead.name}</Typography>
              </>
            )}
          </Box>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Barva</Typography>
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            {['#6366f1', '#0ea5e9', '#ec4899', '#10b981', '#f59e0b', '#a855f7', '#ef4444'].map(c => (
              <Box key={c} sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: c, cursor: 'default',
                outline: c === project.color ? '2px solid' : 'none', outlineColor: 'text.primary', outlineOffset: 2 }}/>
            ))}
          </Box>
        </Box>
      </Card>

      <Card sx={{ borderRadius: 1.5, p: 2.5, mb: 2 }}>
        <CardTitle sx={{ mb: 1.5 }}>Workflow / sloupce</CardTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {BOARD_STATUSES.map(s => (
            <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.75,
              borderRadius: 1, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box sx={{ color: 'text.disabled', fontSize: 14, userSelect: 'none' }}>≡</Box>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }}/>
              <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{s.name}</Typography>
              {s.wip != null && (
                <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>WIP {s.wip}</Typography>
              )}
              <IconButton size="small"><MoreIcon/></IconButton>
            </Box>
          ))}
          <Button size="small" startIcon={<PlusIcon/>} sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
            Přidat sloupec
          </Button>
        </Box>
      </Card>

      <Card sx={{ borderRadius: 1.5, p: 2.5, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Integrace s Gitem</Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            Propoj branches, PR/MR a commity přímo s tasky.
          </Typography>
        </Box>
        {GIT_INTEGRATIONS.map(ig => <IntegrationCard key={ig.id} ig={ig}/>)}
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
          <Button size="small" variant="outlined" startIcon={<ProviderLogo provider="github" size={14}/>}>Přidat GitHub účet</Button>
          <Button size="small" variant="outlined" startIcon={<ProviderLogo provider="gitlab" size={14}/>}>Přidat GitLab účet</Button>
        </Box>
      </Card>

      <Card sx={{ borderRadius: 1.5, p: 2.5 }}>
        <CardTitle sx={{ mb: 1.5 }}>Členové týmu</CardTitle>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {members.map(u => (
            <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1, py: 0.75 }}>
              <FluxAvatar user={u} size={26}/>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{u.name}</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{u.email}</Typography>
              </Box>
              <Box sx={{ fontSize: 10.5, fontWeight: 600, px: 0.75, py: 0.2, borderRadius: 0.6,
                bgcolor: 'action.hover', color: 'text.secondary', textTransform: 'capitalize' }}>
                {u.workspaceRole.toLowerCase()}
              </Box>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}

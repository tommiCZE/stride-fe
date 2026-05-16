import type { ReactElement } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '../store/ui-store';
import { useProjects } from '../hooks/useProjects';
import { BoardIcon, BacklogIcon, ListIcon, ReportsIcon, SettingsIcon, PlusIcon, CalendarIcon } from '../components/icons/icons';

export default function ProjectTopbar() {
  const navigate = useNavigate();
  const match = useMatch('/projects/:projectKey/:view');
  const nestedMatch = useMatch('/projects/:projectKey/:view/*');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { openCreateModal } = useUiStore();
  const { t } = useTranslation();

  const { data: projects = [] } = useProjects();

  const activeMatch = match ?? nestedMatch;
  if (!activeMatch) return null;

  const { projectKey, view } = activeMatch.params;
  const project = projects.find(p => p.key === projectKey);
  if (!project) return null;

  const tab = (tabView: string, label: string, icon: ReactElement) => {
    const active = view === tabView;
    return (
      <Box key={tabView} onClick={() => navigate(`/projects/${projectKey}/${tabView}`)}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.75,
          borderRadius: 1.2, cursor: 'default', userSelect: 'none', flexShrink: 0,
          color: active ? 'text.primary' : 'text.secondary',
          bgcolor: active ? 'action.selected' : 'transparent',
          fontWeight: active ? 600 : 500, fontSize: 12.5,
          '&:hover': { bgcolor: 'action.hover' } }}>
        {!isMobile && icon}{label}
      </Box>
    );
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper',
      px: { xs: 1.5, md: 2 }, py: 1, minHeight: 52 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 0.5, md: 0 } }}>
        <Box sx={{ width: 22, height: 22, borderRadius: 0.8, bgcolor: project.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 12, fontWeight: 700 }}>{project.key[0]}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.name}</Typography>
          {!isMobile && <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.4 }}>{project.key} · {project.taskCount} {t('project.tasks')}</Typography>}
        </Box>
        <Box
          component="button"
          onClick={openCreateModal}
          sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            px: 1.25, py: 0.5, borderRadius: 1, fontSize: 12.5, fontWeight: 500,
            bgcolor: 'primary.main', color: '#fff', border: 0, cursor: 'pointer', flexShrink: 0,
            '&:hover': { bgcolor: 'primary.dark' },
          }}>
          <PlusIcon style={{ width: 12, height: 12 }}/>
          {isMobile ? 'Task' : t('project.newTask')}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.25, overflowX: 'auto',
        mt: { xs: 0.5, md: 0 },
        '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
        {tab('board',    t('project.board'),    <BoardIcon/>)}
        {tab('backlog',  t('project.backlog'),  <BacklogIcon/>)}
        {tab('list',     t('project.list'),     <ListIcon/>)}
        {tab('releases', t('project.releases'), <CalendarIcon/>)}
        {tab('reports',  t('project.reports'),  <ReportsIcon/>)}
        {tab('settings', t('project.settings'), <SettingsIcon/>)}
      </Box>
    </Box>
  );
}

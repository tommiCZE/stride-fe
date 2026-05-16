import { useMemo, useState, type ReactElement } from 'react';
import { useNavigate, useLocation, useMatch } from 'react-router-dom';
import { Box, Divider, IconButton, ListItemButton, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../hooks/useProjects';
import { useAllProjectTasks } from '../hooks/useTasks';
import { useAuthStore } from '../store/auth-store';
import { useNotificationsStore } from '../store/notifications-store';
import StrideLogoIcon from '../components/icons/stride-logo-icon';
import FluxAvatar from '../components/flux-avatar';
import CountBadge from './count-badge';
import {
  PlusIcon, BellIcon, DashboardIcon, ReportsIcon, SettingsIcon,
  CaretIcon, CheckIcon, TeamIcon, CalendarIcon,
} from '../components/icons/icons';

interface ProjectCounts {
  board: number;
  backlog: number;
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const projectMatch = useMatch('/projects/:projectKey/*');
  const theme = useTheme();
  const { t } = useTranslation();
  const me = useAuthStore(s => s.user);
  const userId = useAuthStore(s => s.userId);
  const unreadCount = useNotificationsStore(s => s.items.filter(i => !i.read).length);
  const [showArchived, setShowArchived] = useState(false);
  const { data: allProjects = [] } = useProjects();
  const projects = useMemo(
    () => allProjects.filter(p => showArchived || !p.archived),
    [allProjects, showArchived],
  );
  const archivedCount = allProjects.filter(p => p.archived).length;

  const projectIds = useMemo(() => projects.map(p => p.id), [projects]);
  const { data: allTasks } = useAllProjectTasks(projectIds);

  const { myWorkCount, perProject } = useMemo(() => {
    const map = new Map<string, ProjectCounts>();
    for (const id of projectIds) map.set(id, { board: 0, backlog: 0 });
    let my = 0;
    for (const t of allTasks) {
      if (t.status === 'DONE') continue;
      const entry = map.get(t.projectId);
      if (entry) {
        entry.board += 1;
        if (!t.sprintId) entry.backlog += 1;
      }
      if (userId && t.assigneeId === userId) my += 1;
    }
    return { myWorkCount: my, perProject: map };
  }, [allTasks, projectIds, userId]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItem = (path: string, label: string, icon: ReactElement, badge?: number) => {
    const active = isActive(path);
    return (
      <ListItemButton key={path} selected={active}
        onClick={() => { navigate(path); onClose?.(); }}
        aria-current={active ? 'page' : undefined}
        aria-label={badge != null ? `${label}, ${badge}` : label}
        sx={{ pl: 1.25, pr: 1, py: 0.5, gap: 1, minHeight: 30 }}>
        <Box aria-hidden="true" sx={{ display: 'flex', alignItems: 'center', color: active ? 'primary.main' : 'text.secondary' }}>{icon}</Box>
        <Typography sx={{ flex: 1, fontSize: 13, fontWeight: active ? 600 : 500,
          color: active ? 'text.primary' : 'text.secondary' }}>{label}</Typography>
        {badge != null && <CountBadge count={badge} />}
      </ListItemButton>
    );
  };

  return (
    <Box
      component="nav"
      role="navigation"
      aria-label={t('nav.projects')}
      sx={{ width: 232, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}
    >
      <Box sx={{ px: 1.5, py: 1.25, display: 'flex', alignItems: 'center', gap: 1, minHeight: 48,
        borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ width: 26, height: 26, borderRadius: 1.2, bgcolor: 'primary.main',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.contrastText' }}>
          <StrideLogoIcon size={16}/>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.1 }}>Stride</Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1.1 }}>Acme s.r.o.</Typography>
        </Box>
        <CaretIcon style={{ color: theme.palette.text.secondary }}/>
      </Box>

      <Box sx={{ p: 0.75 }}>
        {navItem('/dashboard', t('nav.dashboard'), <DashboardIcon/>)}
        {navItem('/inbox',     t('nav.inbox'),     <BellIcon/>,   unreadCount)}
        {navItem('/my-work',   t('nav.myWork'),    <CheckIcon/>,  myWorkCount)}
        {navItem('/calendar',  t('nav.calendar'),  <CalendarIcon/>)}
        {navItem('/reports',   t('nav.reports'),   <ReportsIcon/>)}
        {navItem('/team',      t('nav.team'),      <TeamIcon/>)}
      </Box>

      <Divider/>

      <Box sx={{ p: 0.75, flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.75,
          color: 'text.secondary', userSelect: 'none' }}>
          <CaretIcon/>
          <Typography sx={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', flex: 1 }}>
            {t('nav.projects')}
          </Typography>
          <IconButton size="small" sx={{ p: 0.25 }} aria-label="Vytvořit projekt">
            <PlusIcon/>
          </IconButton>
        </Box>
        {archivedCount > 0 && (
          <Box
            onClick={() => setShowArchived(v => !v)}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.4,
              cursor: 'default', borderRadius: 1, mb: 0.25,
              color: showArchived ? 'text.primary' : 'text.disabled',
              '&:hover': { bgcolor: 'action.hover' } }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, flex: 1 }}>
              {showArchived ? 'Skrýt archivované' : `Zobrazit archivované (${archivedCount})`}
            </Typography>
          </Box>
        )}
        {projects.map(p => {
          const active = projectMatch?.params.projectKey === p.key;
          const counts = perProject.get(p.id) ?? { board: 0, backlog: 0 };
          const boardPath = `/projects/${p.key}/board`;
          const backlogPath = `/projects/${p.key}/backlog`;
          const boardActive = location.pathname === boardPath;
          const backlogActive = location.pathname === backlogPath;
          return (
            <Box key={p.id}>
              <ListItemButton selected={active && !backlogActive}
                onClick={() => { navigate(boardPath); onClose?.(); }}
                aria-current={boardActive ? 'page' : undefined}
                aria-label={`${p.name}, ${counts.board} aktivních úkolů${p.archived ? ', archivováno' : ''}`}
                sx={{ pl: 1, pr: 1, py: 0.5, gap: 1, minHeight: 28,
                  opacity: p.archived ? 0.55 : 1 }}>
                <Box aria-hidden="true" sx={{ width: 18, height: 18, borderRadius: 0.8, bgcolor: p.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'common.white', fontSize: 13, fontWeight: 700 }}>{p.key[0]}</Box>
                <Typography sx={{ fontSize: 14, fontWeight: active ? 600 : 500, flex: 1,
                  color: active ? 'text.primary' : 'text.secondary',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  fontStyle: p.archived ? 'italic' : 'normal' }}>
                  {p.name}{p.archived && <Box component="span" sx={{ fontSize: 14, color: 'text.disabled', ml: 0.5 }}>· archiv</Box>}
                </Typography>
                <CountBadge count={counts.board} variant="muted" />
              </ListItemButton>
              {active && (
                <Box>
                  <ListItemButton selected={boardActive}
                    onClick={() => { navigate(boardPath); onClose?.(); }}
                    aria-current={boardActive ? 'page' : undefined}
                    sx={{ pl: 4, pr: 1, py: 0.25, gap: 1, minHeight: 24 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: boardActive ? 600 : 500, flex: 1,
                      color: boardActive ? 'text.primary' : 'text.secondary' }}>{t('project.board')}</Typography>
                    <CountBadge count={counts.board} variant="muted" />
                  </ListItemButton>
                  <ListItemButton selected={backlogActive}
                    onClick={() => { navigate(backlogPath); onClose?.(); }}
                    aria-current={backlogActive ? 'page' : undefined}
                    sx={{ pl: 4, pr: 1, py: 0.25, gap: 1, minHeight: 24 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: backlogActive ? 600 : 500, flex: 1,
                      color: backlogActive ? 'text.primary' : 'text.secondary' }}>{t('project.backlog')}</Typography>
                    <CountBadge count={counts.backlog} variant="muted" />
                  </ListItemButton>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Divider/>
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FluxAvatar user={me} size={26}/>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.1 }}>{me?.name}</Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1.1 }}>{me?.workspaceRole}</Typography>
        </Box>
        <IconButton size="small" aria-label="Nastavení"><SettingsIcon/></IconButton>
      </Box>
    </Box>
  );
}

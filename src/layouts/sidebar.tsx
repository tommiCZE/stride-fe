import { useMemo, useState, type ReactElement } from 'react';
import { useNavigate, useLocation, useMatch } from 'react-router-dom';
import { Box, Divider, IconButton, ListItemButton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../hooks/useProjects';
import { useAllProjectTasks } from '../hooks/useTasks';
import { useAuthStore } from '../store/auth-store';
import { useNotificationsStore } from '../store/notifications-store';
import { usePermissions } from '../hooks/usePermissions';
import StrideLogoIcon from '../components/icons/stride-logo-icon';
import CountBadge from './count-badge';
import {
  PlusIcon, BellIcon, DashboardIcon, ReportsIcon, SettingsIcon,
  CaretIcon, CheckIcon, CalendarIcon, ClockIcon,
} from '../components/icons/icons';

interface ProjectCounts {
  board: number;
  backlog: number;
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const projectMatch = useMatch('/projects/:projectKey/*');
  const { t } = useTranslation();
  const userId = useAuthStore(s => s.userId);
  const { isAdmin } = usePermissions();
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
        <Stack direction="row" aria-hidden="true" sx={{ alignItems: 'center', color: active ? 'primary.main' : 'text.secondary' }}>{icon}</Stack>
        <Typography sx={{ flex: 1, fontSize: '13px', fontWeight: active ? 600 : 500,
          color: active ? 'text.primary' : 'text.secondary' }}>{label}</Typography>
        {badge != null && <CountBadge count={badge} />}
      </ListItemButton>
    );
  };

  return (
    <Stack
      component="nav"
      role="navigation"
      aria-label={t('nav.projects')}
      sx={{ width: 232, height: '100%', bgcolor: 'background.paper' }}
    >
      <Stack direction="row" spacing={1} sx={{ px: 1.5, alignItems: 'center', minHeight: 36,
        borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" sx={{ width: 20, height: 20, borderRadius: '5px', bgcolor: 'primary.main',
          alignItems: 'center', justifyContent: 'center', color: 'primary.contrastText',
          flexShrink: 0 }}>
          <StrideLogoIcon size={13}/>
        </Stack>
        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.primary',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Acme s.r.o.
        </Typography>
      </Stack>

      <Box sx={{ p: 0.75 }}>
        {navItem('/dashboard', t('nav.dashboard'), <DashboardIcon/>)}
        {navItem('/inbox',     t('nav.inbox'),     <BellIcon/>,   unreadCount)}
        {navItem('/my-work',   t('nav.myWork'),    <CheckIcon/>,  myWorkCount)}
        {navItem('/my-time',   'Můj výkaz',        <ClockIcon/>)}
        {navItem('/calendar',  t('nav.calendar'),  <CalendarIcon/>)}
        {isAdmin && navItem('/reports', t('nav.reports'), <ReportsIcon/>)}
      </Box>

      <Divider/>

      <Box sx={{ p: 0.75, flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', px: 1, py: 0.75,
          color: 'text.secondary', userSelect: 'none' }}>
          <CaretIcon/>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', flex: 1 }}>
            {t('nav.projects')}
          </Typography>
          <IconButton size="small" sx={{ p: 0.25 }} aria-label="Vytvořit projekt">
            <PlusIcon/>
          </IconButton>
        </Stack>
        {archivedCount > 0 && (
          <Stack direction="row" spacing={0.5}
            onClick={() => setShowArchived(v => !v)}
            sx={{ alignItems: 'center', px: 1.25, py: 0.4,
              cursor: 'default', borderRadius: 1, mb: 0.25,
              color: showArchived ? 'text.primary' : 'text.disabled',
              '&:hover': { bgcolor: 'action.hover' } }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 500, flex: 1 }}>
              {showArchived ? 'Skrýt archivované' : `Zobrazit archivované (${archivedCount})`}
            </Typography>
          </Stack>
        )}
        {projects.map(p => {
          const active = projectMatch?.params.projectKey === p.key;
          const counts = perProject.get(p.id) ?? { board: 0, backlog: 0 };
          const boardPath = `/projects/${p.key}/board`;
          return (
            <Box key={p.id}>
              <ListItemButton selected={active}
                onClick={() => { navigate(boardPath); onClose?.(); }}
                aria-current={active ? 'page' : undefined}
                aria-label={`${p.name}, ${counts.board} aktivních úkolů${p.archived ? ', archivováno' : ''}`}
                sx={{ pl: 1, pr: 1, py: 0.5, gap: 1, minHeight: 28,
                  opacity: p.archived ? 0.55 : 1 }}>
                <Stack direction="row" aria-hidden="true" sx={{ width: 18, height: 18, borderRadius: 0.8, bgcolor: p.color,
                  alignItems: 'center', justifyContent: 'center',
                  color: 'common.white', fontSize: '13px', fontWeight: 700 }}>{p.key[0]}</Stack>
                <Typography sx={{ fontSize: '14px', fontWeight: active ? 600 : 500, flex: 1,
                  color: active ? 'text.primary' : 'text.secondary',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  fontStyle: p.archived ? 'italic' : 'normal' }}>
                  {p.name}{p.archived && <Box component="span" sx={{ fontSize: '14px', color: 'text.disabled', ml: 0.5 }}>· archiv</Box>}
                </Typography>
                <CountBadge count={counts.board} variant="muted" />
              </ListItemButton>
            </Box>
          );
        })}
      </Box>

      {isAdmin && (
        <>
          <Divider/>
          <Box sx={{ p: 0.75, flexShrink: 0 }}>
            {navItem('/settings', 'Nastavení', <SettingsIcon/>)}
          </Box>
        </>
      )}
    </Stack>
  );
}

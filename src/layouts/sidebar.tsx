import type { ReactElement } from 'react';
import { useNavigate, useLocation, useMatch } from 'react-router-dom';
import { Box, Divider, IconButton, ListItemButton, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PROJECTS, getUser } from '../mocks/data';
import StrideLogoIcon from '../components/icons/stride-logo-icon';
import FluxAvatar from '../components/flux-avatar';
import {
  PlusIcon, BellIcon, DashboardIcon, ReportsIcon, SettingsIcon,
  CaretIcon, CheckIcon, TeamIcon,
} from '../components/icons/icons';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const projectMatch = useMatch('/projects/:projectId/*');
  const theme = useTheme();
  const { t } = useTranslation();
  const me = getUser('u1')!;

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItem = (path: string, label: string, icon: ReactElement, badge?: number) => {
    const active = isActive(path);
    return (
      <ListItemButton key={path} selected={active}
        onClick={() => { navigate(path); onClose?.(); }}
        sx={{ pl: 1.25, pr: 1, py: 0.5, gap: 1, minHeight: 30 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', color: active ? 'primary.main' : 'text.secondary' }}>{icon}</Box>
        <Typography sx={{ flex: 1, fontSize: 13, fontWeight: active ? 600 : 500,
          color: active ? 'text.primary' : 'text.secondary' }}>{label}</Typography>
        {badge != null && (
          <Box sx={{ fontSize: 10.5, px: 0.75, borderRadius: 1, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600 }}>{badge}</Box>
        )}
      </ListItemButton>
    );
  };

  return (
    <Box sx={{ width: 232, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ px: 1.5, py: 1.25, display: 'flex', alignItems: 'center', gap: 1, minHeight: 48,
        borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ width: 26, height: 26, borderRadius: 1.2, bgcolor: 'primary.main',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <StrideLogoIcon size={16}/>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.1 }}>Stride</Typography>
          <Typography sx={{ fontSize: 10.5, color: 'text.secondary', lineHeight: 1.1 }}>Acme s.r.o.</Typography>
        </Box>
        <CaretIcon style={{ color: theme.palette.text.secondary }}/>
      </Box>

      <Box sx={{ p: 0.75 }}>
        {navItem('/dashboard', t('nav.dashboard'), <DashboardIcon/>)}
        {navItem('/inbox',     t('nav.inbox'),     <BellIcon/>,   3)}
        {navItem('/my-work',   t('nav.myWork'),    <CheckIcon/>,  7)}
        {navItem('/reports',   t('nav.reports'),   <ReportsIcon/>)}
        {navItem('/team',      t('nav.team'),      <TeamIcon/>)}
      </Box>

      <Divider/>

      <Box sx={{ p: 0.75, flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.75,
          color: 'text.secondary', userSelect: 'none' }}>
          <CaretIcon/>
          <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', flex: 1 }}>
            {t('nav.projects')}
          </Typography>
          <IconButton size="small" sx={{ p: 0.25 }}>
            <PlusIcon/>
          </IconButton>
        </Box>
        {PROJECTS.map(p => {
          const active = projectMatch?.params.projectId === p.id;
          return (
            <ListItemButton key={p.id} selected={active}
              onClick={() => { navigate(`/projects/${p.id}/board`); onClose?.(); }}
              sx={{ pl: 1, pr: 1, py: 0.5, gap: 1, minHeight: 28 }}>
              <Box sx={{ width: 18, height: 18, borderRadius: 0.8, bgcolor: p.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 11, fontWeight: 700 }}>{p.key[0]}</Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: active ? 600 : 500, flex: 1,
                color: active ? 'text.primary' : 'text.secondary',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</Typography>
              {p.open > 0 && (
                <Typography sx={{ fontSize: 10.5, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>{p.open}</Typography>
              )}
            </ListItemButton>
          );
        })}
      </Box>

      <Divider/>
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FluxAvatar user={me} size={26}/>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.1 }}>{me.name}</Typography>
          <Typography sx={{ fontSize: 10.5, color: 'text.secondary', lineHeight: 1.1 }}>{me.role}</Typography>
        </Box>
        <IconButton size="small"><SettingsIcon/></IconButton>
      </Box>
    </Box>
  );
}

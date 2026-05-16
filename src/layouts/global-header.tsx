import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Badge, Box, IconButton, InputAdornment, Menu, MenuItem, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '../store/ui-store';
import { useAuthStore } from '../store/auth-store';
import { useNotificationsStore } from '../store/notifications-store';
import FluxAvatar from '../components/flux-avatar';
import LanguageSwitcher from '../components/language-switcher';
import NotificationsPopover from '../components/notifications-popover';
import {
  SearchIcon, BellIcon, HelpIcon, SunIcon, MoonIcon,
  HamburgerIcon, PlayIcon, PauseIcon, CloseIcon,
} from '../components/icons/icons';

function fmtTimer(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function GlobalHeader() {
  const { themeMode, toggleTheme, setMobileMenu, timer, stopTimer, toggleTimer } = useUiStore();
  const me = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);
  const unreadCount = useNotificationsStore(s => s.items.filter(i => !i.read).length);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (location.pathname === '/search') {
      setSearchValue(searchParams.get('q') ?? '');
    }
  }, [location.pathname, searchParams]);

  const submitSearch = () => {
    const q = searchValue.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = () => {
    setAnchor(null);
    logout();
    qc.clear();
    navigate('/login');
  };

  useEffect(() => {
    if (!timer.running) return;
    const id = setInterval(() => useUiStore.getState().tickTimer(), 1000);
    return () => clearInterval(id);
  }, [timer.running]);

  return (
    <Box sx={{ height: 44, display: 'flex', alignItems: 'center', gap: 1,
      px: { xs: 1, md: 2 }, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      {isMobile && (
        <IconButton size="small" onClick={() => setMobileMenu(true)} sx={{ mr: 0.5 }}>
          <HamburgerIcon/>
        </IconButton>
      )}
      {!isMobile && (
        <TextField
          placeholder={t('header.searchPlaceholder')}
          size="small" variant="outlined"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submitSearch(); }}
          sx={{ width: 360, '& .MuiOutlinedInput-root': { height: 28, fontSize: 12.5,
            bgcolor: 'action.hover', '& fieldset': { borderColor: 'transparent' } } }}
          slotProps={{
            input: { startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}><SearchIcon/></InputAdornment> },
          }}
        />
      )}
      <Box sx={{ flex: 1 }}/>

      {timer.taskKey && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.4,
          border: 1, borderColor: timer.running ? 'success.main' : 'divider', borderRadius: 1.2,
          bgcolor: timer.running ? alpha('#10b981', 0.08) : 'transparent' }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%',
            bgcolor: timer.running ? 'success.main' : 'text.disabled' }}/>
          {!isMobile && (
            <Typography sx={{ fontSize: 11.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {timer.taskKey} · {fmtTimer(timer.elapsed)}
            </Typography>
          )}
          {isMobile && (
            <Typography sx={{ fontSize: 11.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {fmtTimer(timer.elapsed)}
            </Typography>
          )}
          <IconButton size="small" sx={{ p: 0.25 }} onClick={toggleTimer}>
            {timer.running ? <PauseIcon/> : <PlayIcon/>}
          </IconButton>
          <IconButton size="small" sx={{ p: 0.25 }} onClick={stopTimer}>
            <CloseIcon/>
          </IconButton>
        </Box>
      )}

      <LanguageSwitcher />
      <Tooltip title={t('header.toggleTheme')}>
        <IconButton size="small" onClick={toggleTheme}>
          {themeMode === 'dark' ? <SunIcon/> : <MoonIcon/>}
        </IconButton>
      </Tooltip>
      {!isMobile && <Tooltip title={t('header.help')}><IconButton size="small"><HelpIcon/></IconButton></Tooltip>}
      <Tooltip title={t('header.notifications')}>
        <IconButton size="small" onClick={(e) => setNotifAnchor(e.currentTarget)}>
          <Badge
            badgeContent={unreadCount}
            color="error"
            invisible={unreadCount === 0}
            sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 14, minWidth: 14 } }}
          >
            <BellIcon/>
          </Badge>
        </IconButton>
      </Tooltip>
      <NotificationsPopover anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)} />

      <Box sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        onClick={e => setAnchor(e.currentTarget)}>
        <FluxAvatar user={me} size={28}/>
      </Box>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 200, mt: 0.5 } } }}>
        <Box sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{me?.name}</Typography>
          <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{me?.email}</Typography>
        </Box>
        <MenuItem sx={{ fontSize: 13, mt: 0.5 }}
          onClick={() => { setAnchor(null); navigate('/profile'); }}>
          Můj profil
        </MenuItem>
        <MenuItem sx={{ fontSize: 13, color: 'error.main' }} onClick={handleLogout}>
          Odhlásit se
        </MenuItem>
      </Menu>
    </Box>
  );
}

import { useCallback, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Badge, Box, IconButton, InputAdornment, Menu, MenuItem, Stack, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '../store/ui-store';
import { useAuthStore } from '../store/auth-store';
import { useNotificationsStore } from '../store/notifications-store';
import { useRunningTimer, useStopTimer } from '../hooks/useTimer';
import FluxAvatar from '../components/flux-avatar';
import LanguageSwitcher from '../components/language-switcher';
import NotificationsPopover from '../components/notifications-popover';
import { WorklogDialog } from '../components/worklog-dialog';
import {
  SearchIcon, BellIcon, HelpIcon, SunIcon, MoonIcon,
  HamburgerIcon, CloseIcon,
} from '../components/icons/icons';
import type { StopTimerResponse } from '../api/types';

function fmtTimer(sec: number) {
  const safe = Math.max(0, sec);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function GlobalHeader() {
  const { themeMode, toggleTheme, setMobileMenu } = useUiStore();
  const { data: runningTimer } = useRunningTimer();
  const stopTimerMutation = useStopTimer();
  const [pendingWorklog, setPendingWorklog] = useState<StopTimerResponse | null>(null);

  const startedAtMs = runningTimer ? new Date(runningTimer.startedAt).getTime() : 0;
  const subscribeTick = useCallback((cb: () => void) => {
    if (!runningTimer) return () => {};
    const id = setInterval(cb, 1000);
    return () => clearInterval(id);
  }, [runningTimer]);
  const elapsed = useSyncExternalStore(
    subscribeTick,
    () => (runningTimer ? Math.floor((Date.now() - startedAtMs) / 1000) : 0),
    () => 0,
  );
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
  const isOnSearch = location.pathname === '/search';
  const searchQ = searchParams.get('q') ?? '';
  const [prevSearchKey, setPrevSearchKey] = useState(`${isOnSearch}|${searchQ}`);
  const searchKey = `${isOnSearch}|${searchQ}`;
  if (prevSearchKey !== searchKey) {
    setPrevSearchKey(searchKey);
    if (isOnSearch) setSearchValue(searchQ);
  }

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

  const handleStopTimer = () => {
    if (stopTimerMutation.isPending) return;
    stopTimerMutation.mutate(undefined, {
      onSuccess: (data) => setPendingWorklog(data),
    });
  };

  return (
    <Stack direction="row" spacing={1} sx={{ height: 44, alignItems: 'center', px: { xs: 1, md: 2 }, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
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
          sx={{ width: 360, '& .MuiOutlinedInput-root': { height: 28, fontSize: '14px',
            bgcolor: 'action.hover', '& fieldset': { borderColor: 'transparent' } } }}
          slotProps={{
            input: { startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}><SearchIcon/></InputAdornment> },
          }}
        />
      )}
      <Box sx={{ flex: 1 }}/>

      {runningTimer && (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', px: 1, py: 0.4,
          border: 1, borderColor: 'success.main', borderRadius: 1.2,
          bgcolor: alpha('#10b981', 0.08) }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }}/>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {isMobile ? fmtTimer(elapsed) : `${runningTimer.taskKey} · ${fmtTimer(elapsed)}`}
          </Typography>
          <Tooltip title="Zastavit měření">
            <span>
              <IconButton
                size="small"
                sx={{ p: 0.25 }}
                onClick={handleStopTimer}
                disabled={stopTimerMutation.isPending}
                aria-label="Zastavit měření"
              >
                <CloseIcon/>
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      )}

      {pendingWorklog && (
        <WorklogDialog
          open
          taskId={pendingWorklog.taskId}
          taskKey={pendingWorklog.taskKey}
          defaultMinutes={Math.round(pendingWorklog.elapsedSeconds / 60)}
          onClose={() => setPendingWorklog(null)}
        />
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
            sx={{ '& .MuiBadge-badge': { fontSize: '13px', height: 14, minWidth: 14 } }}
          >
            <BellIcon/>
          </Badge>
        </IconButton>
      </Tooltip>
      <NotificationsPopover anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)} />

      <Stack direction="row" sx={{ cursor: 'pointer', alignItems: 'center' }}
        onClick={e => setAnchor(e.currentTarget)}>
        <FluxAvatar user={me} size={28}/>
      </Stack>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 200, mt: 0.5 } } }}>
        <Box sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>{me?.name}</Typography>
          <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>{me?.email}</Typography>
        </Box>
        <MenuItem sx={{ fontSize: '13px', mt: 0.5 }}
          onClick={() => { setAnchor(null); navigate('/profile'); }}>
          Můj profil
        </MenuItem>
        <MenuItem sx={{ fontSize: '13px', color: 'error.main' }} onClick={handleLogout}>
          Odhlásit se
        </MenuItem>
      </Menu>
    </Stack>
  );
}

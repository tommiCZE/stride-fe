import { useCallback, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Badge, Box, IconButton, InputAdornment, Menu, MenuItem, Stack, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useUiStore } from '../store/ui-store';
import { useAuthStore } from '../store/auth-store';
import { useNotificationsStore } from '../store/notifications-store';
import { useRunningTimer, useStopTimer } from '../hooks/useTimer';
import { worklogsApi } from '../api/worklogs';
import { worklogKeys } from '../hooks/useWorklogs';
import { dayKeys } from '../hooks/useDays';
import { taskKeys } from '../hooks/useTasks';
import FluxAvatar from '../components/flux-avatar';
import LanguageSwitcher from '../components/language-switcher';
import NotificationsPopover from '../components/notifications-popover';
import {
  SearchIcon, BellIcon, HelpIcon, SunIcon, MoonIcon,
  HamburgerIcon, CloseIcon,
} from '../components/icons/icons';
import { addMinutesToHM, isoLocal } from '../lib/time';

function fmtTimer(sec: number) {
  const safe = Math.max(0, sec);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function minutesBetween(startHM: string, endHM: string): number {
  const [sh, sm] = startHM.split(':').map(Number);
  const [eh, em] = endHM.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export default function GlobalHeader() {
  const { themeMode, toggleTheme, setMobileMenu } = useUiStore();
  const { data: runningTimer } = useRunningTimer();
  const stopTimerMutation = useStopTimer();
  const userId = useAuthStore(s => s.userId);
  const { enqueueSnackbar } = useSnackbar();

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
    if (stopTimerMutation.isPending || !runningTimer || !userId) return;
    const startedAt = new Date(runningTimer.startedAt);
    const taskId = runningTimer.taskId;
    stopTimerMutation.mutate(undefined, {
      onSuccess: async () => {
        const end = new Date();
        const minutes = Math.round((end.getTime() - startedAt.getTime()) / 60000);
        if (minutes < 1) {
          enqueueSnackbar('Příliš krátký záznam (<1 min), zahozeno', { variant: 'info' });
          return;
        }
        try {
          const startDate = isoLocal(startedAt);
          const endDate = isoLocal(end);
          const startHM = dayjs(startedAt).format('HH:mm');
          const endHM = dayjs(end).format('HH:mm');
          if (startDate === endDate) {
            await worklogsApi.createForUser(userId, {
              taskId, minutes, loggedAt: startDate,
              start: startHM, end: endHM,
              kind: 'TASK', mode: 'TIME',
            });
          } else {
            // Crossed midnight: split into two worklogs.
            const firstEnd = '23:59';
            const firstMin = Math.max(1, minutesBetween(startHM, firstEnd));
            const secondMin = Math.max(0, minutes - firstMin);
            await worklogsApi.createForUser(userId, {
              taskId, minutes: firstMin, loggedAt: startDate,
              start: startHM, end: firstEnd,
              note: 'rozděleno z timeru', kind: 'TASK', mode: 'TIME',
            });
            if (secondMin > 0) {
              await worklogsApi.createForUser(userId, {
                taskId, minutes: secondMin, loggedAt: endDate,
                start: '00:00', end: endHM,
                note: 'rozděleno z timeru', kind: 'TASK', mode: 'TIME',
              });
            }
          }
          enqueueSnackbar(`Zaznamenáno ${fmtTimer(minutes * 60)}`, { variant: 'success' });
          qc.invalidateQueries({ queryKey: worklogKeys.userScope(userId) });
          qc.invalidateQueries({ queryKey: dayKeys.userScope(userId) });
          qc.invalidateQueries({ queryKey: worklogKeys.list(taskId) });
          qc.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
        } catch (e: unknown) {
          const detail = (e as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Uložení záznamu selhalo';
          enqueueSnackbar(detail, { variant: 'error' });
        }
      },
    });
  };

  // Suppress so addMinutesToHM is reachable for future midnight calcs; not used directly here.
  void addMinutesToHM;

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

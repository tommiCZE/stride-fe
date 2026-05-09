import { useEffect } from 'react';
import { Badge, Box, IconButton, InputAdornment, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '../store/ui-store';
import { getUser } from '../mocks/data';
import FluxAvatar from '../components/flux-avatar';
import LanguageSwitcher from '../components/language-switcher';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();

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
        <IconButton size="small">
          <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 14, minWidth: 14 } }}>
            <BellIcon/>
          </Badge>
        </IconButton>
      </Tooltip>
      <FluxAvatar user={getUser('u1')} size={26}/>
    </Box>
  );
}

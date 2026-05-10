// shell.jsx — App shell: sidebar + topbar + nav state

const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;
const MUI = window.MaterialUI;
const { Box, Stack, Typography, IconButton, Tooltip, TextField, InputAdornment,
        Button, Avatar, Divider, Menu, MenuItem, Chip, Badge, ListItemButton,
        ListItemIcon, ListItemText, Drawer, useMediaQuery, useTheme: useMuiTheme } = MUI;
const { alpha } = MUI;

// Responsive hook
function useIsMobile() {
  const theme = useMuiTheme();
  return useMediaQuery(theme.breakpoints.down('md'));
}
function useIsTablet() {
  const theme = useMuiTheme();
  return useMediaQuery(theme.breakpoints.down('lg'));
}

// Simple inline icons (avoid icon font deps)
const I = {
  search:   (p) => <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="7" cy="7" r="4.5"/><path d="m11 11 3 3" strokeLinecap="round"/></svg>,
  plus:     (p) => <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><path d="M8 3v10M3 8h10"/></svg>,
  bell:     (p) => <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M4 7a4 4 0 1 1 8 0v2.5l1 2H3l1-2V7z"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0"/></svg>,
  help:     (p) => <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="8" cy="8" r="6"/><path d="M6.5 6.2a1.5 1.5 0 1 1 2.5 1.3c-.6.4-1 .7-1 1.3M8 11.2v.1"/></svg>,
  dashboard:(p) => <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="2" y="2" width="5.5" height="5.5" rx="1"/><rect x="8.5" y="2" width="5.5" height="5.5" rx="1"/><rect x="2" y="8.5" width="5.5" height="5.5" rx="1"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1"/></svg>,
  board:    (p) => <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="2" y="2" width="3.5" height="12" rx="1"/><rect x="6.5" y="2" width="3.5" height="8" rx="1"/><rect x="11" y="2" width="3" height="10" rx="1"/></svg>,
  list:     (p) => <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><path d="M5 4h9M5 8h9M5 12h9"/><circle cx="2.5" cy="4" r=".8" fill="currentColor"/><circle cx="2.5" cy="8" r=".8" fill="currentColor"/><circle cx="2.5" cy="12" r=".8" fill="currentColor"/></svg>,
  backlog:  (p) => <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="2" y="3" width="12" height="3" rx="1"/><rect x="2" y="7.5" width="12" height="3" rx="1"/><rect x="2" y="12" width="12" height="2" rx="1" opacity=".5"/></svg>,
  reports:  (p) => <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><path d="M2 13h12M4 11V7M7 11V4M10 11V8M13 11V6"/></svg>,
  settings: (p) => <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5 13 13M3 13l1.5-1.5M11.5 4.5 13 3"/></svg>,
  clock:    (p) => <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="8" cy="8" r="6"/><path d="M8 5v3.2L10 10" strokeLinecap="round"/></svg>,
  comment:  (p) => <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M2.5 4a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 13.5 4v5A1.5 1.5 0 0 1 12 10.5H7l-3 2.5V10.5h-.5A1.5 1.5 0 0 1 2.5 9V4z"/></svg>,
  attach:   (p) => <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><path d="M11 5 6 10a2 2 0 0 0 2.8 2.8l5-5a3.5 3.5 0 0 0-5-5l-5 5a5 5 0 0 0 7 7l4.5-4.5"/></svg>,
  link:     (p) => <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><path d="M7 9.5 9 7.5M6 4.5 7.5 3a2.5 2.5 0 0 1 3.5 3.5L9.5 8M6.5 8 5 9.5A2.5 2.5 0 0 0 8.5 13L10 11.5"/></svg>,
  more:     (p) => <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" {...p}><circle cx="3.5" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12.5" cy="8" r="1.2"/></svg>,
  caret:    (p) => <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="m4 6 4 4 4-4"/></svg>,
  caretR:   (p) => <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="m6 4 4 4-4 4"/></svg>,
  filter:   (p) => <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><path d="M2 3h12L9.5 8.5V13l-3 1V8.5z"/></svg>,
  star:     (p) => <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="m8 2 1.8 3.8 4.2.6-3 3 .7 4.1L8 11.6l-3.7 1.9.7-4.1-3-3 4.2-.6z"/></svg>,
  play:     (p) => <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" {...p}><path d="M5 3.5v9l7-4.5z"/></svg>,
  pause:    (p) => <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" {...p}><rect x="4" y="3.5" width="2.5" height="9" rx=".5"/><rect x="9.5" y="3.5" width="2.5" height="9" rx=".5"/></svg>,
  check:    (p) => <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m3.5 8.5 3 3 6-7"/></svg>,
  close:    (p) => <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="m4 4 8 8M12 4l-8 8"/></svg>,
};

// ── Navigation context ──────────────────────────────────────────────────────
const NavCtx = createContext(null);
function useNav() { return useContext(NavCtx); }

// ── Logo ────────────────────────────────────────────────────────────────────
function FluxLogo({ size = 22, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 3 L19 3 L19 7 L9 7 L9 11 L17 11 L17 15 L9 15 L9 21 L5 21 Z"
            fill={color || 'currentColor'}/>
      <circle cx="19" cy="19" r="2.5" fill={color || 'currentColor'}/>
    </svg>
  );
}

// ── Sidebar content (shared between desktop + mobile drawer) ────────────────
function SidebarContent({ onClose }) {
  const { route, setRoute, currentProject, setCurrentProject } = useNav();
  const [projOpen, setProjOpen] = useState(true);

  const navItem = (key, label, icon, badge) => {
    const active = route.view === key;
    return (
      <ListItemButton key={key} selected={active} onClick={() => { setRoute({ view: key }); onClose && onClose(); }}
        sx={{ pl: 1.25, pr: 1, py: 0.5, gap: 1, minHeight: 30 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', color: active ? 'primary.main' : 'text.secondary' }}>{icon}</Box>
        <Typography variant="body2" sx={{ flex: 1, fontSize: 13, fontWeight: active ? 600 : 500,
          color: active ? 'text.primary' : 'text.secondary' }}>{label}</Typography>
        {badge != null && (
          <Box sx={{ fontSize: 10.5, px: 0.75, borderRadius: 1, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600 }}>{badge}</Box>
        )}
      </ListItemButton>
    );
  };

  return (
    <Box sx={{ width: 232, height: '100%', display: 'flex', flexDirection: 'column',
      bgcolor: 'background.paper' }}>
      {/* Logo */}
      <Box sx={{ px: 1.5, py: 1.25, display: 'flex', alignItems: 'center', gap: 1, minHeight: 48,
                 borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ width: 26, height: 26, borderRadius: 1.2, bgcolor: 'primary.main',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <FluxLogo size={16}/>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.1 }}>Flux</Typography>
          <Typography sx={{ fontSize: 10.5, color: 'text.secondary', lineHeight: 1.1 }}>Acme s.r.o.</Typography>
        </Box>
        <I.caret style={{ color: 'var(--mui-palette-text-secondary)' }}/>
      </Box>

      {/* Quick nav */}
      <Box sx={{ p: 0.75 }}>
        {navItem('dashboard', 'Dashboard', <I.dashboard/>)}
        {navItem('inbox',     'Inbox',     <I.bell/>, 3)}
        {navItem('mywork',    'Moje práce', <I.check/>, 7)}
        {navItem('reports',   'Reporty',   <I.reports/>)}
      </Box>

      <Divider/>

      {/* Projects */}
      <Box sx={{ p: 0.75, flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <Box onClick={() => setProjOpen(o => !o)}
             sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.75,
                   color: 'text.secondary', cursor: 'default', userSelect: 'none' }}>
          <Box sx={{ transform: projOpen ? 'rotate(0)' : 'rotate(-90deg)', transition: '0.15s', display: 'flex' }}>
            <I.caret/>
          </Box>
          <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', flex: 1 }}>
            Projekty
          </Typography>
          <IconButton size="small" sx={{ p: 0.25 }} onClick={(e) => e.stopPropagation()}>
            <I.plus/>
          </IconButton>
        </Box>
        {projOpen && window.FLUX_PROJECTS.map(p => {
          const active = currentProject === p.id;
          return (
            <ListItemButton key={p.id} selected={active}
              onClick={() => { setCurrentProject(p.id); setRoute({ view: 'board' }); onClose && onClose(); }}
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

      {/* Footer */}
      <Divider/>
      <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FluxAvatar user={getUser('u1')} size={26}/>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.1 }}>{getUser('u1').name}</Typography>
          <Typography sx={{ fontSize: 10.5, color: 'text.secondary', lineHeight: 1.1 }}>{getUser('u1').role}</Typography>
        </Box>
        <IconButton size="small"><I.settings/></IconButton>
      </Box>
    </Box>
  );
}

// ── Sidebar (desktop: fixed, mobile: drawer) ────────────────────────────────
function Sidebar({ mobileOpen, onMobileClose }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={mobileOpen} onClose={onMobileClose}
        PaperProps={{ sx: { width: 232, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider' } }}>
        <SidebarContent onClose={onMobileClose}/>
      </Drawer>
    );
  }

  return (
    <Box sx={{ width: 232, flexShrink: 0, height: '100%',
      borderRight: 1, borderColor: 'divider' }}>
      <SidebarContent/>
    </Box>
  );
}

// ── Topbar (project header) ─────────────────────────────────────────────────
function ProjectTopbar({ project }) {
  const { route, setRoute, openCreate } = useNav();
  const isMobile = useIsMobile();

  const tab = (key, label, icon) => {
    const active = route.view === key;
    return (
      <Box onClick={() => setRoute({ view: key })}
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
          {!isMobile && <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.4 }}>{project.key} · {project.tasks} tasků</Typography>}
        </Box>
        <Button variant="contained" size="small" startIcon={<I.plus/>} onClick={openCreate}
          sx={{ flexShrink: 0 }}>
          {isMobile ? 'Task' : 'Nový task'}
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.25, overflowX: 'auto', mt: { xs: 0.5, md: 0 },
        '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none',
        ...(isMobile ? {} : { display: 'flex', alignItems: 'center', gap: 0.25 }) }}>
        {tab('board',    'Board',    <I.board/>)}
        {tab('backlog',  'Backlog',  <I.backlog/>)}
        {tab('list',     'List',     <I.list/>)}
        {tab('reports',  'Reporty',  <I.reports/>)}
        {tab('settings', 'Nastavení',<I.settings/>)}
      </Box>
    </Box>
  );
}

// ── Global header ──────────────────────────────────────────────────────────
function GlobalHeader({ onSearch, timer, theme, onThemeToggle, onMenuClick }) {
  const isMobile = useIsMobile();
  return (
    <Box sx={{ height: 44, display: 'flex', alignItems: 'center', gap: 1,
               px: { xs: 1, md: 2 }, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      {isMobile && (
        <IconButton size="small" onClick={onMenuClick} sx={{ mr: 0.5 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M2 4h12M2 8h12M2 12h12"/>
          </svg>
        </IconButton>
      )}
      {!isMobile && (
        <TextField
          placeholder="Hledat tasky, projekty… (⌘K)"
          size="small" variant="outlined"
          sx={{ width: 360, '& .MuiOutlinedInput-root': { height: 28, fontSize: 12.5,
            bgcolor: 'action.hover', '& fieldset': { borderColor: 'transparent' } } }}
          InputProps={{
            startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}><I.search/></InputAdornment>,
          }}
        />
      )}
      <Box sx={{ flex: 1 }}/>

      {timer && timer.taskKey && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.4,
          border: 1, borderColor: timer.running ? 'success.main' : 'divider', borderRadius: 1.2,
          bgcolor: timer.running ? alpha('#10b981', 0.08) : 'transparent' }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%',
            bgcolor: timer.running ? 'success.main' : 'text.disabled',
            animation: timer.running ? 'fluxPulse 1.4s infinite' : 'none' }}/>
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
          <IconButton size="small" sx={{ p: 0.25 }} onClick={timer.toggle}>
            {timer.running ? <I.pause/> : <I.play/>}
          </IconButton>
          <IconButton size="small" sx={{ p: 0.25 }} onClick={timer.stop}>
            <I.close/>
          </IconButton>
        </Box>
      )}

      <Tooltip title="Přepnout téma">
        <IconButton size="small" onClick={onThemeToggle}>
          {theme === 'dark'
            ? <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3" strokeLinecap="round"/></svg>
            : <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M6 2a6 6 0 1 0 8 8 5 5 0 0 1-8-8z"/></svg>
          }
        </IconButton>
      </Tooltip>
      {!isMobile && <Tooltip title="Nápověda"><IconButton size="small"><I.help/></IconButton></Tooltip>}
      <Tooltip title="Notifikace">
        <IconButton size="small">
          <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 14, minWidth: 14 } }}>
            <I.bell/>
          </Badge>
        </IconButton>
      </Tooltip>
      <FluxAvatar user={getUser('u1')} size={26}/>
    </Box>
  );
}

function fmtTimer(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

Object.assign(window, { Sidebar, SidebarContent, ProjectTopbar, GlobalHeader, NavCtx, useNav, I, FluxLogo, fmtTimer, useIsMobile, useIsTablet });

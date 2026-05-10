// theme.jsx — MUI theme + shared style helpers for Flux

const { createTheme, alpha } = window.MaterialUI;

function buildFluxTheme(mode = 'light', density = 'compact', primary = '#5A5BFF') {
  const isDark = mode === 'dark';
  const dens = density;

  return createTheme({
    palette: {
      mode,
      primary: { main: primary },
      secondary: { main: '#ec4899' },
      success: { main: '#10b981' },
      warning: { main: '#f59e0b' },
      error:   { main: '#ef4444' },
      info:    { main: '#0ea5e9' },
      background: {
        default: isDark ? '#0e1015' : '#f7f8fa',
        paper:   isDark ? '#161922' : '#ffffff',
      },
      text: {
        primary:   isDark ? '#e6e8ef' : '#0f172a',
        secondary: isDark ? '#9ba3b4' : '#475569',
        disabled:  isDark ? '#5b6478' : '#94a3b8',
      },
      divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
      action: {
        hover:    isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.04)',
        selected: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
      },
    },
    typography: {
      fontFamily: '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: dens === 'compact' ? 13 : 14,
      h1: { fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.015em' },
      h4: { fontWeight: 700, letterSpacing: '-0.015em' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600, letterSpacing: '-0.01em' },
      button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 },
      body2: { fontSize: dens === 'compact' ? 12.5 : 13.5 },
      caption: { fontSize: 11.5, letterSpacing: '0.01em' },
      overline: { fontSize: 10.5, letterSpacing: '0.08em', fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    shadows: [
      'none',
      isDark ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(15,23,42,0.06)',
      isDark ? '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)' : '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)',
      isDark ? '0 4px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)' : '0 4px 6px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)',
      isDark ? '0 8px 16px rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.3)' : '0 8px 16px rgba(15,23,42,0.08), 0 4px 6px rgba(15,23,42,0.05)',
      ...Array(20).fill(isDark ? '0 12px 24px rgba(0,0,0,0.5)' : '0 12px 24px rgba(15,23,42,0.12)'),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFeatureSettings: '"cv11", "ss01", "ss03"',
            WebkitFontSmoothing: 'antialiased',
          },
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-thumb': {
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.15)',
            borderRadius: 6,
            border: '2px solid transparent',
            backgroundClip: 'content-box',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.25)',
            backgroundClip: 'content-box',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 7, fontWeight: 500 },
          sizeSmall: { padding: '3px 10px', fontSize: 12.5, minHeight: 26 },
          sizeMedium: { padding: '5px 12px', fontSize: 13, minHeight: 30 },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          sizeSmall: { padding: 4 },
          root: { borderRadius: 7 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500, height: dens === 'compact' ? 20 : 22, fontSize: 11.5 },
          sizeSmall: { height: 18, fontSize: 11 },
          label: { padding: '0 8px' },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: 11.5,
            background: isDark ? '#0a0c11' : '#0f172a',
            padding: '4px 8px',
            borderRadius: 5,
          },
          arrow: { color: isDark ? '#0a0c11' : '#0f172a' },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
      },
      MuiInputBase: {
        styleOverrides: {
          root: { fontSize: 13 },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { fontSize: 13, minHeight: 30, paddingTop: 5, paddingBottom: 5 },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            paddingTop: 4, paddingBottom: 4,
            '&.Mui-selected': {
              background: alpha(primary, 0.12),
              '&:hover': { background: alpha(primary, 0.16) },
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 36 },
          indicator: { height: 2 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { minHeight: 36, fontSize: 13, padding: '6px 14px', textTransform: 'none' },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)' },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: { fontSize: 11, fontWeight: 600 },
        },
      },
    },
  });
}

// ── Avatar ──────────────────────────────────────────────────────────────────
function FluxAvatar({ user, size = 22, ring = false }) {
  if (!user) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'transparent',
        border: '1px dashed currentColor',
        opacity: 0.4,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.45, fontWeight: 600, color: 'inherit',
      }}>?</div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: user.color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff',
      fontSize: size * 0.42, fontWeight: 600,
      letterSpacing: '0.02em',
      boxShadow: ring ? `0 0 0 2px var(--paper, #fff)` : 'none',
      flexShrink: 0,
    }}>{user.initials}</div>
  );
}

// ── Type / priority icons ───────────────────────────────────────────────────
function TypeIcon({ type, size = 14 }) {
  const t = window.FLUX_TYPES.find(x => x.id === type);
  if (!t) return null;
  // Use proper square icons
  const path = {
    story: 'M3 3 L17 3 L17 17 L3 17 Z',
    task:  'M3 3 L17 3 L17 17 L3 17 Z',
    bug:   'M10 3 A7 7 0 1 1 10 17 A7 7 0 1 1 10 3',
    epic:  'M3 3 L17 3 L17 17 L3 17 Z',
  }[type];
  const glyph = {
    story: <path d="M5.5 10.5 L9 14 L15 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    task:  <path d="M5.5 10.5 L9 14 L15 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    bug:   <g><circle cx="10" cy="10" r="2.2" fill="#fff"/></g>,
    epic:  <path d="M11 4 L6 11 L9.5 11 L9 16 L14 9 L10.5 9 Z" fill="#fff"/>,
  }[type];
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
      <path d={path} fill={t.color} rx="3" />
      <rect x="2" y="2" width="16" height="16" rx="3.5" fill={t.color}/>
      {glyph}
    </svg>
  );
}

function PriorityIcon({ priority, size = 14 }) {
  const p = window.FLUX_PRIORITIES.find(x => x.id === priority);
  if (!p) return null;
  // Bar chart style icon — Jira-like
  const bars = {
    urgent: [1, 1, 1],
    high:   [1, 1, 1],
    medium: [1, 1, 0.4],
    low:    [1, 0.4, 0.2],
  }[priority];
  const heights = [4, 7, 10];
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
      {priority === 'urgent' && (
        <path d="M6 1.5 L10.5 9 L1.5 9 Z" fill={p.color}/>
      )}
      {priority !== 'urgent' && bars.map((opacity, i) => (
        <rect key={i} x={1 + i * 3.3} y={11 - heights[i]} width={2.4} height={heights[i]}
              fill={p.color} opacity={opacity} rx="0.5"/>
      ))}
    </svg>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function getUser(id)     { return window.FLUX_USERS.find(u => u.id === id); }
function getProject(id)  { return window.FLUX_PROJECTS.find(p => p.id === id); }
function getStatus(id)   { return window.FLUX_STATUSES.find(s => s.id === id); }
function getPriority(id) { return window.FLUX_PRIORITIES.find(p => p.id === id); }
function getType(id)     { return window.FLUX_TYPES.find(t => t.id === id); }
function getLabel(id)    { return window.FLUX_LABELS.find(l => l.id === id); }
function getSprint(id)   { return window.FLUX_SPRINTS.find(s => s.id === id); }
function getEpic(id)     { return window.FLUX_EPICS.find(e => e.id === id); }

function timeAgo(iso) {
  const now = new Date('2026-04-28T10:00:00');
  const d = new Date(iso);
  const sec = Math.floor((now - d) / 1000);
  if (sec < 60) return 'právě teď';
  if (sec < 3600) return `${Math.floor(sec / 60)} min`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} h`;
  if (sec < 86400 * 7) return `${Math.floor(sec / 86400)} d`;
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
}

function fmtHours(h) {
  if (h == null) return '—';
  if (h === 0) return '0h';
  return Number.isInteger(h) ? `${h}h` : `${h}h`;
}

Object.assign(window, {
  buildFluxTheme, FluxAvatar, TypeIcon, PriorityIcon,
  getUser, getProject, getStatus, getPriority, getType, getLabel, getSprint, getEpic,
  timeAgo, fmtHours,
});

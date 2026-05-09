import { createTheme, alpha } from '@mui/material/styles';

export function buildTheme(mode: 'light' | 'dark' = 'light', primary = '#5A5BFF') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: primary },
      secondary: { main: '#ec4899' },
      success:   { main: '#10b981' },
      warning:   { main: '#f59e0b' },
      error:     { main: '#ef4444' },
      info:      { main: '#0ea5e9' },
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
      fontSize: 13,
      h1: { fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.015em' },
      h4: { fontWeight: 700, letterSpacing: '-0.015em' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600, letterSpacing: '-0.01em' },
      button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 },
      body2: { fontSize: 12.5 },
      caption: { fontSize: 11.5, letterSpacing: '0.01em' },
      overline: { fontSize: 10.5, letterSpacing: '0.08em', fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    shadows: (['none',
      isDark ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(15,23,42,0.06)',
      isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(15,23,42,0.08)',
      isDark ? '0 4px 6px rgba(0,0,0,0.4)' : '0 4px 6px rgba(15,23,42,0.08)',
      isDark ? '0 8px 16px rgba(0,0,0,0.5)' : '0 8px 16px rgba(15,23,42,0.08)',
      ...Array(20).fill(isDark ? '0 12px 24px rgba(0,0,0,0.5)' : '0 12px 24px rgba(15,23,42,0.12)'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any),
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
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 7, fontWeight: 500, textTransform: 'none' },
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
          root: { fontWeight: 500, height: 20, fontSize: 11.5 },
          sizeSmall: { height: 18, fontSize: 11 },
          label: { padding: '0 8px' },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
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
        styleOverrides: { root: { fontSize: 13 } },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { fontSize: 13, minHeight: 30, paddingTop: 5, paddingBottom: 5, borderRadius: 6 },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 10,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)'}`,
            boxShadow: isDark
              ? '0 8px 24px rgba(0,0,0,0.5)'
              : '0 4px 20px rgba(15,23,42,0.12)',
            padding: '4px',
          },
          list: { padding: 0 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 8 },
          notchedOutline: {
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.14)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            paddingTop: 4,
            paddingBottom: 4,
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
          root: {
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)',
          },
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

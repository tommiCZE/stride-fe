import { createTheme, alpha } from '@mui/material/styles';

export function buildTheme(mode: 'light' | 'dark' = 'light', primary = '#5A5BFF') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: primary },
      secondary: { main: '#ec4899' },
      // Status colors slightly lifted in dark so they remain legible
      // against the near-black surfaces while staying brand-consistent.
      success:   { main: isDark ? '#34d399' : '#10b981' },
      warning:   { main: isDark ? '#fbbf24' : '#f59e0b' },
      error:     { main: isDark ? '#f87171' : '#ef4444' },
      info:      { main: isDark ? '#38bdf8' : '#0ea5e9' },
      background: {
        // Two-step elevation: default (canvas) sits a touch darker than
        // paper (cards / panels) for a clear depth cue in dark mode.
        default: isDark ? '#0b0d13' : '#f7f8fa',
        paper:   isDark ? '#171a23' : '#ffffff',
      },
      text: {
        // Tuned for WCAG AA on both background.default and background.paper.
        primary:   isDark ? '#eceff7' : '#0f172a',
        secondary: isDark ? '#aab3c5' : '#475569',
        disabled:  isDark ? '#6b7488' : '#94a3b8',
      },
      divider: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.08)',
      action: {
        hover:    isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
        selected: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.06)',
        disabled: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(15,23,42,0.26)',
        disabledBackground: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.08)',
        focus:    isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.10)',
      },
    },
    typography: {
      fontFamily: '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 15,
      h1: { fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 },
      h2: { fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
      h3: { fontSize: '22px', fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.25 },
      h4: { fontSize: '19px', fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.3 },
      h5: { fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.35 },
      h6: { fontSize: '16px', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 },
      subtitle1: { fontSize: '15px', fontWeight: 500, lineHeight: 1.5 },
      subtitle2: { fontSize: '14px', fontWeight: 500, lineHeight: 1.5 },
      body1: { fontSize: '15px', lineHeight: 1.55 },
      body2: { fontSize: '14px', lineHeight: 1.5 },
      button: { fontSize: '15px', textTransform: 'none', fontWeight: 500, letterSpacing: 0 },
      caption: { fontSize: '13px', letterSpacing: '0.01em', lineHeight: 1.4 },
      overline: { fontSize: '12px', letterSpacing: '0.08em', fontWeight: 600, lineHeight: 1.4 },
      label: { fontSize: '13px', fontWeight: 600, letterSpacing: '0.01em', lineHeight: 1.4 },
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
          sizeSmall: { padding: '4px 12px', fontSize: '14px', minHeight: 30 },
          sizeMedium: { padding: '6px 14px', fontSize: '15px', minHeight: 34 },
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
          root: { fontWeight: 500, height: 22, fontSize: '13px' },
          sizeSmall: { height: 20, fontSize: '12px' },
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
            borderRadius: 12,
          },
        },
      },
      MuiStack: {
        defaultProps: { useFlexGap: true },
      },
      MuiTypography: {
        defaultProps: {
          variantMapping: { label: 'span' },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            paddingTop: 0,
            paddingBottom: 0,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            paddingTop: 8,
            paddingBottom: 8,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '13px',
            background: isDark ? '#0a0c11' : '#0f172a',
            padding: '5px 9px',
            borderRadius: 5,
          },
          arrow: { color: isDark ? '#0a0c11' : '#0f172a' },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
      },
      MuiInputBase: {
        styleOverrides: { root: { fontSize: '15px' } },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { fontSize: '15px', minHeight: 34, paddingTop: 6, paddingBottom: 6, borderRadius: 6 },
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
          root: { minHeight: 40 },
          indicator: { height: 2 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { minHeight: 40, fontSize: '15px', padding: '8px 16px', textTransform: 'none' },
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
          root: { fontSize: '13px', fontWeight: 600 },
        },
      },
    },
  });
}

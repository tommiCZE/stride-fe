import type { Theme } from '@mui/material';

const ACTION_LABELS: Record<string, string> = {
  'member.invite':           'Pozvánka člena',
  'member.update':           'Změna člena',
  'integration.connect':     'Připojení integrace',
  'integration.disconnect':  'Odpojení integrace',
  'security.update':         'Změna politiky zabezpečení',
  'settings.update':         'Změna nastavení',
};

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export function sectionColor(section: string, theme: Theme): string {
  switch (section) {
    case 'members':      return theme.palette.info.main;
    case 'integrations': return theme.palette.warning.main;
    case 'security':     return theme.palette.error.main;
    case 'general':      return theme.palette.success.main;
    default:             return theme.palette.text.secondary;
  }
}

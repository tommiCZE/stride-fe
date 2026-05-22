import type { ReactNode } from 'react';
import { Box, Card, Stack, Switch, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

export function SectionHeader({ hint }: { title?: string; hint?: string }) {
  if (!hint) return null;
  return (
    <Typography variant="caption" color="text.secondary" sx={{ mb: 2.5, maxWidth: 640, lineHeight: 1.5, display: 'block' }}>
      {hint}
    </Typography>
  );
}

export function SettingsCard({ title, description, action, children, sx }: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  sx?: object;
}) {
  return (
    <Card sx={{
      borderRadius: 1.5,
      p: 2.5, mb: 2,
      bgcolor: 'background.paper', ...sx,
    }}>
      {(title || action) && (
        <Stack direction="row" spacing={1.5} sx={{
          alignItems: 'flex-start',
          pb: 1.5, mb: 1.75,
          borderBottom: 1, borderColor: 'divider',
        }}>
          <Box sx={{ flex: 1 }}>
            {title && <Typography variant="subtitle2">{title}</Typography>}
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4, lineHeight: 1.5 }}>
                {description}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>
      )}
      {children}
    </Card>
  );
}

export { FieldRow } from '../../components/field-row';

export function ToggleRow({ label, hint, checked, onChange, disabled }: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Stack direction="row" spacing={2} sx={{
      alignItems: 'center', py: 1,
      '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' },
    }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{label}</Typography>
        {hint && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
            {hint}
          </Typography>
        )}
      </Box>
      <Switch
        size="small"
        checked={checked}
        onChange={(_, v) => onChange(v)}
        disabled={disabled}
      />
    </Stack>
  );
}

export function ColorSwatch({ color, selected, onClick, size = 22 }: {
  color: string;
  selected?: boolean;
  onClick?: () => void;
  size?: number;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: size, height: size, borderRadius: 1,
        bgcolor: color,
        cursor: onClick ? 'pointer' : 'default',
        outline: selected ? '2px solid' : 'none',
        outlineColor: 'text.primary',
        outlineOffset: 2,
        flexShrink: 0,
      }}
    />
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const COLOR_PALETTE = [
  '#6366f1', '#0ea5e9', '#ec4899', '#10b981',
  '#f59e0b', '#a855f7', '#ef4444', '#14b8a6',
  '#64748b', '#22c55e',
];

export function DangerCard({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Box sx={{
      border: 1, borderRadius: 1.5, p: 2.25, mb: 1.75,
      borderColor: theme => alpha(theme.palette.error.main, 0.4),
      bgcolor: theme => alpha(theme.palette.error.main, 0.04),
    }}>
      <Typography variant="label" color="error.main" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 1.5, display: 'block' }}>
        {description}
      </Typography>
      {children}
    </Box>
  );
}

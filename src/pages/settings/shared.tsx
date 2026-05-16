import type { ReactNode } from 'react';
import { Box, Switch, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Krátký popis sekce zobrazený nad první kartou.
 * Titul sekce je už součástí sticky hlavičky v Settings shellu — nedubluj ho.
 */
export function SectionHeader({ hint }: { title?: string; hint?: string }) {
  if (!hint) return null;
  return (
    <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2.5, maxWidth: 640, lineHeight: 1.5 }}>
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
    <Box sx={{
      border: 1, borderColor: 'divider', borderRadius: 1.5,
      p: 2.5, mb: 2,
      bgcolor: 'background.paper', ...sx,
    }}>
      {(title || action) && (
        <Box sx={{
          display: 'flex', alignItems: 'flex-start', gap: 1.5,
          pb: 1.5, mb: 1.75,
          borderBottom: 1, borderColor: 'divider',
        }}>
          <Box sx={{ flex: 1 }}>
            {title && <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{title}</Typography>}
            {description && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.4, lineHeight: 1.5 }}>
                {description}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
      )}
      {children}
    </Box>
  );
}

export function FieldRow({ label, hint, children, columns = '220px 1fr' }: {
  label: string;
  hint?: string;
  children: ReactNode;
  columns?: string;
}) {
  return (
    <Box sx={{
      display: 'grid', gridTemplateColumns: columns, gap: 3,
      alignItems: 'flex-start', py: 1.25,
      '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' },
    }}>
      <Box sx={{ pt: 0.75 }}>
        <Typography sx={{ fontSize: 13, color: 'text.primary', fontWeight: 500 }}>
          {label}
        </Typography>
        {hint && (
          <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.4, lineHeight: 1.5 }}>
            {hint}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 32, gap: 1 }}>
        {children}
      </Box>
    </Box>
  );
}

export function ToggleRow({ label, hint, checked, onChange, disabled }: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 2, py: 1,
      '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' },
    }}>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 500 }}>{label}</Typography>
        {hint && (
          <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.25 }}>
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
    </Box>
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
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'error.main' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25, mb: 1.5 }}>
        {description}
      </Typography>
      {children}
    </Box>
  );
}

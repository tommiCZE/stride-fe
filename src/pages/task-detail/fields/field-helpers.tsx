import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { FieldRow as SharedFieldRow } from '../../../components/field-row';

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <SharedFieldRow label={label} variant="compact">
      {children}
    </SharedFieldRow>
  );
}

export function FieldPill({ children, color, onClick, dashed }: {
  children: React.ReactNode; color?: string; onClick?: () => void; dashed?: boolean;
}) {
  return (
    <Box onClick={onClick}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.4,
        borderRadius: 0.8, fontSize: '14px', cursor: onClick ? 'default' : 'default',
        border: dashed ? '1px dashed' : 'none',
        borderColor: dashed ? 'divider' : 'transparent',
        bgcolor: dashed ? 'transparent' : (color ? alpha(color, 0.12) : 'action.hover'),
        color: color || 'text.primary',
        '&:hover': { bgcolor: color ? alpha(color, 0.18) : 'action.selected' } }}>
      {children}
    </Box>
  );
}

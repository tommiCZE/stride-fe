import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 1, alignItems: 'center', minHeight: 28 }}>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

export function FieldPill({ children, color, onClick, dashed }: {
  children: React.ReactNode; color?: string; onClick?: () => void; dashed?: boolean;
}) {
  return (
    <Box onClick={onClick}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.4,
        borderRadius: 0.8, fontSize: 14, cursor: onClick ? 'default' : 'default',
        border: dashed ? '1px dashed' : 'none',
        borderColor: dashed ? 'divider' : 'transparent',
        bgcolor: dashed ? 'transparent' : (color ? alpha(color, 0.12) : 'action.hover'),
        color: color || 'text.primary',
        '&:hover': { bgcolor: color ? alpha(color, 0.18) : 'action.selected' } }}>
      {children}
    </Box>
  );
}

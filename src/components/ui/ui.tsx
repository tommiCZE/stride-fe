import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

export const ColorDot = styled(Box, {
  shouldForwardProp: p => p !== 'dotColor' && p !== 'dotSize',
})<{ dotColor: string; dotSize?: number }>(({ dotColor, dotSize = 6 }) => ({
  width: dotSize,
  height: dotSize,
  borderRadius: '50%',
  backgroundColor: dotColor,
  flexShrink: 0,
}));

export const StatusBadge = styled(Box, {
  shouldForwardProp: p => p !== 'badgeColor',
})<{ badgeColor: string }>(({ badgeColor }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 7px',
  borderRadius: 6,
  fontSize: '13px',
  fontWeight: 600,
  lineHeight: 1.5,
  color: badgeColor,
  backgroundColor: alpha(badgeColor, 0.14),
}));

export const ColorPill = styled(Box, {
  shouldForwardProp: p => p !== 'pillColor',
})<{ pillColor: string }>(({ pillColor }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 7px',
  borderRadius: 6,
  fontSize: '13px',
  fontWeight: 600,
  color: pillColor,
  backgroundColor: alpha(pillColor, 0.12),
}));

export const MonoKey = styled(Box)(({ theme }) => ({
  fontSize: '13px',
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  color: theme.palette.text.disabled,
  fontVariantNumeric: 'tabular-nums',
  flexShrink: 0,
}));

export const SectionLabel = styled(Typography)(({ theme }) => ({
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
})) as typeof Typography;

export const CardTitle = styled(Typography)({
  fontSize: '13px',
  fontWeight: 700,
}) as typeof Typography;

export const TaskRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  paddingInline: theme.spacing(1.5),
  paddingBlock: theme.spacing(0.75),
  borderBottom: `1px solid ${theme.palette.divider}`,
  cursor: 'default',
  '&:hover': { backgroundColor: theme.palette.action.hover },
  '&:last-child': { borderBottom: 0 },
}));

export const DashedPill = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '3px 7px',
  borderRadius: 6,
  border: `1px dashed ${theme.palette.divider}`,
  fontSize: '14px',
  color: theme.palette.text.secondary,
  cursor: 'default',
  '&:hover': { backgroundColor: theme.palette.action.hover },
}));

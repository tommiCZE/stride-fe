import { Box } from '@mui/material';

interface CountBadgeProps {
  count: number;
  variant?: 'pill' | 'muted';
}

/**
 * Small numeric badge used in the sidebar to show open task counts
 * next to nav items and project links. Renders nothing when count is 0
 * to avoid cluttering rows with empty data.
 */
export default function CountBadge({ count, variant = 'pill' }: CountBadgeProps) {
  if (count <= 0) return null;

  if (variant === 'muted') {
    return (
      <Box
        component="span"
        sx={{
          fontSize: 14,
          color: 'text.disabled',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {count}
      </Box>
    );
  }

  return (
    <Box
      component="span"
      sx={{
        fontSize: 14,
        px: 0.75,
        borderRadius: 1,
        bgcolor: 'action.hover',
        color: 'text.secondary',
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {count}
    </Box>
  );
}

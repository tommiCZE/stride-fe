import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface Props {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <Stack
      role="status"
      aria-label={title}
      aria-live="polite"
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 6,
        color: 'text.secondary',
        width: '100%' }}
    >
      <Stack direction="row"
        aria-hidden="true"
        sx={{
        width: 80,
          height: 80,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          bgcolor: 'action.hover',
          color: 'text.disabled',
          mb: 2,
          '& svg': { width: 40, height: 40 } }}
      >
        {icon}
      </Stack>
      <Typography
        sx={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'text.primary',
          letterSpacing: '-0.01em',
          mb: description ? 0.5 : 0,
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          sx={{
            fontSize: '13px',
            color: 'text.secondary',
            maxWidth: 360,
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
    </Stack>
  );
}

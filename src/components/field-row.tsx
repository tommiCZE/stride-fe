import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

type FieldRowVariant = 'compact' | 'wide';

export interface FieldRowProps {
  label: string;
  hint?: string;
  children: ReactNode;
  variant?: FieldRowVariant;
  columns?: string;
}

export function FieldRow({
  label,
  hint,
  children,
  variant = 'wide',
  columns,
}: FieldRowProps) {
  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: columns ?? '110px 1fr',
          gap: 1,
          alignItems: 'center',
          minHeight: 28,
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {label}
        </Typography>
        <Box sx={{ minWidth: 0 }}>{children}</Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: columns ?? '220px 1fr',
        gap: 3,
        alignItems: 'flex-start',
        py: 1.25,
        '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' },
      }}
    >
      <Stack spacing={0.4} sx={{ pt: 0.75 }}>
        <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
          {label}
        </Typography>
        {hint && (
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
            {hint}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minHeight: 32 }}>
        {children}
      </Stack>
    </Box>
  );
}

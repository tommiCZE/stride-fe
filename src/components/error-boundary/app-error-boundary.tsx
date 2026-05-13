import type { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AlertIcon, HomeIcon, RefreshIcon } from '../icons/icons';

interface Props {
  children: ReactNode;
}

function handleNavigateHome() {
  window.location.assign('/');
}

function logError(error: unknown, info: ErrorInfo) {
  console.error('[AppErrorBoundary] Uncaught error:', error, info.componentStack);
}

function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return null;
}

function FallbackUI({ error, resetErrorBoundary }: FallbackProps) {
  const isDev = import.meta.env.DEV;
  const message = getErrorMessage(error);

  return (
    <Box
      role="alert"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.default',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 460,
          p: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'error.main',
            bgcolor: theme => alpha(theme.palette.error.main, 0.12),
          }}
        >
          <AlertIcon width={40} height={40} />
        </Box>

        <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
          <Typography variant="h5" component="h1">
            Něco se pokazilo
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
            Aplikace narazila na neočekávanou chybu. Zkus to znovu nebo refreshni stránku.
          </Typography>
        </Stack>

        {isDev && message && (
          <Box
            sx={{
              width: '100%',
              p: 1.5,
              borderRadius: 1,
              bgcolor: theme => alpha(theme.palette.error.main, 0.08),
              color: 'error.main',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
              fontSize: 12,
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message}
          </Box>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ width: '100%', mt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={resetErrorBoundary}
          >
            Zkusit znovu
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            startIcon={<HomeIcon />}
            onClick={handleNavigateHome}
          >
            Domů
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}

export default function AppErrorBoundary({ children }: Props) {
  return (
    <ErrorBoundary FallbackComponent={FallbackUI} onError={logError}>
      {children}
    </ErrorBoundary>
  );
}

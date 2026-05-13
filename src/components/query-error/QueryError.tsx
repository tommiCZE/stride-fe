import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AlertIcon, RefreshIcon } from '../icons/icons';

interface Props {
  error: unknown;
  onRetry: () => void;
  compact?: boolean;
}

function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const m = (error as { message: unknown }).message;
    if (typeof m === 'string') return m;
  }
  return null;
}

export default function QueryError({ error, onRetry, compact }: Props) {
  const message = getErrorMessage(error);

  if (compact) {
    return (
      <Box
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          borderRadius: 1,
          bgcolor: theme => alpha(theme.palette.error.main, 0.08),
          color: 'error.main',
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            color: 'error.main',
            '& svg': { width: 16, height: 16 },
          }}
        >
          <AlertIcon />
        </Box>
        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary' }}>
          Nepodařilo se načíst data
        </Typography>
        {message && (
          <Typography
            sx={{
              fontSize: 12,
              color: 'text.secondary',
              minWidth: 0,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            · {message}
          </Typography>
        )}
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          aria-label="Zkusit znovu načíst data"
          sx={{ ml: 'auto', flexShrink: 0 }}
        >
          Zkusit znovu
        </Button>
      </Box>
    );
  }

  return (
    <Box
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      aria-labelledby="query-error-title"
      sx={{
        flex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
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
          aria-hidden="true"
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'error.main',
            bgcolor: theme => alpha(theme.palette.error.main, 0.12),
            '& svg': { width: 40, height: 40 },
          }}
        >
          <AlertIcon />
        </Box>

        <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
          <Typography id="query-error-title" variant="h6" component="h2" sx={{ fontWeight: 700 }}>
            Nepodařilo se načíst data
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
            Zkontroluj připojení nebo to zkus znovu. Pokud problém přetrvává, kontaktuj podporu.
          </Typography>
        </Stack>

        {message && (
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

        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          aria-label="Zkusit znovu načíst data"
          sx={{ mt: 0.5 }}
        >
          Zkusit znovu
        </Button>
      </Card>
    </Box>
  );
}

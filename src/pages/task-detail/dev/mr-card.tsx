import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { DevMergeRequest } from '../../../types/dev-activity';

interface Props {
  mr: DevMergeRequest;
}

function stateColor(state: DevMergeRequest['state']): 'success' | 'secondary' | 'error' {
  if (state === 'open')   return 'success';
  if (state === 'merged') return 'secondary';
  return 'error';
}

export function MrCard({ mr }: Props) {
  const color = stateColor(mr.state);
  return (
    <Box sx={theme => ({
      mt: 0.5, p: 1.25, borderRadius: 1.25,
      border: 1, borderColor: 'divider',
      bgcolor: alpha(theme.palette.warning.main, 0.05),
    })}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
        <Box
          component="a"
          href={mr.url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            fontFamily: 'ui-monospace, monospace', fontSize: '13px',
            fontWeight: 700, color: 'info.main', textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          !{mr.id}
        </Box>
        <Box sx={theme => ({
          display: 'inline-flex', alignItems: 'center',
          px: 0.75, py: 0.15, borderRadius: 1,
          fontSize: '11.5px', fontWeight: 600, textTransform: 'capitalize',
          color: theme.palette[color].main,
          bgcolor: alpha(theme.palette[color].main, 0.12),
          border: `1px solid ${alpha(theme.palette[color].main, 0.4)}`,
        })}>
          {mr.state}
        </Box>
        <Box sx={{ flex: 1 }}/>
        <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>→ {mr.base}</Typography>
      </Stack>
      <Box
        component="a"
        href={mr.url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'block',
          fontSize: '13.5px', fontWeight: 600, lineHeight: 1.35,
          color: 'text.primary', textDecoration: 'none',
          '&:hover': { color: 'primary.main' },
        }}
      >
        {mr.title}
      </Box>
      <Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.5 }}>
        <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>+{mr.plus}</Box>{' '}
        <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>−{mr.minus}</Box>{' '}
        · {mr.files} {mr.files === 1 ? 'soubor' : mr.files < 5 ? 'soubory' : 'souborů'}
      </Typography>
    </Box>
  );
}

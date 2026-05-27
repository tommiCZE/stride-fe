import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import FluxAvatar from '../../../components/flux-avatar';
import { useReleaseActivity } from '../../../hooks/useReleases';
import type { ReleaseActivityItemDto } from '../../../api/types';

const TYPE_LABELS: Record<ReleaseActivityItemDto['type'], string> = {
  RELEASE_CREATED: 'vytvořil(a) verzi',
  TASK_ADDED:      'přidal(a) task',
  TASK_REMOVED:    'odebral(a) task',
  DATE_CHANGED:    'změnil(a) datum',
  RENAMED:         'přejmenoval(a)',
  PUBLISHED:       'vydal(a) verzi',
  ARCHIVED:        'archivoval(a)',
};

function describePayload(item: ReleaseActivityItemDto): string | null {
  const p = item.payload;
  if (item.type === 'TASK_ADDED' || item.type === 'TASK_REMOVED') {
    const key = typeof p['taskKey'] === 'string' ? p['taskKey'] : null;
    return key;
  }
  if (item.type === 'RENAMED') {
    const from = typeof p['fromName'] === 'string' ? p['fromName'] : null;
    const to = typeof p['toName'] === 'string' ? p['toName'] : null;
    if (from && to) return `${from} → ${to}`;
    return null;
  }
  if (item.type === 'DATE_CHANGED') {
    const field = typeof p['field'] === 'string' ? p['field'] : null;
    const to = typeof p['toValue'] === 'string' ? p['toValue'] : null;
    if (field && to) return `${field}: ${to}`;
    return null;
  }
  return null;
}

interface Props {
  releaseId: string;
}

export default function ReleaseActivityTab({ releaseId }: Props) {
  const { data: items = [], isLoading, isError } = useReleaseActivity(releaseId);

  if (isLoading) {
    return (
      <Stack direction="row" sx={{ justifyContent: 'center', py: 4 }}>
        <CircularProgress size={18}/>
      </Stack>
    );
  }

  if (isError || items.length === 0) {
    return (
      <Stack sx={{ px: { xs: 2, md: 4 }, py: 4, alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {isError ? 'Aktivitu se nepodařilo načíst.' : 'Žádná aktivita.'}
        </Typography>
      </Stack>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Stack spacing={2} sx={{ position: 'relative', maxWidth: 720 }}>
        <Box sx={{
          position: 'absolute', left: 13, top: 0, bottom: 0,
          width: 1, bgcolor: 'divider',
        }}/>
        {items.map(item => {
          const actor = item.actorName
            ? { color: item.actorColor ?? '#94a3b8', initials: item.actorInitials ?? '?' }
            : null;
          const detail = describePayload(item);
          return (
            <Stack key={item.id} direction="row" spacing={1.5} sx={{ position: 'relative', alignItems: 'flex-start' }}>
              <Box sx={{ zIndex: 1, bgcolor: 'background.default', borderRadius: '50%' }}>
                <FluxAvatar user={actor} size={28}/>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
                <Typography sx={{ fontSize: 13 }}>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {item.actorName ?? 'Systém'}
                  </Box>
                  {' '}
                  {TYPE_LABELS[item.type]}
                  {detail && (
                    <Box component="span" sx={{
                      ml: 0.75,
                      fontFamily: detail.includes('-') ? '"JetBrains Mono", ui-monospace, monospace' : undefined,
                      color: 'text.secondary',
                    }}>
                      {detail}
                    </Box>
                  )}
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                  {dayjs(item.timestamp).format('D. M. YYYY HH:mm')}
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}

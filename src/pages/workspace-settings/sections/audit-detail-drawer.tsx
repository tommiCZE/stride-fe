import { useState } from 'react';
import {
  Box, Chip, Divider, Drawer, IconButton, Stack, Typography,
} from '@mui/material';
import FluxAvatar from '../../../components/flux-avatar';
import { CloseIcon, CaretIcon } from '../../../components/icons/icons';
import type { WorkspaceAuditEntryDto } from '../../../api/workspace-audit';
import { actionLabel, sectionColor } from './audit-action-meta';
import { absoluteDateTime, relativeTime } from './relative-time';

interface Props {
  entry: WorkspaceAuditEntryDto | null;
  onClose: () => void;
}

export function AuditDetailDrawer({ entry, onClose }: Props) {
  const [rawOpen, setRawOpen] = useState(false);

  return (
    <Drawer anchor="right" open={entry !== null} onClose={onClose}>
      <Stack sx={{ width: 420, height: '100%' }}>
        <Stack direction="row" spacing={1.5} sx={{
          alignItems: 'center',
          px: 2.5, py: 1.75, borderBottom: 1, borderColor: 'divider',
        }}>
          <Typography variant="h5" sx={{ flex: 1 }}>Detail záznamu</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon/>
          </IconButton>
        </Stack>

        {entry && (
          <Stack spacing={2.5} sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2.5 }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <FluxAvatar user={entry.actorName
                ? { color: entry.actorColor ?? '#64748b', initials: entry.actorInitials ?? '?' }
                : null} size={36}/>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {entry.actorName ?? 'Systém'}
                </Typography>
                {entry.actorId && (
                  <Typography sx={{ fontSize: '12px', color: 'text.disabled', fontFamily: 'ui-monospace, monospace' }}>
                    {entry.actorId}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Box>
              <Field label="Akce">
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Chip size="small" label={actionLabel(entry.action)}
                    sx={{
                      bgcolor: theme => sectionColor(entry.section, theme) + '1f',
                      color: theme => sectionColor(entry.section, theme),
                      fontWeight: 600,
                    }}/>
                  <Typography sx={{ fontSize: '12px', color: 'text.disabled', fontFamily: 'ui-monospace, monospace' }}>
                    {entry.action}
                  </Typography>
                </Stack>
              </Field>
              <Field label="Sekce">{entry.section}</Field>
              {entry.target && <Field label="Cíl">{entry.target}</Field>}
              <Field label="Souhrn">{entry.summary}</Field>
            </Box>

            <Divider/>

            <Box>
              <Field label="Kdy (absolutně)">{absoluteDateTime(entry.occurredAt)}</Field>
              <Field label="Kdy (relativně)">{relativeTime(entry.occurredAt)}</Field>
              {entry.ip && <Field label="IP">{entry.ip}</Field>}
              {entry.userAgent && (
                <Field label="User agent">
                  <Typography sx={{ fontSize: '12px', fontFamily: 'ui-monospace, monospace',
                    wordBreak: 'break-all' }}>{entry.userAgent}</Typography>
                </Field>
              )}
            </Box>

            <Box>
              <Stack
                direction="row"
                spacing={0.5}
                onClick={() => setRawOpen(v => !v)}
                sx={{ alignItems: 'center', cursor: 'pointer',
                  color: 'text.secondary', userSelect: 'none', py: 0.75 }}
              >
                <Box sx={{ transform: rawOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>
                  <CaretIcon/>
                </Box>
                <Typography variant="label">Raw JSON</Typography>
              </Stack>
              {rawOpen && (
                <Box component="pre" sx={{
                  fontSize: '12px', fontFamily: 'ui-monospace, monospace',
                  bgcolor: 'action.hover', p: 1.5, borderRadius: 1,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all', m: 0,
                }}>
                  {JSON.stringify(entry, null, 2)}
                </Box>
              )}
            </Box>
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 1.5,
      py: 0.75, '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' } }}>
      <Typography sx={{ fontSize: '12px', color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
      <Box sx={{ fontSize: '13px' }}>{children}</Box>
    </Box>
  );
}

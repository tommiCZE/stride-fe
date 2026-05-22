import { useState } from 'react';
import {
  Alert, Avatar, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  List, ListItem, ListItemAvatar, ListItemText,
  Skeleton, Stack, Tooltip, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { SectionHeader, SettingsCard } from '../../settings/shared';
import {
  useWorkspaceIntegrations, useDisconnectWorkspaceIntegration,
} from '../../../hooks/useWorkspaceIntegrations';
import type { WorkspaceIntegrationProvider } from '../../../api/workspace-integrations';
import { IntegrationConnectDialog, PROVIDER_INFO } from './integration-connect-dialog';
import { relativeTime } from './relative-time';
import { LinkIcon } from '../../../components/icons/icons';

const SECTION_HINT = 'OAuth a webhooky na úrovni workspace. Pro per-projektové integrace použij Project settings → Integrace.';

export function WorkspaceIntegrationsSection({ readOnly }: { readOnly: boolean }) {
  const { data: integrations, isLoading } = useWorkspaceIntegrations();
  const disconnect = useDisconnectWorkspaceIntegration();
  const { enqueueSnackbar } = useSnackbar();
  const [connectingProvider, setConnectingProvider] = useState<WorkspaceIntegrationProvider | null>(null);
  const [disconnectingProvider, setDisconnectingProvider] = useState<WorkspaceIntegrationProvider | null>(null);

  if (isLoading || !integrations) {
    return (
      <>
        <SectionHeader hint={SECTION_HINT} />
        <Skeleton variant="rounded" height={260} />
      </>
    );
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => enqueueSnackbar('Webhook URL zkopírováno', { variant: 'success' }),
      () => enqueueSnackbar('Kopírování se nepovedlo', { variant: 'error' }),
    );
  };

  const handleConfirmDisconnect = () => {
    if (!disconnectingProvider) return;
    disconnect.mutate(disconnectingProvider, {
      onSuccess: () => setDisconnectingProvider(null),
    });
  };

  return (
    <>
      <SectionHeader hint={SECTION_HINT} />

      <SettingsCard title="Připojení">
        <List disablePadding>
          {integrations.map((i, idx) => {
            const info = PROVIDER_INFO[i.provider];
            const isLast = idx === integrations.length - 1;
            return (
              <ListItem
                key={i.id}
                divider={!isLast}
                alignItems="flex-start"
                disableGutters
                secondaryAction={
                  i.connected ? (
                    <Button size="small" variant="outlined" color="inherit"
                      disabled={readOnly || disconnect.isPending}
                      onClick={() => setDisconnectingProvider(i.provider)}>
                      Odpojit
                    </Button>
                  ) : (
                    <Button size="small" variant="contained"
                      disabled={readOnly}
                      onClick={() => setConnectingProvider(i.provider)}>
                      Připojit
                    </Button>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar variant="rounded" sx={{ bgcolor: info.color }}>
                    {info.name.slice(0, 1)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="label">{info.name}</Typography>
                      {i.connected && (
                        <Chip size="small" color="success" variant="outlined" label="Připojeno" />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.75}>
                      <Typography variant="caption" color="text.secondary">
                        {info.description}
                      </Typography>
                      {i.connected && (
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="text.disabled">
                            Připojeno {relativeTime(i.connectedAt)}
                          </Typography>
                          {i.webhookUrl && (
                            <Chip
                              size="small"
                              variant="outlined"
                              icon={<LinkIcon />}
                              label={i.webhookUrl}
                              onDelete={() => handleCopy(i.webhookUrl!)}
                              deleteIcon={
                                <Tooltip title="Zkopírovat">
                                  <Typography variant="caption" sx={{ px: 0.5 }}>Copy</Typography>
                                </Tooltip>
                              }
                              sx={{ fontFamily: 'ui-monospace, monospace' }}
                            />
                          )}
                        </Stack>
                      )}
                    </Stack>
                  }
                  slotProps={{ secondary: { component: 'div' } }}
                />
              </ListItem>
            );
          })}
        </List>
      </SettingsCard>

      <Alert severity="info">
        Mock OAuth — při „Autorizovat" se ve skutečnosti negeneruje žádný handshake.
        Reálné připojení per provider bude přidáno později.
      </Alert>

      <IntegrationConnectDialog
        open={connectingProvider !== null}
        provider={connectingProvider}
        onClose={() => setConnectingProvider(null)}
      />

      <Dialog open={disconnectingProvider !== null} onClose={() => setDisconnectingProvider(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Odpojit {disconnectingProvider ? PROVIDER_INFO[disconnectingProvider].name : ''}?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Webhook URL bude zneplatněn. Připojení můžeš kdykoli obnovit.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setDisconnectingProvider(null)} disabled={disconnect.isPending}>
            Zrušit
          </Button>
          <Button size="small" variant="contained" color="error"
            disabled={disconnect.isPending} onClick={handleConfirmDisconnect}>
            {disconnect.isPending ? 'Odpojuji…' : 'Odpojit'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { CheckIcon } from '../../../components/icons/icons';
import type { WorkspaceIntegrationProvider } from '../../../api/workspace-integrations';
import { useConnectWorkspaceIntegration } from '../../../hooks/useWorkspaceIntegrations';

export interface ProviderInfo {
  name: string;
  description: string;
  scopes: string[];
  color: string;
}

// eslint-disable-next-line react-refresh/only-export-components -- provider metadata colocated with dialog
export const PROVIDER_INFO: Record<WorkspaceIntegrationProvider, ProviderInfo> = {
  slack:  { name: 'Slack',  color: '#611f69',
    description: 'Sdílej notifikace o úkolech do Slack kanálů na úrovni workspace.',
    scopes: ['channels:read', 'chat:write', 'users:read'] },
  github: { name: 'GitHub', color: '#1f2328',
    description: 'Propojení s GitHub organizací — komentáře k tasku, PR linky, branch sync.',
    scopes: ['repo', 'read:org', 'admin:repo_hook'] },
  gitlab: { name: 'GitLab', color: '#fc6d26',
    description: 'Propojení s GitLab groupou — podobné funkce jako u GitHub integrace.',
    scopes: ['api', 'read_user', 'read_repository'] },
  google: { name: 'Google', color: '#4285f4',
    description: 'SSO přes Google Workspace pro celý team.',
    scopes: ['openid', 'email', 'profile'] },
};

interface Props {
  open: boolean;
  provider: WorkspaceIntegrationProvider | null;
  onClose: () => void;
}

export function IntegrationConnectDialog({ open, provider, onClose }: Props) {
  const connect = useConnectWorkspaceIntegration();
  const info = provider ? PROVIDER_INFO[provider] : null;

  if (!info || !provider) return null;

  const handleAuthorize = () => {
    connect.mutate(provider, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: '15px', fontWeight: 700, pb: 1 }}>
        Připojit {info.name}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Stack direction="row" sx={{
        width: 44, height: 44, borderRadius: 1.2,
            bgcolor: info.color, color: 'common.white',
            alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '18px' }}>{info.name.slice(0, 1)}</Stack>
          <Box>
            <Typography sx={{ fontSize: '15px', fontWeight: 600 }}>{info.name}</Typography>
            <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>{info.description}</Typography>
          </Box>
        </Stack>

        <Box>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
            Stride bude mít přístup k:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
            {info.scopes.map(s => (
              <Stack direction="row" spacing={1} key={s} component="li" sx={{ alignItems: 'center', py: 0.3 }}>
                <Stack direction="row" sx={{ color: 'success.main', alignItems: 'center' }}>
                  <CheckIcon/>
                </Stack>
                <Typography sx={{ fontSize: '13px', fontFamily: 'ui-monospace, monospace' }}>{s}</Typography>
              </Stack>
            ))}
          </Box>
        </Box>

        <Typography sx={{ fontSize: '12px', color: 'text.disabled' }}>
          Mock OAuth — žádný reálný handshake. BE jen vygeneruje webhook URL.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button size="small" onClick={onClose} disabled={connect.isPending}>Zrušit</Button>
        <Button size="small" variant="contained"
          disabled={connect.isPending} onClick={handleAuthorize}>
          {connect.isPending ? 'Autorizace…' : 'Autorizovat'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

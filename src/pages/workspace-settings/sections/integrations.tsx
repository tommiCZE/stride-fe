import { Box, Button, Typography } from '@mui/material';
import { SectionHeader, SettingsCard } from '../../settings/shared';

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  connected: boolean;
}

const INTEGRATIONS: IntegrationItem[] = [
  { id: 'slack',     name: 'Slack',     description: 'Sdílej notifikace o úkolech do Slack kanálů na úrovni workspace.', connected: false },
  { id: 'github',    name: 'GitHub',    description: 'Propojení s GitHub organizací — komentáře, PR linky, branch sync.', connected: true  },
  { id: 'gitlab',    name: 'GitLab',    description: 'Propojení s GitLab groupou — podobné funkce jako u GitHub.',         connected: false },
  { id: 'google',    name: 'Google',    description: 'SSO přes Google Workspace pro celý team.',                          connected: false },
];

export function WorkspaceIntegrationsSection({ readOnly }: { readOnly: boolean }) {
  return (
    <>
      <SectionHeader hint="OAuth a webhooky na úrovni workspace. Pro per-projektové integrace použij Project settings → Integrace." />

      <SettingsCard title="Připojení">
        {INTEGRATIONS.map((i, idx) => (
          <Box
            key={i.id}
            sx={{
              display: 'flex', alignItems: 'center', gap: 2, py: 1.5,
              borderBottom: idx === INTEGRATIONS.length - 1 ? 0 : 1, borderColor: 'divider',
            }}
          >
            <Box sx={{
              width: 36, height: 36, borderRadius: 1, bgcolor: 'action.hover',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: 'text.secondary',
            }}>
              {i.name.slice(0, 1)}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{i.name}</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
                {i.description}
              </Typography>
            </Box>
            <Button
              size="small"
              variant={i.connected ? 'outlined' : 'contained'}
              color={i.connected ? 'inherit' : 'primary'}
              disabled={readOnly}
            >
              {i.connected ? 'Odpojit' : 'Připojit'}
            </Button>
          </Box>
        ))}
      </SettingsCard>
    </>
  );
}

import { Box, Typography } from '@mui/material';
import { SectionHeader, SettingsCard } from '../../settings/shared';

interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

const ENTRIES: AuditEntry[] = [
  { id: '1', actor: 'Tomáš Veselý',  action: 'Pozval člena',           target: 'lucie.maresova@acme.cz', timestamp: 'před 12 min' },
  { id: '2', actor: 'Jana Nováková', action: 'Změnila roli',           target: 'Pavel Dvořák → admin',   timestamp: 'včera 17:22' },
  { id: '3', actor: 'Tomáš Veselý',  action: 'Odebral integraci',      target: 'Slack',                  timestamp: 'včera 09:51' },
  { id: '4', actor: 'System',         action: 'Vynucena 2FA',           target: 'všichni členové',        timestamp: 'před 3 dny' },
];

export function WorkspaceAuditSection() {
  return (
    <>
      <SectionHeader hint="Bezpečnostní log akcí na workspace levelu — pozvánky, změny rolí, mazání integrací." />

      <SettingsCard title="Poslední aktivita">
        {ENTRIES.map((e, idx) => (
          <Box
            key={e.id}
            sx={{
              display: 'flex', alignItems: 'center', gap: 2, py: 1.25,
              borderBottom: idx === ENTRIES.length - 1 ? 0 : 1, borderColor: 'divider',
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                {e.actor} · {e.action}
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.2 }}>
                {e.target}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13, color: 'text.disabled', whiteSpace: 'nowrap',
              fontVariantNumeric: 'tabular-nums' }}>
              {e.timestamp}
            </Typography>
          </Box>
        ))}
      </SettingsCard>

      <Typography sx={{ fontSize: 13, color: 'text.disabled', mt: 1 }}>
        Filtrování podle aktora, akce a časového rozsahu připravujeme.
      </Typography>
    </>
  );
}

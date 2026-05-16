import { Box, Button, Typography } from '@mui/material';
import { SectionHeader, SettingsCard } from '../shared';
import { useProjectSettings } from '../../../store/project-settings-store';
import { useProjectAuditLog } from '../../../hooks/useProjectSettingsResources';
import { useTeamMembers } from '../../../hooks/useTeam';
import type { ProjectDto } from '../../../api/types';
import { DownloadIcon, RefreshIcon } from '../../../components/icons/icons';

function formatTimeAgo(at: string) {
  const diff = Date.now() - new Date(at).getTime();
  const h = Math.floor(diff / 3600_000);
  if (h < 1) return 'právě teď';
  if (h < 24) return `${h}h zpět`;
  const d = Math.floor(h / 24);
  return `${d}d zpět`;
}

export function AdvancedSection({ project, readOnly }: { project: ProjectDto; readOnly: boolean }) {
  const { reset } = useProjectSettings(project.key);
  const audit = useProjectAuditLog(project.key);
  const { data: members = [] } = useTeamMembers();
  const userById = new Map(members.map(u => [u.id, u]));

  return (
    <Box>
      <SectionHeader
        title="Pokročilé"
        hint="Import, export, audit log a obnova výchozího nastavení."
      />

      <SettingsCard title="Import & Export">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Export projektu</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                Stáhne JSON se všemi tasky, sprinty, komentáři a nastavením.
              </Typography>
            </Box>
            <Button size="small" variant="outlined" startIcon={<DownloadIcon/>} disabled={readOnly}>
              Export JSON
            </Button>
            <Button size="small" variant="outlined" startIcon={<DownloadIcon/>} disabled={readOnly}>
              Export CSV
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Import z Jiry</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                Načte tasky z exportovaného CSV. Mapování polí v dalším kroku.
              </Typography>
            </Box>
            <Button size="small" variant="outlined" disabled={readOnly}>Načíst CSV</Button>
          </Box>
        </Box>
      </SettingsCard>

      <SettingsCard title="Audit log" description="Posledních 30 dní změn v nastavení projektu.">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {audit.data.length === 0 && (
            <Typography sx={{ fontSize: 14, color: 'text.secondary', py: 1.5, textAlign: 'center' }}>
              Zatím žádné záznamy.
            </Typography>
          )}
          {audit.data.map(e => {
            const actor = e.actorId ? userById.get(e.actorId) : null;
            return (
              <Box key={e.id} sx={{
                display: 'flex', alignItems: 'center', gap: 1, py: 0.75, px: 0.5,
                borderBottom: 1, borderColor: 'divider',
                '&:last-child': { borderBottom: 0 },
              }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main' }}/>
                <Typography sx={{ fontSize: 14, flex: 1 }}>
                  <Box component="span" sx={{ fontWeight: 600 }}>{actor?.name ?? 'System'}</Box>
                  {' · '}
                  <Box component="span" sx={{ color: 'text.secondary' }}>{e.section}</Box>
                  {' — '}
                  {e.summary}
                </Typography>
                <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>{formatTimeAgo(e.occurredAt)}</Typography>
              </Box>
            );
          })}
        </Box>
      </SettingsCard>

      <SettingsCard title="Týdenní insights" description="Souhrnný e-mail se statistikami.">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Weekly insights pro project leady</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              Velocity, blockery, top contributors, plánovaný vs. dodaný scope.
            </Typography>
          </Box>
          <Button size="small" variant="contained" disabled={readOnly}>Aktivovat</Button>
        </Box>
      </SettingsCard>

      <SettingsCard title="Obnova nastavení" description="Vrátí všechna nastavení projektu na výchozí hodnoty. Tasky a sprinty zůstávají.">
        <Button
          size="small" variant="outlined" color="error" startIcon={<RefreshIcon/>}
          disabled={readOnly} onClick={reset}
        >
          Obnovit výchozí nastavení
        </Button>
      </SettingsCard>
    </Box>
  );
}

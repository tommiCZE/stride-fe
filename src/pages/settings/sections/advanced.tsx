import { Box, Button, Stack, Typography } from '@mui/material';
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
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Stack sx={{ flex: 1 }}>
              <Typography variant="subtitle2">Export projektu</Typography>
              <Typography variant="caption" color="text.secondary">
                Stáhne JSON se všemi tasky, sprinty, komentáři a nastavením.
              </Typography>
            </Stack>
            <Button size="small" variant="outlined" startIcon={<DownloadIcon/>} disabled={readOnly}>
              Export JSON
            </Button>
            <Button size="small" variant="outlined" startIcon={<DownloadIcon/>} disabled={readOnly}>
              Export CSV
            </Button>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Stack sx={{ flex: 1 }}>
              <Typography variant="subtitle2">Import z Jiry</Typography>
              <Typography variant="caption" color="text.secondary">
                Načte tasky z exportovaného CSV. Mapování polí v dalším kroku.
              </Typography>
            </Stack>
            <Button size="small" variant="outlined" disabled={readOnly}>Načíst CSV</Button>
          </Stack>
        </Stack>
      </SettingsCard>

      <SettingsCard title="Audit log" description="Posledních 30 dní změn v nastavení projektu.">
        <Stack spacing={0.25}>
          {audit.data.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1.5, textAlign: 'center' }}>
              Zatím žádné záznamy.
            </Typography>
          )}
          {audit.data.map(e => {
            const actor = e.actorId ? userById.get(e.actorId) : null;
            return (
              <Stack key={e.id} direction="row" spacing={1} sx={{
                alignItems: 'center', py: 0.75, px: 0.5,
                borderBottom: 1, borderColor: 'divider',
                '&:last-child': { borderBottom: 0 },
              }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main' }}/>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  <Box component="span" sx={{ fontWeight: 600 }}>{actor?.name ?? 'System'}</Box>
                  {' · '}
                  <Box component="span" sx={{ color: 'text.secondary' }}>{e.section}</Box>
                  {' — '}
                  {e.summary}
                </Typography>
                <Typography variant="caption" color="text.disabled">{formatTimeAgo(e.occurredAt)}</Typography>
              </Stack>
            );
          })}
        </Stack>
      </SettingsCard>

      <SettingsCard title="Týdenní insights" description="Souhrnný e-mail se statistikami.">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Stack sx={{ flex: 1 }}>
            <Typography variant="subtitle2">Weekly insights pro project leady</Typography>
            <Typography variant="caption" color="text.secondary">
              Velocity, blockery, top contributors, plánovaný vs. dodaný scope.
            </Typography>
          </Stack>
          <Button size="small" variant="contained" disabled={readOnly}>Aktivovat</Button>
        </Stack>
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

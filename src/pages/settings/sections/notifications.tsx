import { Box, MenuItem, TextField } from '@mui/material';
import { SectionHeader, SettingsCard, FieldRow, ToggleRow } from '../shared';
import { useProjectSettings, type DigestCadence } from '../../../store/project-settings-store';
import type { ProjectDto } from '../../../api/types';

export function NotificationsSection({ project, readOnly }: { project: ProjectDto; readOnly: boolean }) {
  const { settings, update } = useProjectSettings(project.key);
  const { notifications } = settings;

  const setChannel = (key: keyof typeof notifications.channels, value: boolean) => {
    update({ notifications: { ...notifications, channels: { ...notifications.channels, [key]: value } } });
  };
  const setEvent = (key: keyof typeof notifications.events, value: boolean) => {
    update({ notifications: { ...notifications, events: { ...notifications.events, [key]: value } } });
  };

  return (
    <Box>
      <SectionHeader
        title="Notifikace"
        hint="Per-projektové preference. Globální nastavení můžeš upravit v profilu."
      />

      <SettingsCard title="Kanály" description="Kde se notifikace zobrazí.">
        <ToggleRow
          label="In-app" hint="Bell ikona v hlavičce a inbox."
          checked={notifications.channels.inApp}
          onChange={v => setChannel('inApp', v)}
          disabled={readOnly}
        />
        <ToggleRow
          label="E-mail" hint="Daily / weekly digest podle nastavení frekvence."
          checked={notifications.channels.email}
          onChange={v => setChannel('email', v)}
          disabled={readOnly}
        />
        <ToggleRow
          label="Slack" hint="Vyžaduje propojený Slack workspace v integracích."
          checked={notifications.channels.slack}
          onChange={v => setChannel('slack', v)}
          disabled={readOnly}
        />
      </SettingsCard>

      <SettingsCard title="Eventy" description="Které akce vyvolají notifikaci.">
        <ToggleRow
          label="Přiřazení tasku" hint="Task byl assignován tobě nebo někomu, koho sleduješ."
          checked={notifications.events.taskAssigned}
          onChange={v => setEvent('taskAssigned', v)}
          disabled={readOnly}
        />
        <ToggleRow
          label="Mention" hint="@zmínka v popisu nebo komentáři."
          checked={notifications.events.mention}
          onChange={v => setEvent('mention', v)}
          disabled={readOnly}
        />
        <ToggleRow
          label="Změna statusu" hint="Sledované tasky se přesunuly do jiné kolonky."
          checked={notifications.events.statusChange}
          onChange={v => setEvent('statusChange', v)}
          disabled={readOnly}
        />
        <ToggleRow
          label="Blížící se deadline" hint="Task má due date do 24 hodin."
          checked={notifications.events.dueSoon}
          onChange={v => setEvent('dueSoon', v)}
          disabled={readOnly}
        />
        <ToggleRow
          label="Nový komentář" hint="Nový komentář na watch-listed tasku."
          checked={notifications.events.commentAdded}
          onChange={v => setEvent('commentAdded', v)}
          disabled={readOnly}
        />
        <ToggleRow
          label="Změny sprintu" hint="Notifikace o úpravách sprintu (start, konec, přesun)."
          checked={notifications.events.sprintUpdated}
          onChange={v => setEvent('sprintUpdated', v)}
          disabled={readOnly}
        />
      </SettingsCard>

      <SettingsCard title="Frekvence">
        <FieldRow label="Digest" hint="Jak často sbalovat notifikace do e-mailu.">
          <TextField
            size="small" select value={notifications.digest}
            onChange={e => update({
              notifications: { ...notifications, digest: e.target.value as DigestCadence },
            })}
            disabled={readOnly} sx={{ width: 240 }}
          >
            <MenuItem value="realtime">Real-time (každá událost)</MenuItem>
            <MenuItem value="daily">Denní souhrn</MenuItem>
            <MenuItem value="weekly">Týdenní souhrn</MenuItem>
            <MenuItem value="off">Vypnuto</MenuItem>
          </TextField>
        </FieldRow>
      </SettingsCard>
    </Box>
  );
}

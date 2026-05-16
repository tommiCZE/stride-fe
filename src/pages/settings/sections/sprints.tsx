import { Box, MenuItem, Slider, TextField, Typography } from '@mui/material';
import { SectionHeader, SettingsCard, FieldRow } from '../shared';
import { useProjectSettings } from '../../../store/project-settings-store';
import type { ProjectDto } from '../../../api/types';

const WEEKDAYS = [
  { id: 1, name: 'Pondělí' },
  { id: 2, name: 'Úterý' },
  { id: 3, name: 'Středa' },
  { id: 4, name: 'Čtvrtek' },
  { id: 5, name: 'Pátek' },
];

export function SprintsSection({ project, readOnly }: { project: ProjectDto; readOnly: boolean }) {
  const { settings, update } = useProjectSettings(project.key);
  const isScrumProject = settings.kind === 'scrum';

  return (
    <Box>
      <SectionHeader
        title="Sprinty"
        hint={isScrumProject
          ? 'Nastavení sprint cyklu, kapacity a chování při uzavření.'
          : 'Tento projekt je Kanban / Bug tracker. Sprinty se nepoužívají, ale lze je předkonfigurovat.'}
      />

      <SettingsCard title="Délka a kapacita">
        <FieldRow label="Délka sprintu" hint="Doporučeno 2 týdny pro většinu týmů.">
          <TextField
            size="small" select value={settings.sprintLengthWeeks}
            onChange={e => update({ sprintLengthWeeks: Number(e.target.value) })}
            disabled={readOnly} sx={{ width: 200 }}
          >
            {[1, 2, 3, 4].map(w => (
              <MenuItem key={w} value={w}>{w} týden / týdny</MenuItem>
            ))}
          </TextField>
        </FieldRow>
        <FieldRow label="Den startu sprintu" hint="Který den v týdnu se sprint zahájí.">
          <TextField
            size="small" select value={settings.sprintStartWeekday}
            onChange={e => update({ sprintStartWeekday: Number(e.target.value) })}
            disabled={readOnly} sx={{ width: 200 }}
          >
            {WEEKDAYS.map(d => (
              <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
            ))}
          </TextField>
        </FieldRow>
        <FieldRow label="Výchozí kapacita" hint={`Cílový součet odhadů za sprint (${settings.estimateUnit}).`}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: 320 }}>
            <Slider
              size="small" value={settings.sprintCapacity}
              min={5} max={120} step={1}
              onChange={(_, v) => update({ sprintCapacity: Array.isArray(v) ? v[0] : v })}
              disabled={readOnly}
              sx={{ flex: 1 }}
            />
            <Typography sx={{ fontSize: 13, fontWeight: 600, width: 40, textAlign: 'right' }}>
              {settings.sprintCapacity}
            </Typography>
          </Box>
        </FieldRow>
        <FieldRow label="Velocity baseline" hint="Historický průměr pro nápovědu při plánování.">
          <TextField
            size="small" type="number" value={settings.velocityBaseline}
            onChange={e => update({ velocityBaseline: Number(e.target.value) })}
            disabled={readOnly} sx={{ width: 120 }}
          />
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Uzavření sprintu" description="Co se stane s nedokončenými tasky.">
        <FieldRow label="Rollover">
          <TextField
            size="small" select value={settings.sprintRollover}
            onChange={e => update({ sprintRollover: e.target.value as typeof settings.sprintRollover })}
            disabled={readOnly} sx={{ width: 280 }}
          >
            <MenuItem value="backlog">Vrátit do backlogu</MenuItem>
            <MenuItem value="next">Přesunout do dalšího sprintu</MenuItem>
            <MenuItem value="ask">Zeptat se při uzavření</MenuItem>
          </TextField>
        </FieldRow>
      </SettingsCard>
    </Box>
  );
}

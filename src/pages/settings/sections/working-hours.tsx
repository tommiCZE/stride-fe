import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { SectionHeader, SettingsCard, FieldRow } from '../shared';
import { useProjectSettings } from '../../../store/project-settings-store';
import { PlusIcon, CloseIcon } from '../../../components/icons/icons';
import type { ProjectDto } from '../../../api/types';

const WEEKDAYS = [
  { id: 1, name: 'Po' },
  { id: 2, name: 'Út' },
  { id: 3, name: 'St' },
  { id: 4, name: 'Čt' },
  { id: 5, name: 'Pá' },
  { id: 6, name: 'So' },
  { id: 7, name: 'Ne' },
];

export function WorkingHoursSection({ project, readOnly }: { project: ProjectDto; readOnly: boolean }) {
  const { settings, update } = useProjectSettings(project.key);
  const wh = settings.workingHours;

  const toggleDay = (d: number) => {
    if (readOnly) return;
    const next = wh.days.includes(d) ? wh.days.filter(x => x !== d) : [...wh.days, d].sort();
    update({ workingHours: { ...wh, days: next } });
  };

  const setStart = (start: string) => update({ workingHours: { ...wh, start } });
  const setEnd = (end: string) => update({ workingHours: { ...wh, end } });

  const addHoliday = () => {
    const today = new Date().toISOString().slice(0, 10);
    update({
      workingHours: {
        ...wh,
        holidays: [...wh.holidays, { date: today, name: 'Nový svátek' }],
      },
    });
  };
  const updateHoliday = (i: number, patch: Partial<{ date: string; name: string }>) => {
    update({
      workingHours: {
        ...wh,
        holidays: wh.holidays.map((h, j) => j === i ? { ...h, ...patch } : h),
      },
    });
  };
  const removeHoliday = (i: number) => {
    update({ workingHours: { ...wh, holidays: wh.holidays.filter((_, j) => j !== i) } });
  };

  return (
    <Box>
      <SectionHeader hint="Pracovní dny a hodiny použité pro výpočet due dates, SLA a kapacity sprintu." />

      <SettingsCard
        title="Pracovní dny a hodiny"
        description="Označte dny v týdnu, kdy tým běžně pracuje."
      >
        <FieldRow label="Dny v týdnu" hint="Klikem přepnete den. Víkend je standardně volný.">
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {WEEKDAYS.map(d => {
              const active = wh.days.includes(d.id);
              return (
                <Box
                  key={d.id}
                  onClick={() => toggleDay(d.id)}
                  sx={{
                    px: 1.25, py: 0.5, borderRadius: 0.8,
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    cursor: readOnly ? 'default' : 'pointer', userSelect: 'none',
                    border: 1,
                    borderColor: active ? 'primary.main' : 'divider',
                    bgcolor: active ? (theme => alpha(theme.palette.primary.main, 0.12)) : 'transparent',
                    color: active ? 'primary.main' : 'text.secondary',
                    opacity: readOnly ? 0.6 : 1,
                  }}
                >
                  {d.name}
                </Box>
              );
            })}
          </Box>
        </FieldRow>
        <FieldRow label="Začátek dne">
          <TextField
            size="small" type="time" value={wh.start}
            onChange={e => setStart(e.target.value)} disabled={readOnly}
            sx={{ width: 140 }}
          />
        </FieldRow>
        <FieldRow label="Konec dne">
          <TextField
            size="small" type="time" value={wh.end}
            onChange={e => setEnd(e.target.value)} disabled={readOnly}
            sx={{ width: 140 }}
          />
        </FieldRow>
      </SettingsCard>

      <SettingsCard
        title="Státní svátky a volné dny"
        description="Dny, ve kterých se task se splatností neposouvá a SLA neběží."
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {wh.holidays.map((h, i) => (
            <Box key={i} sx={{
              display: 'flex', alignItems: 'center', gap: 1, p: 1,
              borderRadius: 1, border: 1, borderColor: 'divider',
            }}>
              <TextField
                size="small" type="date" value={h.date}
                onChange={e => updateHoliday(i, { date: e.target.value })}
                disabled={readOnly}
                sx={{ width: 160 }}
              />
              <TextField
                size="small" fullWidth value={h.name}
                placeholder="Název svátku"
                onChange={e => updateHoliday(i, { name: e.target.value })}
                disabled={readOnly}
              />
              <IconButton size="small" disabled={readOnly} onClick={() => removeHoliday(i)}>
                <CloseIcon/>
              </IconButton>
            </Box>
          ))}
          {wh.holidays.length === 0 && (
            <Typography sx={{ fontSize: 12, color: 'text.disabled', py: 1, textAlign: 'center' }}>
              Žádné svátky.
            </Typography>
          )}
        </Box>
        <Button
          size="small" startIcon={<PlusIcon/>} disabled={readOnly} sx={{ mt: 1 }}
          onClick={addHoliday}
        >
          Přidat svátek
        </Button>
      </SettingsCard>
    </Box>
  );
}

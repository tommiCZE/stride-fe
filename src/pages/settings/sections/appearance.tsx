import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { SectionHeader, SettingsCard, FieldRow, ToggleRow } from '../shared';
import { useProjectSettings, type DefaultView } from '../../../store/project-settings-store';
import type { ProjectDto } from '../../../api/types';

export function AppearanceSection({ project, readOnly }: { project: ProjectDto; readOnly: boolean }) {
  const { settings, update } = useProjectSettings(project.key);
  const { appearance } = settings;

  const setAppearance = (patch: Partial<typeof appearance>) => {
    update({ appearance: { ...appearance, ...patch } });
  };

  return (
    <Box>
      <SectionHeader
        title="Vzhled boardu"
        hint="Jak vypadá board, karty a co se zobrazuje při otevření projektu."
      />

      <SettingsCard title="Výchozí pohled" description="Která stránka se otevře po kliknutí na projekt v sidebaru.">
        <FieldRow label="Výchozí view">
          <TextField
            size="small" select value={appearance.defaultView}
            onChange={e => setAppearance({ defaultView: e.target.value as DefaultView })}
            disabled={readOnly} sx={{ width: 220 }}
          >
            <MenuItem value="board">Board</MenuItem>
            <MenuItem value="backlog">Backlog</MenuItem>
            <MenuItem value="list">List</MenuItem>
            <MenuItem value="calendar">Kalendář</MenuItem>
          </TextField>
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Obsah karty" description="Co se na kartě tasku zobrazuje.">
        <ToggleRow
          label="Odhad" hint="Story points / hodiny."
          checked={appearance.cardShowEstimate}
          onChange={v => setAppearance({ cardShowEstimate: v })}
          disabled={readOnly}
        />
        <ToggleRow
          label="Labely"
          checked={appearance.cardShowLabels}
          onChange={v => setAppearance({ cardShowLabels: v })}
          disabled={readOnly}
        />
        <ToggleRow
          label="Assignee"
          checked={appearance.cardShowAssignee}
          onChange={v => setAppearance({ cardShowAssignee: v })}
          disabled={readOnly}
        />
        <ToggleRow
          label="Due date"
          checked={appearance.cardShowDue}
          onChange={v => setAppearance({ cardShowDue: v })}
          disabled={readOnly}
        />
      </SettingsCard>

      <SettingsCard title="Barevné kódování">
        <FieldRow label="Obarvit kartu podle">
          <TextField
            size="small" select value={appearance.cardColorBy}
            onChange={e => setAppearance({ cardColorBy: e.target.value as typeof appearance.cardColorBy })}
            disabled={readOnly} sx={{ width: 220 }}
          >
            <MenuItem value="none">Bez obarvení</MenuItem>
            <MenuItem value="priority">Priorita</MenuItem>
            <MenuItem value="type">Typ tasku</MenuItem>
            <MenuItem value="label">První label</MenuItem>
          </TextField>
        </FieldRow>
        <FieldRow label="Swimlanes" hint="Vodorovné dělení boardu.">
          <TextField
            size="small" select value={appearance.swimlanesBy}
            onChange={e => setAppearance({ swimlanesBy: e.target.value as typeof appearance.swimlanesBy })}
            disabled={readOnly} sx={{ width: 220 }}
          >
            <MenuItem value="none">Bez swimlanes</MenuItem>
            <MenuItem value="assignee">Podle assignee</MenuItem>
            <MenuItem value="epic">Podle epicu</MenuItem>
            <MenuItem value="priority">Podle priority</MenuItem>
          </TextField>
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Náhled karty">
        <Box sx={{
          maxWidth: 280, p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1.5,
          bgcolor: 'background.default',
          borderLeftWidth: appearance.cardColorBy === 'none' ? 1 : 3,
          borderLeftColor: appearance.cardColorBy === 'priority' ? 'warning.main'
            : appearance.cardColorBy === 'type' ? 'info.main'
            : appearance.cardColorBy === 'label' ? 'primary.main' : 'divider',
        }}>
          <Typography sx={{ fontSize: '13px', color: 'text.disabled', fontFamily: 'ui-monospace, monospace' }}>
            {project.key}-142
          </Typography>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, mb: 1 }}>
            Implement settings layout
          </Typography>
          {appearance.cardShowLabels && (
            <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
              <Box sx={{ px: 0.75, py: 0.15, borderRadius: 0.6, fontSize: '14px', fontWeight: 600,
                bgcolor: '#3b82f622', color: '#3b82f6' }}>frontend</Box>
              <Box sx={{ px: 0.75, py: 0.15, borderRadius: 0.6, fontSize: '14px', fontWeight: 600,
                bgcolor: '#10b98122', color: '#10b981' }}>tech-debt</Box>
            </Stack>
          )}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
            {appearance.cardShowEstimate && (
              <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>5 pt</Typography>
            )}
            {appearance.cardShowDue && (
              <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>· za 3 dny</Typography>
            )}
            <Box sx={{ flex: 1 }}/>
            {appearance.cardShowAssignee && (
              <Stack direction="row" sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'primary.main',
                alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '14px', fontWeight: 700 }}>TK</Stack>
            )}
          </Stack>
        </Box>
      </SettingsCard>
    </Box>
  );
}

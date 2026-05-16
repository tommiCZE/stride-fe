import { useState } from 'react';
import { Box, Button, Chip, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import { SectionHeader, SettingsCard, FieldRow } from '../shared';
import { useProjectSettings, type ProjectRoleId, type TaskStatus } from '../../../store/project-settings-store';
import {
  useProjectStatusesRes, useProjectTransitionsRes,
} from '../../../hooks/useProjectSettingsResources';
import type { ProjectDto } from '../../../api/types';
import type {
  ProjectStatusDto, ProjectWorkflowTransitionDto,
} from '../../../api/project-settings';
import { PlusIcon, CloseIcon, CheckIcon } from '../../../components/icons/icons';

type StatusCategory = 'todo' | 'in_progress' | 'done';

const CATEGORIES: { id: StatusCategory; label: string; color: string }[] = [
  { id: 'todo',        label: 'To Do',        color: '#64748b' },
  { id: 'in_progress', label: 'In Progress',  color: '#3b82f6' },
  { id: 'done',        label: 'Done',         color: '#10b981' },
];

const ROLES: { id: ProjectRoleId; label: string }[] = [
  { id: 'project_admin', label: 'Admin' },
  { id: 'contributor',   label: 'Contributor' },
  { id: 'viewer',        label: 'Viewer' },
];

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function WorkflowSection({ project, readOnly }: { project: ProjectDto; readOnly: boolean }) {
  const { settings, update } = useProjectSettings(project.key);
  const statuses = useProjectStatusesRes(project.key);
  const transitions = useProjectTransitionsRes(project.key);
  const [newDoD, setNewDoD] = useState('');

  return (
    <Box>
      <SectionHeader
        title="Workflow"
        hint="Stavy tasku, jejich přechody, WIP limity a Definition of Done."
      />

      <SettingsCard title="Statusy / sloupce boardu" description="Drag & drop pro pořadí na boardu.">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {statuses.data.map((s, i) => (
            <Box key={s.id} sx={{
              display: 'flex', alignItems: 'center', gap: 1, p: 1,
              border: 1, borderColor: 'divider', borderRadius: 1,
            }}>
              <Box sx={{ color: 'text.disabled', fontSize: 14, userSelect: 'none', cursor: 'grab' }}>≡</Box>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color }}/>
              <TextField
                size="small" value={s.name} disabled={readOnly}
                onChange={e => statuses.replace(statuses.data.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                sx={{ width: 180 }}
              />
              <TextField
                size="small" select value={s.category} disabled={readOnly}
                onChange={e => statuses.replace(statuses.data.map((x, j) => j === i ? { ...x, category: e.target.value as StatusCategory } : x))}
                sx={{ width: 160 }}
              >
                {CATEGORIES.map(c => <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>)}
              </TextField>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>WIP</Typography>
                <TextField
                  size="small" type="number" value={s.wipLimit ?? ''} disabled={readOnly}
                  placeholder="—"
                  onChange={e => statuses.replace(statuses.data.map((x, j) =>
                    j === i ? { ...x, wipLimit: e.target.value === '' ? null : Number(e.target.value) } : x,
                  ))}
                  sx={{ width: 70 }}
                />
              </Box>
              <Box sx={{ flex: 1 }}/>
              <IconButton size="small" disabled={readOnly}
                onClick={() => statuses.replace(statuses.data.filter((_, j) => j !== i))}>
                <CloseIcon/>
              </IconButton>
            </Box>
          ))}
        </Box>
        <Button
          size="small" startIcon={<PlusIcon/>} disabled={readOnly} sx={{ mt: 1 }}
          onClick={() => statuses.replace([...statuses.data, {
            id: crypto.randomUUID(),
            key: uid('S').toUpperCase(),
            name: 'Nový status',
            color: '#64748b',
            category: 'todo',
            wipLimit: null,
            sortOrder: statuses.data.length,
          }])}
        >Přidat sloupec</Button>
      </SettingsCard>

      <SettingsCard title="Přechody (transitions)" description="Které přechody mezi statusy jsou povolené, a které role je smí provést.">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {transitions.data.map((t, i) => (
            <Box key={t.id} sx={{
              display: 'flex', alignItems: 'center', gap: 1, p: 1,
              border: 1, borderColor: 'divider', borderRadius: 1,
            }}>
              <TextField
                size="small" select value={t.fromStatusKey} disabled={readOnly}
                onChange={e => transitions.replace(transitions.data.map((x, j) => j === i ? { ...x, fromStatusKey: e.target.value } : x))}
                sx={{ width: 140 }}
              >
                {statuses.data.map(s => <MenuItem key={s.id} value={s.key}>{s.name}</MenuItem>)}
              </TextField>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>→</Typography>
              <TextField
                size="small" select value={t.toStatusKey} disabled={readOnly}
                onChange={e => transitions.replace(transitions.data.map((x, j) => j === i ? { ...x, toStatusKey: e.target.value } : x))}
                sx={{ width: 140 }}
              >
                {statuses.data.map(s => <MenuItem key={s.id} value={s.key}>{s.name}</MenuItem>)}
              </TextField>
              <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
                {ROLES.map(r => {
                  const on = t.allowedRoles.includes(r.id);
                  return (
                    <Chip key={r.id} size="small" label={r.label}
                      variant={on ? 'filled' : 'outlined'}
                      color={on ? 'primary' : 'default'}
                      onClick={readOnly ? undefined : () => transitions.replace(transitions.data.map((x, j) =>
                        j === i ? {
                          ...x,
                          allowedRoles: on ? x.allowedRoles.filter(rr => rr !== r.id) : [...x.allowedRoles, r.id],
                        } : x,
                      ))}
                    />
                  );
                })}
              </Box>
              <IconButton size="small" disabled={readOnly}
                onClick={() => transitions.replace(transitions.data.filter((_, j) => j !== i))}>
                <CloseIcon/>
              </IconButton>
            </Box>
          ))}
        </Box>
        <Button
          size="small" startIcon={<PlusIcon/>} disabled={readOnly} sx={{ mt: 1 }}
          onClick={() => transitions.replace([...transitions.data, {
            id: crypto.randomUUID(),
            fromStatusKey: statuses.data[0]?.key ?? 'TODO',
            toStatusKey: statuses.data[0]?.key ?? 'TODO',
            allowedRoles: ['project_admin', 'contributor'],
            sortOrder: transitions.data.length,
          }])}
        >Přidat přechod</Button>
      </SettingsCard>

      <SettingsCard title="Auto-transitions" description="Pravidla která automaticky mění status tasku na základě GitHub / GitLab eventu. Task musí být referencovaný v PR/MR titulu nebo v názvu větve (např. PROJ-42).">
        <FieldRow label="Otevřený PR / MR" hint="Při otevření pull/merge requestu s referencí na task.">
          <AutoTransitionSelect
            value={settings.autoTransitions.prOpened}
            onChange={v => update({ autoTransitions: { ...settings.autoTransitions, prOpened: v } })}
            readOnly={readOnly}
          />
        </FieldRow>
        <FieldRow label="Merged PR / MR" hint="Po merge.">
          <AutoTransitionSelect
            value={settings.autoTransitions.prMerged}
            onChange={v => update({ autoTransitions: { ...settings.autoTransitions, prMerged: v } })}
            readOnly={readOnly}
          />
        </FieldRow>
        <FieldRow label="Branch vytvořena" hint="Push nové větve s task key v názvu.">
          <AutoTransitionSelect
            value={settings.autoTransitions.branchCreated}
            onChange={v => update({ autoTransitions: { ...settings.autoTransitions, branchCreated: v } })}
            readOnly={readOnly}
          />
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Definition of Done" description="Checklist co musí splnit task před přesunem do Done.">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
          {settings.definitionOfDone.map((dod, i) => (
            <Box key={i} sx={{
              display: 'flex', alignItems: 'center', gap: 1, p: 1,
              border: 1, borderColor: 'divider', borderRadius: 1,
            }}>
              <Box sx={{
                width: 18, height: 18, borderRadius: 0.5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'success.main', color: '#fff',
              }}>
                <CheckIcon/>
              </Box>
              <TextField
                size="small" value={dod} disabled={readOnly}
                onChange={e => update({
                  definitionOfDone: settings.definitionOfDone.map((x, j) => j === i ? e.target.value : x),
                })}
                fullWidth
              />
              <IconButton size="small" disabled={readOnly}
                onClick={() => update({
                  definitionOfDone: settings.definitionOfDone.filter((_, j) => j !== i),
                })}>
                <CloseIcon/>
              </IconButton>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small" fullWidth placeholder="Přidat položku do checklistu"
            value={newDoD} onChange={e => setNewDoD(e.target.value)}
            disabled={readOnly}
          />
          <Button
            size="small" variant="contained" disabled={readOnly || !newDoD}
            onClick={() => {
              update({ definitionOfDone: [...settings.definitionOfDone, newDoD] });
              setNewDoD('');
            }}
          >Přidat</Button>
        </Box>
      </SettingsCard>
    </Box>
  );
}

const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO',        label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW',   label: 'In Review' },
  { value: 'DONE',        label: 'Done' },
];

function AutoTransitionSelect({ value, onChange, readOnly }: {
  value: TaskStatus | null;
  onChange: (v: TaskStatus | null) => void;
  readOnly: boolean;
}) {
  return (
    <TextField
      size="small" select value={value ?? ''} disabled={readOnly}
      onChange={e => onChange(e.target.value === '' ? null : e.target.value as TaskStatus)}
      sx={{ width: 200 }}
      slotProps={{ select: { displayEmpty: true } }}
    >
      <MenuItem value="">— vypnuto —</MenuItem>
      {TASK_STATUS_OPTIONS.map(o => (
        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
      ))}
    </TextField>
  );
}

// avoid unused-imports complaints
export type _Unused = ProjectStatusDto | ProjectWorkflowTransitionDto;

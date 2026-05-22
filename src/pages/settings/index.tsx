import { useState } from 'react';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useParams, useSearchParams } from 'react-router-dom';
import { useIsMutating } from '@tanstack/react-query';
import { useProjects } from '../../hooks/useProjects';
import { usePermissions } from '../../hooks/usePermissions';
import { projectSettingsKeys } from '../../store/project-settings-store';
import { GeneralSection } from './sections/general';
import { MembersSection } from './sections/members';
import { PermissionsSection } from './sections/permissions';
import { TaskConfigSection } from './sections/task-config';
import { WorkflowSection } from './sections/workflow';
import { SprintsSection } from './sections/sprints';
import { NotificationsSection } from './sections/notifications';
import { IntegrationsSection } from './sections/integrations';
import { AppearanceSection } from './sections/appearance';
import { AdvancedSection } from './sections/advanced';
import { ReleasesSection } from './sections/releases';
import { WorkingHoursSection } from './sections/working-hours';

type SectionId =
  | 'general' | 'members' | 'permissions' | 'tasks' | 'workflow'
  | 'sprints' | 'releases' | 'working-hours'
  | 'notifications' | 'integrations' | 'appearance' | 'advanced';

interface SectionEntry {
  id: SectionId;
  group: string;
  label: string;
}

const SECTIONS: SectionEntry[] = [
  { id: 'general',       group: 'Projekt', label: 'Obecné' },
  { id: 'members',       group: 'Projekt', label: 'Členové' },
  { id: 'permissions',   group: 'Projekt', label: 'Oprávnění' },

  { id: 'tasks',         group: 'Práce',   label: 'Tasky a labely' },
  { id: 'workflow',      group: 'Práce',   label: 'Workflow' },
  { id: 'sprints',       group: 'Práce',   label: 'Sprinty' },
  { id: 'releases',      group: 'Práce',   label: 'Releases' },
  { id: 'working-hours', group: 'Práce',   label: 'Pracovní doba' },

  { id: 'notifications', group: 'Doručení',label: 'Notifikace' },
  { id: 'integrations',  group: 'Doručení',label: 'Integrace' },

  { id: 'appearance',    group: 'Pohled',  label: 'Vzhled boardu' },
  { id: 'advanced',      group: 'Pohled',  label: 'Pokročilé' },
];

export default function Settings() {
  const { projectKey } = useParams<{ projectKey: string }>();
  const { data: projects = [] } = useProjects();
  const { isAdmin } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = (searchParams.get('section') as SectionId | null) ?? 'general';
  const [section, setSectionState] = useState<SectionId>(
    SECTIONS.some(s => s.id === initial) ? initial : 'general',
  );

  const setSection = (id: SectionId) => {
    setSectionState(id);
    const next = new URLSearchParams(searchParams);
    next.set('section', id);
    setSearchParams(next, { replace: true });
  };

  const project = projects.find(p => p.key === projectKey);
  const isSaving = useIsMutating({
    mutationKey: projectKey ? projectSettingsKeys.byKey(projectKey) : ['__none__'],
  }) > 0;
  if (!project) return null;
  const readOnly = !isAdmin;

  const current = SECTIONS.find(s => s.id === section)!;
  const groups = Array.from(new Set(SECTIONS.map(s => s.group)));

  return (
    <Stack direction="row" sx={{ flex: 1, height: '100%', overflow: 'hidden', bgcolor: 'background.default' }}>
      <Box sx={{
        width: 200, flexShrink: 0,
        borderRight: 1, borderColor: 'divider',
        bgcolor: 'background.paper',
        overflowY: 'auto', py: 1.5,
      }}>
        {groups.map((group, gi) => (
          <Box key={group} sx={{ mb: gi === groups.length - 1 ? 0 : 0.5 }}>
            <Typography sx={{
              px: 2, pt: gi === 0 ? 0.25 : 1.5, pb: 0.5,
              fontSize: '14px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'text.disabled',
            }}>{group}</Typography>
            {SECTIONS.filter(s => s.group === group).map(s => {
              const active = s.id === section;
              return (
                <Box
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  sx={{
                    mx: 1, px: 1.25, py: 0.65,
                    cursor: 'pointer', borderRadius: 1,
                    fontSize: '13px',
                    fontWeight: active ? 600 : 500,
                    color: active ? 'primary.main' : 'text.primary',
                    bgcolor: active ? (theme => alpha(theme.palette.primary.main, 0.10)) : 'transparent',
                    '&:hover': { bgcolor: active ? undefined : 'action.hover' },
                  }}
                >{s.label}</Box>
              );
            })}
          </Box>
        ))}
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Box sx={{
          position: 'sticky', top: 0, zIndex: 1,
          px: 4, pt: 2.5, pb: 1.75,
          bgcolor: 'background.default',
          borderBottom: 1, borderColor: 'divider',
        }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.5 }}>
                {current.group} · {project.name}
              </Typography>
              <Typography sx={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                {current.label}
              </Typography>
            </Box>
            {isSaving && (
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', pb: 0.5, color: 'text.secondary' }}>
                <CircularProgress size={12} thickness={5}/>
                <Typography sx={{ fontSize: '13px' }}>Ukládám…</Typography>
              </Stack>
            )}
          </Stack>
        </Box>

        <Box sx={{ px: 4, py: 3, maxWidth: 960 }}>
          {readOnly && (
            <Alert severity="info" sx={{ mb: 2, fontSize: '14px' }}>
              Nastavení projektu může upravovat pouze administrátor. Změny se neuloží.
            </Alert>
          )}

          {section === 'general'       && <GeneralSection project={project} readOnly={readOnly}/>}
          {section === 'members'       && <MembersSection project={project} readOnly={readOnly}/>}
          {section === 'permissions'   && <PermissionsSection project={project} readOnly={readOnly}/>}
          {section === 'tasks'         && <TaskConfigSection project={project} readOnly={readOnly}/>}
          {section === 'workflow'      && <WorkflowSection project={project} readOnly={readOnly}/>}
          {section === 'sprints'       && <SprintsSection project={project} readOnly={readOnly}/>}
          {section === 'releases'      && <ReleasesSection project={project} readOnly={readOnly}/>}
          {section === 'working-hours' && <WorkingHoursSection project={project} readOnly={readOnly}/>}
          {section === 'notifications' && <NotificationsSection project={project} readOnly={readOnly}/>}
          {section === 'integrations'  && <IntegrationsSection project={project} readOnly={readOnly}/>}
          {section === 'appearance'    && <AppearanceSection project={project} readOnly={readOnly}/>}
          {section === 'advanced'      && <AdvancedSection project={project} readOnly={readOnly}/>}
        </Box>
      </Box>
    </Stack>
  );
}

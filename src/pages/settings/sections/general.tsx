import { useEffect, useState } from 'react';
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import FluxAvatar from '../../../components/flux-avatar';
import { SectionHeader, SettingsCard, FieldRow, ColorSwatch, COLOR_PALETTE, DangerCard } from '../shared';
import { useProjectSettings } from '../../../store/project-settings-store';
import { useUpdateProject, useDeleteProject, projectKeys } from '../../../hooks/useProjects';
import type { ProjectDto, UpdateProjectRequest } from '../../../api/types';

const ICON_CHOICES = ['📦', '🚀', '🎯', '🛠️', '✨', '🧪', '🐛', '🎨', '🔧', '📊', '🧭', '🌐'];

export function GeneralSection({ project, readOnly }: { project: ProjectDto; readOnly: boolean }) {
  const { settings, update } = useProjectSettings(project.key);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [draft, setDraft] = useState({
    name: project.name,
    color: project.color,
    icon: project.icon,
  });

  useEffect(() => {
    setDraft({ name: project.name, color: project.color, icon: project.icon });
  }, [project.id, project.name, project.color, project.icon]);

  const isDirty =
    draft.name !== project.name ||
    draft.color !== project.color ||
    draft.icon !== project.icon;

  const saveProject = () => {
    if (!isDirty) return;
    const body: UpdateProjectRequest = {};
    if (draft.name !== project.name)   body.name   = draft.name;
    if (draft.color !== project.color) body.color  = draft.color;
    if (draft.icon !== project.icon)   body.icon   = draft.icon;
    updateProject.mutate(
      { id: project.id, body },
      {
        onSuccess: () => {
          enqueueSnackbar('Projekt aktualizován', { variant: 'success' });
          qc.invalidateQueries({ queryKey: projectKeys.byKey(project.key) });
        },
        onError: () => enqueueSnackbar('Chyba při ukládání projektu', { variant: 'error' }),
      },
    );
  };

  const [confirmKey, setConfirmKey] = useState('');

  const handleDeleteProject = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        enqueueSnackbar('Projekt smazán', { variant: 'success' });
        navigate('/');
      },
      onError: () => enqueueSnackbar('Chyba při mazání projektu', { variant: 'error' }),
    });
  };

  return (
    <Box>
      <SectionHeader hint="Základní informace o projektu, jeho viditelnosti a způsobu vedení."/>

      <SettingsCard
        title="Identifikace"
        description="Veřejně viditelná pole — uloží se přímo do backendu."
        action={
          <Button
            size="small" variant="contained"
            disabled={readOnly || !isDirty || updateProject.isPending}
            onClick={saveProject}
          >
            {updateProject.isPending ? 'Ukládání…' : 'Uložit'}
          </Button>
        }
      >
        <FieldRow label="Název projektu" hint="Jak se projekt zobrazuje v sidebaru a hlavičkách.">
          <TextField
            size="small" fullWidth value={draft.name}
            onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
            disabled={readOnly}
          />
        </FieldRow>
        <FieldRow label="Klíč" hint="Prefix u všech tasků (např. WEB-142). Měnit lze pouze prázdný projekt.">
          <TextField
            size="small" value={project.key} disabled
            sx={{ width: 160, '& .MuiInputBase-root': { fontFamily: 'ui-monospace, monospace' } }}
          />
        </FieldRow>
        <FieldRow label="Lead" hint="Hlavní zodpovědná osoba.">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {project.lead && (
              <>
                <FluxAvatar user={project.lead} size={22}/>
                <Typography sx={{ fontSize: 13 }}>{project.lead.name}</Typography>
              </>
            )}
            <Button size="small" variant="outlined" disabled={readOnly} sx={{ ml: 1 }}>Změnit</Button>
          </Box>
        </FieldRow>
        <FieldRow label="Ikona">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {ICON_CHOICES.map(ic => (
              <Box
                key={ic}
                onClick={() => !readOnly && setDraft(d => ({ ...d, icon: ic }))}
                sx={{
                  width: 30, height: 30, borderRadius: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, cursor: readOnly ? 'default' : 'pointer',
                  border: 1, borderColor: draft.icon === ic ? 'primary.main' : 'divider',
                  bgcolor: draft.icon === ic ? 'action.selected' : 'background.paper',
                }}
              >{ic}</Box>
            ))}
          </Box>
        </FieldRow>
        <FieldRow label="Barva">
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            {COLOR_PALETTE.map(c => (
              <ColorSwatch
                key={c}
                color={c}
                selected={c === draft.color}
                onClick={readOnly ? undefined : () => setDraft(d => ({ ...d, color: c }))}
              />
            ))}
          </Box>
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Popis a kategorie" description="Slouží pro filtrování v dashboardu a kontext pro nového člena týmu.">
        <FieldRow label="Popis projektu" hint="Stručně co projekt řeší, kdo jsou stakeholdeři.">
          <TextField
            size="small" fullWidth multiline minRows={3}
            placeholder="Krátký popis projektu…"
            value={settings.description}
            onChange={e => update({ description: e.target.value })}
            disabled={readOnly}
          />
        </FieldRow>
        <FieldRow label="Kategorie">
          <TextField
            size="small" select value={settings.category || 'engineering'}
            onChange={e => update({ category: e.target.value })}
            disabled={readOnly}
            sx={{ width: 220 }}
          >
            <MenuItem value="engineering">Engineering</MenuItem>
            <MenuItem value="design">Design</MenuItem>
            <MenuItem value="marketing">Marketing</MenuItem>
            <MenuItem value="ops">Operations</MenuItem>
            <MenuItem value="research">Research</MenuItem>
            <MenuItem value="other">Ostatní</MenuItem>
          </TextField>
        </FieldRow>
        <FieldRow label="Typ projektu" hint="Mění chování boardu, backlogu a reportů.">
          <TextField
            size="small" select value={settings.kind}
            onChange={e => update({ kind: e.target.value as typeof settings.kind })}
            disabled={readOnly}
            sx={{ width: 220 }}
          >
            <MenuItem value="scrum">Scrum (se sprinty)</MenuItem>
            <MenuItem value="kanban">Kanban (kontinuální tok)</MenuItem>
            <MenuItem value="bugtracker">Bug tracker</MenuItem>
          </TextField>
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Viditelnost a přístupnost">
        <FieldRow label="Viditelnost" hint="Kdo projekt vidí v sidebaru a vyhledávání.">
          <TextField
            size="small" select value={settings.visibility}
            onChange={e => update({ visibility: e.target.value as typeof settings.visibility })}
            disabled={readOnly}
            sx={{ width: 320 }}
          >
            <MenuItem value="private">Soukromý — jen členové projektu</MenuItem>
            <MenuItem value="workspace">Workspace — všichni ve firmě</MenuItem>
            <MenuItem value="public">Veřejný — i přes sdílený odkaz</MenuItem>
          </TextField>
        </FieldRow>
      </SettingsCard>

      <DangerCard
        title="Nebezpečná zóna"
        description="Tyto akce jsou nevratné nebo skryjí projekt z navigace. Pokračuj s rozvahou."
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                {settings.archived ? 'Obnovit projekt' : 'Archivovat projekt'}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
                Archivovaný projekt zmizí z navigace, ale data zůstávají.
              </Typography>
            </Box>
            <Button
              size="small" variant="outlined" disabled={readOnly}
              onClick={() => update({ archived: !settings.archived })}
            >
              {settings.archived ? 'Obnovit' : 'Archivovat'}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Smazat projekt</Typography>
              <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
                Smaže všechny tasky, sprinty a komentáře. Pro potvrzení napiš klíč „{project.key}”.
              </Typography>
            </Box>
            <TextField
              size="small" placeholder={project.key} value={confirmKey}
              onChange={e => setConfirmKey(e.target.value)}
              disabled={readOnly}
              sx={{ width: 140, '& .MuiInputBase-root': { fontFamily: 'ui-monospace, monospace' } }}
            />
            <Button
              size="small" color="error" variant="contained"
              disabled={readOnly || confirmKey !== project.key || deleteProject.isPending}
              onClick={handleDeleteProject}
            >
              Smazat
            </Button>
          </Box>
        </Box>
      </DangerCard>
    </Box>
  );
}

import { useState } from 'react';
import { Box, Button, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { SectionHeader, SettingsCard } from '../shared';
import { useReleases, useCreateRelease, useUpdateRelease, useDeleteRelease } from '../../../hooks/useReleases';
import { PlusIcon, CloseIcon } from '../../../components/icons/icons';
import type { ProjectDto, ReleaseDto, ReleaseStatus } from '../../../api/types';

const STATUS_META: Record<ReleaseStatus, { label: string; color: string }> = {
  unreleased: { label: 'Plánováno', color: 'warning.main' },
  released:   { label: 'Vydáno',    color: 'success.main' },
  archived:   { label: 'Archiv',    color: 'text.disabled' },
};

function StatusChip({ status }: { status: ReleaseStatus }) {
  const m = STATUS_META[status];
  return (
    <Box sx={{
      px: 0.75, py: 0.15, borderRadius: 0.75,
      fontSize: '14px', fontWeight: 700,
      color: m.color, bgcolor: theme => alpha(theme.palette.primary.main, 0),
      border: 1, borderColor: m.color,
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: m.color }}/>
      {m.label}
    </Box>
  );
}

export function ReleasesSection({ project, readOnly }: { project: ProjectDto; readOnly: boolean }) {
  const { data: releases = [], isLoading } = useReleases(project.id);
  const createRelease = useCreateRelease();
  const updateRelease = useUpdateRelease();
  const deleteRelease = useDeleteRelease(project.id);
  const { enqueueSnackbar } = useSnackbar();

  const handleCreate = () => {
    if (readOnly) return;
    const name = `v${releases.length + 1}.0.0`;
    createRelease.mutate(
      { projectId: project.id, name },
      {
        onSuccess: () => enqueueSnackbar('Release vytvořen', { variant: 'success' }),
        onError:   () => enqueueSnackbar('Chyba při vytváření release', { variant: 'error' }),
      },
    );
  };

  return (
    <Box>
      <SectionHeader
        hint="Verze projektu pro plánování a release notes. Tasky lze připojit přes pole „Fix version”."
      />

      <SettingsCard
        title="Verze"
        description={isLoading
          ? 'Načítám…'
          : `${releases.length} ${releases.length === 1 ? 'verze' : releases.length < 5 ? 'verze' : 'verzí'}`}
        action={
          <Button
            size="small" variant="contained" startIcon={<PlusIcon/>}
            disabled={readOnly || createRelease.isPending} onClick={handleCreate}
          >
            Přidat verzi
          </Button>
        }
      >
        <Stack spacing={0.5} >
          {releases.length === 0 && !isLoading && (
            <Typography sx={{ fontSize: '14px', color: 'text.disabled', textAlign: 'center', py: 2 }}>
              Žádné verze. Začni klikem na „Přidat verzi”.
            </Typography>
          )}
          {releases.map(r => (
            <ReleaseRow
              key={r.id}
              release={r}
              readOnly={readOnly}
              onUpdate={patch => updateRelease.mutate({ id: r.id, body: patch })}
              onDelete={() => deleteRelease.mutate(r.id)}
            />
          ))}
        </Stack>
      </SettingsCard>
    </Box>
  );
}

function ReleaseRow({ release, readOnly, onUpdate, onDelete }: {
  release: ReleaseDto;
  readOnly: boolean;
  onUpdate: (patch: Partial<ReleaseDto>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const progress = release.taskCount > 0
    ? Math.round((release.doneCount / release.taskCount) * 100)
    : 0;

  return (
    <Stack spacing={1} sx={{
        border: 1, borderColor: 'divider', borderRadius: 1, p: 1.25 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <TextField
          size="small" value={release.name} disabled={readOnly}
          onChange={e => onUpdate({ name: e.target.value })}
          sx={{ width: 200, '& .MuiInputBase-root': { fontFamily: 'ui-monospace, monospace', fontWeight: 600 } }}
        />
        <TextField
          size="small" select value={release.status} disabled={readOnly}
          onChange={e => onUpdate({ status: e.target.value as ReleaseStatus })}
          sx={{ width: 140 }}
        >
          <MenuItem value="unreleased">Plánováno</MenuItem>
          <MenuItem value="released">Vydáno</MenuItem>
          <MenuItem value="archived">Archiv</MenuItem>
        </TextField>
        <StatusChip status={release.status}/>
        <Box sx={{ flex: 1 }}/>
        <Typography sx={{ fontSize: '13px', color: 'text.disabled' }}>
          {release.doneCount} / {release.taskCount} done · {progress}%
        </Typography>
        <Button
          size="small" variant="text"
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? 'Méně' : 'Detail'}
        </Button>
        <IconButton size="small" disabled={readOnly} onClick={onDelete}>
          <CloseIcon/>
        </IconButton>
      </Stack>

      {expanded && (
        <Stack spacing={1} sx={{ mt: 0.5,
          pl: 1, borderLeft: 2, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} >
            <TextField
              size="small" label="Start" type="date" disabled={readOnly}
              value={release.startDate ?? ''}
              onChange={e => onUpdate({ startDate: e.target.value || null })}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 180 }}
            />
            <TextField
              size="small" label="Release date" type="date" disabled={readOnly}
              value={release.releaseDate ?? ''}
              onChange={e => onUpdate({ releaseDate: e.target.value || null })}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 180 }}
            />
          </Stack>
          <TextField
            size="small" fullWidth multiline minRows={2}
            label="Goal" placeholder="Co tato verze přináší"
            value={release.goal ?? ''} disabled={readOnly}
            onChange={e => onUpdate({ goal: e.target.value || null })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small" fullWidth multiline minRows={2}
            label="Popis" placeholder="Volitelné poznámky"
            value={release.description ?? ''} disabled={readOnly}
            onChange={e => onUpdate({ description: e.target.value || null })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      )}
    </Stack>
  );
}

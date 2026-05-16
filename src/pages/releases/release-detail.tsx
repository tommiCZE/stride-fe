import { useMemo } from 'react';
import { Box, Button, CircularProgress, MenuItem, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useProjects } from '../../hooks/useProjects';
import { useRelease, useReleaseTasks, useUpdateRelease, useDeleteRelease } from '../../hooks/useReleases';
import TypeIcon from '../../components/icons/type-icon';
import PriorityIcon from '../../components/icons/priority-icon';
import FluxAvatar from '../../components/flux-avatar';
import { BOARD_STATUSES } from '../../constants/statuses';
import { TASK_TYPES } from '../../constants/taskTypes';
import { useTeamMembers } from '../../hooks/useTeam';
import type { ReleaseStatus, TaskSummaryDto } from '../../api/types';

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
      fontSize: 10.5, fontWeight: 700,
      color: m.color,
      border: 1, borderColor: m.color,
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: m.color }}/>
      {m.label}
    </Box>
  );
}

function buildReleaseNotes(release: { name: string; goal: string | null; releaseDate: string | null }, tasks: TaskSummaryDto[]): string {
  const done = tasks.filter(t => t.status === 'DONE');
  const byType = new Map<string, TaskSummaryDto[]>();
  for (const t of done) {
    const arr = byType.get(t.type) ?? [];
    arr.push(t);
    byType.set(t.type, arr);
  }

  const lines: string[] = [];
  lines.push(`# ${release.name}`);
  if (release.releaseDate) lines.push('', `_Vydáno ${release.releaseDate}_`);
  if (release.goal) lines.push('', release.goal);

  for (const tt of TASK_TYPES) {
    const items = byType.get(tt.id.toUpperCase());
    if (!items?.length) continue;
    lines.push('', `## ${tt.name}`);
    for (const t of items) lines.push(`- **${t.key}** — ${t.title}`);
  }

  if (done.length === 0) {
    lines.push('', '_Zatím žádné dokončené tasky._');
  }

  return lines.join('\n');
}

export default function ReleaseDetailPage() {
  const { projectKey, releaseId } = useParams<{ projectKey: string; releaseId: string }>();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  const { data: projects = [] } = useProjects();
  const project = projects.find(p => p.key === projectKey);
  const { data: release, isLoading } = useRelease(releaseId);
  const { data: tasks = [] } = useReleaseTasks(releaseId);
  const { data: members = [] } = useTeamMembers();
  const updateRelease = useUpdateRelease();
  const deleteRelease = useDeleteRelease(project?.id ?? '');

  const notesMarkdown = useMemo(
    () => release ? buildReleaseNotes(release, tasks) : '',
    [release, tasks],
  );

  if (!project) return null;
  if (isLoading || !release) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={20}/>
      </Box>
    );
  }

  const progress = release.taskCount > 0
    ? Math.round((release.doneCount / release.taskCount) * 100)
    : 0;

  const handleStatus = (next: ReleaseStatus) => {
    updateRelease.mutate({ id: release.id, body: { status: next } });
  };

  const handleCopyNotes = async () => {
    try {
      await navigator.clipboard.writeText(notesMarkdown);
      enqueueSnackbar('Release notes zkopírovány', { variant: 'success' });
    } catch {
      enqueueSnackbar('Kopírování selhalo', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    if (!window.confirm(`Smazat verzi „${release.name}”?`)) return;
    deleteRelease.mutate(release.id, {
      onSuccess: () => {
        enqueueSnackbar('Verze smazána', { variant: 'success' });
        navigate(`/projects/${project.key}/releases`);
      },
    });
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 1,
        px: { xs: 2, md: 4 }, pt: 2.5, pb: 2,
        bgcolor: 'background.default',
        borderBottom: 1, borderColor: 'divider',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography
            onClick={() => navigate(`/projects/${project.key}/releases`)}
            sx={{ fontSize: 11.5, color: 'text.secondary', cursor: 'default',
              '&:hover': { color: 'text.primary', textDecoration: 'underline' } }}
          >
            ← Releases
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography sx={{
            fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
            fontFamily: 'ui-monospace, monospace',
          }}>{release.name}</Typography>
          <StatusChip status={release.status}/>
        </Box>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 320px' },
        gap: 3, px: { xs: 2, md: 4 }, py: 3,
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ flex: 1, height: 8, borderRadius: 4,
              bgcolor: 'action.hover', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${progress}%`,
                bgcolor: release.status === 'released' ? 'success.main' : 'primary.main',
                transition: '0.3s' }}/>
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600,
              fontVariantNumeric: 'tabular-nums', minWidth: 120, textAlign: 'right' }}>
              {release.doneCount} / {release.taskCount} dokončeno
            </Typography>
          </Box>

          <Typography sx={{ fontSize: 10.5, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'text.disabled', mb: 0.75 }}>
            Tasky v této verzi
          </Typography>

          {tasks.length === 0 ? (
            <Box sx={{
              p: 3, textAlign: 'center', border: 1, borderStyle: 'dashed',
              borderColor: 'divider', borderRadius: 1.25, color: 'text.secondary',
            }}>
              <Typography sx={{ fontSize: 12 }}>
                Žádné tasky. V detailu tasku nastavte „Fix version” na tuto verzi.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {tasks.map(t => {
                const assignee = t.assigneeId ? members.find(m => m.id === t.assigneeId) : null;
                const status = BOARD_STATUSES.find(s => s.id === t.status);
                return (
                  <Box
                    key={t.id}
                    onClick={() => setSearchParams(prev => {
                      const next = new URLSearchParams(prev);
                      next.set('task', t.key);
                      return next;
                    })}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.25,
                      px: 1.25, py: 0.85,
                      borderBottom: 1, borderColor: 'divider',
                      cursor: 'default',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <TypeIcon type={t.type} size={14}/>
                    <Typography sx={{
                      fontFamily: 'ui-monospace, monospace', fontSize: 11.5,
                      fontWeight: 600, color: 'text.disabled', width: 80,
                    }}>{t.key}</Typography>
                    <Typography sx={{ fontSize: 13, flex: 1, minWidth: 0,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.title}
                    </Typography>
                    <PriorityIcon priority={t.priority}/>
                    {status && (
                      <Box sx={{
                        px: 0.75, py: 0.1, borderRadius: 0.75,
                        fontSize: 10, fontWeight: 700,
                        color: status.color, bgcolor: alpha(status.color, 0.13),
                        border: 1, borderColor: alpha(status.color, 0.4),
                      }}>
                        {status.name}
                      </Box>
                    )}
                    {assignee ? <FluxAvatar user={assignee} size={20}/>
                      : <Box sx={{ width: 20, height: 20 }}/>}
                  </Box>
                );
              })}
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Typography sx={{ fontSize: 10.5, fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.disabled' }}>
                Release notes
              </Typography>
              <Button size="small" variant="text" onClick={handleCopyNotes}>
                Kopírovat markdown
              </Button>
            </Box>
            <Box sx={{
              p: 2, border: 1, borderColor: 'divider', borderRadius: 1.25,
              bgcolor: 'background.paper',
              fontFamily: 'ui-monospace, monospace', fontSize: 12,
              whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto',
            }}>
              {notesMarkdown}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{
            border: 1, borderColor: 'divider', borderRadius: 1.5, p: 2,
            bgcolor: 'background.paper',
            display: 'flex', flexDirection: 'column', gap: 1.25,
          }}>
            <TextField
              size="small" label="Název" fullWidth value={release.name}
              onChange={e => updateRelease.mutate({ id: release.id, body: { name: e.target.value } })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small" label="Status" fullWidth select value={release.status}
              onChange={e => handleStatus(e.target.value as ReleaseStatus)}
              slotProps={{ inputLabel: { shrink: true } }}
            >
              <MenuItem value="unreleased">Plánováno</MenuItem>
              <MenuItem value="released">Vydáno</MenuItem>
              <MenuItem value="archived">Archiv</MenuItem>
            </TextField>
            <TextField
              size="small" label="Start" type="date" fullWidth
              value={release.startDate ?? ''}
              onChange={e => updateRelease.mutate({ id: release.id, body: { startDate: e.target.value || null } })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small" label="Release date" type="date" fullWidth
              value={release.releaseDate ?? ''}
              onChange={e => updateRelease.mutate({ id: release.id, body: { releaseDate: e.target.value || null } })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small" label="Goal" multiline minRows={2} fullWidth
              value={release.goal ?? ''}
              onChange={e => updateRelease.mutate({ id: release.id, body: { goal: e.target.value || null } })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small" label="Popis" multiline minRows={3} fullWidth
              value={release.description ?? ''}
              onChange={e => updateRelease.mutate({ id: release.id, body: { description: e.target.value || null } })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          {release.status === 'unreleased' && (
            <Button variant="contained" color="success" onClick={() => handleStatus('released')}>
              Označit jako vydané
            </Button>
          )}
          {release.status === 'released' && (
            <Button variant="outlined" onClick={() => handleStatus('archived')}>
              Archivovat
            </Button>
          )}
          <Button variant="outlined" color="error" onClick={handleDelete}>
            Smazat verzi
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

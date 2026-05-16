import { useRef, useState } from 'react';
import { Box, Button, Card, IconButton, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { TASK_TYPES } from '../constants/taskTypes';
import { PRIORITIES } from '../constants/priorities';
import { useProjects } from '../hooks/useProjects';
import { useCreateTask } from '../hooks/useTasks';
import { useReleases } from '../hooks/useReleases';
import { usePermissions } from '../hooks/usePermissions';
import { useUiStore } from '../store/ui-store';
import TypeIcon from './icons/type-icon';
import PriorityIcon from './icons/priority-icon';
import { CloseIcon } from './icons/icons';
import EditorBody, { type EditorBodyHandle } from './editor/editor-body';

export default function CreateTaskModal() {
  const { projectKey } = useParams<{ projectKey: string }>();
  const [, setSearchParams] = useSearchParams();
  const { closeCreateModal } = useUiStore();
  const { enqueueSnackbar } = useSnackbar();
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();
  const { canEdit } = usePermissions();

  const project = projects.find(p => p.key === projectKey) ?? projects[0];

  const [title, setTitle] = useState('');
  const [type, setType] = useState('TASK');
  const [priority, setPriority] = useState('MEDIUM');
  const [fixVersionId, setFixVersionId] = useState<string | null>(null);
  const descriptionRef = useRef<EditorBodyHandle>(null);

  const { data: releases = [] } = useReleases(project?.id);
  const selectableReleases = releases.filter(r => r.status === 'unreleased');

  const handleCreate = () => {
    if (!title.trim() || !project || !canEdit) return;
    const descJson = descriptionRef.current?.getJSON();
    createTask.mutate(
      {
        title: title.trim(),
        projectId: project.id,
        type,
        priority,
        fixVersionId: fixVersionId ?? undefined,
        description: descJson ? JSON.stringify(descJson) : undefined,
      },
      {
        onSuccess: (created) => {
          enqueueSnackbar('Task vytvořen', { variant: 'success' });
          closeCreateModal();
          setSearchParams({ task: created.key });
        },
      },
    );
  };

  return (
    <Box onClick={closeCreateModal}
      sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)',
        zIndex: 1400, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pt: '8vh' }}>
      <Card onClick={e => e.stopPropagation()}
        onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleCreate(); }}
        sx={{ width: 640, borderRadius: 1.5, overflow: 'visible' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
            Nový task{project ? ` v ${project.name}` : ''}
          </Typography>
          <Box sx={{ flex: 1 }}/>
          <IconButton size="small" onClick={closeCreateModal}><CloseIcon/></IconButton>
        </Box>

        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {TASK_TYPES.map(t => (
              <Box key={t.id} onClick={() => setType(t.id)}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5,
                  border: 1, borderColor: type === t.id ? t.color : 'divider',
                  bgcolor: type === t.id ? alpha(t.color, 0.1) : 'transparent',
                  color: type === t.id ? t.color : 'text.secondary',
                  borderRadius: 1, fontSize: 12.5, fontWeight: 500, cursor: 'default' }}>
                <TypeIcon type={t.id} size={12}/> {t.name}
              </Box>
            ))}
          </Box>

          <TextField
            placeholder="Title…"
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && closeCreateModal()}
            sx={{ '& .MuiInputBase-root': { fontSize: 16, fontWeight: 500 } }}
          />

          <EditorBody
            ref={descriptionRef}
            initialContent=""
            placeholder="Popis… (⌘B tučné, ⌘I kurzíva, ⌘K link)"
            compact
            hideActions
          />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {PRIORITIES.map(p => (
              <Box key={p.id} onClick={() => setPriority(p.id)}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.4, borderRadius: 0.8,
                  bgcolor: priority === p.id ? alpha(p.color, 0.12) : 'transparent',
                  border: '1px solid',
                  borderColor: priority === p.id ? p.color : 'divider',
                  color: priority === p.id ? p.color : 'text.secondary',
                  fontSize: 12, fontWeight: priority === p.id ? 600 : 400, cursor: 'default' }}>
                <PriorityIcon priority={p.id}/> {p.name}
              </Box>
            ))}
          </Box>

          {selectableReleases.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 11, color: 'text.disabled', mr: 0.5 }}>Fix version:</Typography>
              <Box
                onClick={() => setFixVersionId(null)}
                sx={{ px: 0.75, py: 0.3, borderRadius: 0.8, fontSize: 11.5,
                  border: '1px solid',
                  borderColor: fixVersionId === null ? 'primary.main' : 'divider',
                  color: fixVersionId === null ? 'primary.main' : 'text.secondary',
                  fontWeight: fixVersionId === null ? 600 : 400, cursor: 'default' }}>
                Žádná
              </Box>
              {selectableReleases.map(r => (
                <Box key={r.id} onClick={() => setFixVersionId(r.id)}
                  sx={{ px: 0.75, py: 0.3, borderRadius: 0.8, fontSize: 11.5,
                    fontFamily: 'ui-monospace, monospace',
                    border: '1px solid',
                    borderColor: fixVersionId === r.id ? 'primary.main' : 'divider',
                    color: fixVersionId === r.id ? 'primary.main' : 'text.secondary',
                    fontWeight: fixVersionId === r.id ? 600 : 400, cursor: 'default' }}>
                  {r.name}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          {canEdit ? (
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
              <kbd style={{ padding: '1px 4px', border: '1px solid', borderRadius: 3, fontSize: 10 }}>Esc</kbd> zavřít ·{' '}
              <kbd style={{ padding: '1px 4px', border: '1px solid', borderRadius: 3, fontSize: 10 }}>⌘↵</kbd> vytvořit
            </Typography>
          ) : (
            <Typography sx={{ fontSize: 11, color: 'warning.main' }}>
              Pro vytvoření tasku potřebujete oprávnění Member nebo Admin.
            </Typography>
          )}
          <Box sx={{ flex: 1 }}/>
          <Button size="small" onClick={closeCreateModal}>Zrušit</Button>
          <Button size="small" variant="contained"
            disabled={!canEdit || !title.trim() || createTask.isPending}
            onClick={handleCreate}>
            Vytvořit task
          </Button>
        </Box>
      </Card>
    </Box>
  );
}

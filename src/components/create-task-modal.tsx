import { useEffect, useRef, useState } from 'react';
import { Box, Button, Card, IconButton, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import type { JSONContent } from '@tiptap/core';
import { TASK_TYPES } from '../constants/taskTypes';
import { PRIORITIES } from '../constants/priorities';
import { useProjects } from '../hooks/useProjects';
import { useCreateTask, useUpdateTask } from '../hooks/useTasks';
import { useReleases } from '../hooks/useReleases';
import { usePermissions } from '../hooks/usePermissions';
import { useUiStore } from '../store/ui-store';
import { attachmentsApi } from '../api/attachments';
import TypeIcon from './icons/type-icon';
import PriorityIcon from './icons/priority-icon';
import { CloseIcon } from './icons/icons';
import EditorBody, { type EditorBodyHandle } from './editor/editor-body';

const KBD_SX = {
  px: 0.5,
  py: '1px',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 0.5,
  fontSize: '14px',
  fontFamily: 'inherit',
} as const;

function replaceImageSrcs(node: JSONContent, urlMap: Map<string, string>): JSONContent {
  const next: JSONContent = { ...node };
  if (next.attrs?.src && typeof next.attrs.src === 'string' && urlMap.has(next.attrs.src)) {
    next.attrs = { ...next.attrs, src: urlMap.get(next.attrs.src)! };
  }
  if (Array.isArray(next.content)) {
    next.content = next.content.map(c => replaceImageSrcs(c, urlMap));
  }
  return next;
}

export default function CreateTaskModal() {
  const { projectKey } = useParams<{ projectKey: string }>();
  const [, setSearchParams] = useSearchParams();
  const { closeCreateModal } = useUiStore();
  const { enqueueSnackbar } = useSnackbar();
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();
  const { canEdit } = usePermissions();

  const project = projects.find(p => p.key === projectKey) ?? projects[0];
  const updateTask = useUpdateTask(project?.id);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('TASK');
  const [priority, setPriority] = useState('MEDIUM');
  const [fixVersionId, setFixVersionId] = useState<string | null>(null);
  const descriptionRef = useRef<EditorBodyHandle>(null);
  const pendingFiles = useRef<Map<string, File>>(new Map());

  const { data: releases = [] } = useReleases(project?.id);
  const selectableReleases = releases.filter(r => r.status === 'unreleased');

  useEffect(() => {
    const map = pendingFiles.current;
    return () => {
      map.forEach((_, url) => URL.revokeObjectURL(url));
      map.clear();
    };
  }, []);

  const stagePendingImage = async (file: File): Promise<string> => {
    const blobUrl = URL.createObjectURL(file);
    pendingFiles.current.set(blobUrl, file);
    return blobUrl;
  };

  const handleCreate = () => {
    if (!title.trim() || !project || !canEdit) return;
    const descJson = descriptionRef.current?.getJSON();
    const hasPendingImages = pendingFiles.current.size > 0;

    createTask.mutate(
      {
        title: title.trim(),
        projectId: project.id,
        type,
        priority,
        fixVersionId: fixVersionId ?? undefined,
        description: !hasPendingImages && descJson ? JSON.stringify(descJson) : undefined,
      },
      {
        onSuccess: async (created) => {
          enqueueSnackbar('Task vytvořen', { variant: 'success' });

          if (hasPendingImages && descJson) {
            const urlMap = new Map<string, string>();
            try {
              for (const [blobUrl, file] of pendingFiles.current.entries()) {
                const realUrl = await attachmentsApi.uploadImage(created.id, file);
                urlMap.set(blobUrl, realUrl);
              }
              const patched = replaceImageSrcs(descJson, urlMap);
              await updateTask.mutateAsync({
                id: created.id,
                body: { description: JSON.stringify(patched) },
              });
            } catch {
              enqueueSnackbar('Některé obrázky se nepodařilo nahrát', { variant: 'warning' });
            } finally {
              pendingFiles.current.forEach((_, url) => URL.revokeObjectURL(url));
              pendingFiles.current.clear();
            }
          }

          closeCreateModal();
          setSearchParams({ task: created.key });
        },
      },
    );
  };

  return (
    <Stack onClick={closeCreateModal}
      sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)',
        zIndex: 1400, alignItems: 'center', justifyContent: 'flex-start', pt: '8vh' }}>
      <Card onClick={e => e.stopPropagation()}
        onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleCreate(); }}
        sx={{
          width: 640, borderRadius: 1.5,
          maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
        <Stack direction="row" spacing={1} sx={{ p: 2, borderBottom: 1, borderColor: 'divider', alignItems: 'center', flexShrink: 0 }}>
          <Typography variant="label">
            Nový task{project ? ` v ${project.name}` : ''}
          </Typography>
          <Box sx={{ flex: 1 }}/>
          <IconButton size="small" onClick={closeCreateModal}><CloseIcon/></IconButton>
        </Stack>

        <Stack spacing={1.5} sx={{ p: 2, flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <Stack direction="row" spacing={1}>
            {TASK_TYPES.map(t => (
              <Stack key={t.id} direction="row" spacing={0.5} onClick={() => setType(t.id)}
                sx={{ alignItems: 'center', px: 1, py: 0.5,
                  border: 1, borderColor: type === t.id ? t.color : 'divider',
                  bgcolor: type === t.id ? alpha(t.color, 0.1) : 'transparent',
                  color: type === t.id ? t.color : 'text.secondary',
                  borderRadius: 1, fontWeight: 500, cursor: 'default' }}>
                <TypeIcon type={t.id} size={12}/>
                <Typography variant="body2" sx={{ color: 'inherit' }}>{t.name}</Typography>
              </Stack>
            ))}
          </Stack>

          <TextField
            placeholder="Title…"
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && closeCreateModal()}
            sx={{ '& .MuiInputBase-root': { fontSize: '16px', fontWeight: 500 } }}
          />

          <EditorBody
            ref={descriptionRef}
            initialContent=""
            placeholder="Popis… (⌘B tučné, ⌘I kurzíva, ⌘K link)"
            compact
            hideActions
            onUploadImage={stagePendingImage}
          />

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {PRIORITIES.map(p => (
              <Stack key={p.id} direction="row" spacing={0.5} onClick={() => setPriority(p.id)}
                sx={{ alignItems: 'center', px: 0.75, py: 0.4, borderRadius: 0.8,
                  bgcolor: priority === p.id ? alpha(p.color, 0.12) : 'transparent',
                  border: '1px solid',
                  borderColor: priority === p.id ? p.color : 'divider',
                  color: priority === p.id ? p.color : 'text.secondary',
                  fontWeight: priority === p.id ? 600 : 400, cursor: 'default' }}>
                <PriorityIcon priority={p.id}/>
                <Typography variant="body2" sx={{ color: 'inherit', fontWeight: 'inherit' }}>{p.name}</Typography>
              </Stack>
            ))}
          </Stack>

          {selectableReleases.length > 0 && (
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="caption" color="text.disabled" sx={{ mr: 0.5 }}>Fix version:</Typography>
              <Typography
                variant="caption"
                onClick={() => setFixVersionId(null)}
                sx={{ px: 0.75, py: 0.3, borderRadius: 0.8,
                  border: '1px solid',
                  borderColor: fixVersionId === null ? 'primary.main' : 'divider',
                  color: fixVersionId === null ? 'primary.main' : 'text.secondary',
                  fontWeight: fixVersionId === null ? 600 : 400, cursor: 'default' }}>
                Žádná
              </Typography>
              {selectableReleases.map(r => (
                <Typography key={r.id} variant="caption" onClick={() => setFixVersionId(r.id)}
                  sx={{ px: 0.75, py: 0.3, borderRadius: 0.8,
                    fontFamily: 'ui-monospace, monospace',
                    border: '1px solid',
                    borderColor: fixVersionId === r.id ? 'primary.main' : 'divider',
                    color: fixVersionId === r.id ? 'primary.main' : 'text.secondary',
                    fontWeight: fixVersionId === r.id ? 600 : 400, cursor: 'default' }}>
                  {r.name}
                </Typography>
              ))}
            </Stack>
          )}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', alignItems: 'center', flexShrink: 0, bgcolor: 'background.paper' }}>
          {canEdit ? (
            <Typography variant="caption" color="text.disabled">
              <Box component="kbd" sx={KBD_SX}>Esc</Box> zavřít ·{' '}
              <Box component="kbd" sx={KBD_SX}>⌘↵</Box> vytvořit
            </Typography>
          ) : (
            <Typography variant="caption" color="warning.main">
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
        </Stack>
      </Card>
    </Stack>
  );
}

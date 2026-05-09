import { useState } from 'react';
import { Box, Button, Card, IconButton, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useParams } from 'react-router-dom';
import { TASK_TYPES, PRIORITIES, PROJECTS } from '../mocks/data';
import { useUiStore } from '../store/ui-store';
import TypeIcon from './icons/type-icon';
import PriorityIcon from './icons/priority-icon';
import { CloseIcon } from './icons/icons';

export default function CreateTaskModal() {
  const { projectId } = useParams<{ projectId: string }>();
  const { closeCreateModal } = useUiStore();
  const project = PROJECTS.find(p => p.id === projectId) ?? PROJECTS[0];

  const [title, setTitle] = useState('');
  const [type, setType] = useState('task');
  const [priority, setPriority] = useState('medium');

  return (
    <Box onClick={closeCreateModal}
      sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)',
        zIndex: 1400, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pt: '8vh' }}>
      <Card onClick={e => e.stopPropagation()}
        sx={{ width: 640, borderRadius: 1.5, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Nový task v {project?.name}</Typography>
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

          <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.25,
            fontSize: 13, color: 'text.disabled', minHeight: 80, cursor: 'text' }}>
            Popis… (slash menu, mentions, code, obrázky)
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.4, borderRadius: 0.8,
              border: '1px dashed', borderColor: 'divider', fontSize: 12, color: 'text.secondary', cursor: 'default' }}>
              + Assignee
            </Box>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.4, borderRadius: 0.8,
              border: '1px dashed', borderColor: 'divider', fontSize: 12, color: 'text.secondary', cursor: 'default' }}>+ Sprint</Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.4, borderRadius: 0.8,
              border: '1px dashed', borderColor: 'divider', fontSize: 12, color: 'text.secondary', cursor: 'default' }}>+ Estimate</Box>
          </Box>
        </Box>

        <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
            <kbd style={{ padding: '1px 4px', border: '1px solid', borderRadius: 3, fontSize: 10 }}>Esc</kbd> zavřít ·{' '}
            <kbd style={{ padding: '1px 4px', border: '1px solid', borderRadius: 3, fontSize: 10 }}>⌘↵</kbd> vytvořit
          </Typography>
          <Box sx={{ flex: 1 }}/>
          <Button size="small" onClick={closeCreateModal}>Zrušit</Button>
          <Button size="small" variant="contained" disabled={!title.trim()}>Vytvořit task</Button>
        </Box>
      </Card>
    </Box>
  );
}

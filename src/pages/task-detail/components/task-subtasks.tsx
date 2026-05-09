import { Box, Typography } from '@mui/material';
import { CheckIcon } from '../../../components/icons/icons';
import type { Subtask } from '../../../types';

interface Props {
  subtasks: Subtask[];
  onToggle: (id: string) => void;
}

export default function TaskSubtasks({ subtasks, onToggle }: Props) {
  if (subtasks.length === 0) return null;

  const done = subtasks.filter(s => s.done).length;
  const total = subtasks.length;

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
          Subtasky · {done}/{total}
        </Typography>
        <Box sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'action.hover', overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${(done / total) * 100}%`, bgcolor: 'success.main', transition: '0.3s' }}/>
        </Box>
        <Typography sx={{ fontSize: 11, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
          {Math.round((done / total) * 100)}%
        </Typography>
      </Box>
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
        {subtasks.map((s, i) => (
          <Box key={s.id} onClick={() => onToggle(s.id)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.85,
              borderTop: i === 0 ? 0 : 1, borderColor: 'divider',
              bgcolor: 'background.paper', cursor: 'default', '&:hover': { bgcolor: 'action.hover' } }}>
            <Box sx={{ width: 16, height: 16, borderRadius: 0.5, border: 1.5,
              borderColor: s.done ? 'success.main' : 'text.disabled',
              bgcolor: s.done ? 'success.main' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              {s.done && <CheckIcon style={{ width: 10, height: 10 }}/>}
            </Box>
            <Typography sx={{ fontSize: 13, flex: 1,
              textDecoration: s.done ? 'line-through' : 'none',
              color: s.done ? 'text.disabled' : 'text.primary' }}>{s.title}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

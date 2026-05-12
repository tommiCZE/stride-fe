import { Box, Button, TextField, Typography } from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { BOARD_STATUSES } from '../constants/statuses';
import FluxAvatar from '../components/flux-avatar';
import TypeIcon from '../components/icons/type-icon';
import PriorityIcon from '../components/icons/priority-icon';
import { MonoKey, StatusBadge, ColorDot } from '../components/ui/ui';
import { FilterIcon } from '../components/icons/icons';

const COLS = [
  { key: 'key',      label: 'Key',      w: 84 },
  { key: 'type',     label: 'T',        w: 28 },
  { key: 'priority', label: 'P',        w: 28 },
  { key: 'title',    label: 'Title',    flex: 1 },
  { key: 'assignee', label: 'Assignee', w: 130 },
  { key: 'status',   label: 'Status',   w: 110 },
  { key: 'estimate', label: 'Est',      w: 50 },
  { key: 'logged',   label: 'Logged',   w: 70 },
  { key: 'due',      label: 'Due',      w: 80 },
] as const;

export default function ListView() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, setSearchParams] = useSearchParams();
  const openTask = (id: string) => setSearchParams({ task: id });
  const { data: tasks = [] } = useTasks(projectId!);

  return (
    <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, gap: 1, borderBottom: 1, borderColor: 'divider',
        position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
        <TextField placeholder="Filtr…" size="small"
          sx={{ width: 200, '& .MuiOutlinedInput-root': { height: 26, fontSize: 12.5 } }}/>
        <Button size="small" variant="outlined" startIcon={<FilterIcon/>}>Filtry</Button>
        <Box sx={{ flex: 1 }}/>
        <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{tasks.length} tasků</Typography>
      </Box>

      <Box sx={{ minWidth: 900 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.75, fontSize: 10.5, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary',
          borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 43, bgcolor: 'background.paper', zIndex: 1 }}>
          {COLS.map(c => (
            <Box key={c.key} sx={{ width: 'w' in c ? c.w : undefined, flex: 'flex' in c ? c.flex : undefined, px: 0.5 }}>{c.label}</Box>
          ))}
        </Box>

        {tasks.map(t => {
          const status   = BOARD_STATUSES.find(s => s.id === t.status);
          const assignee = t.assigneeId
            ? { color: t.assigneeColor ?? '#94a3b8', initials: t.assigneeInitials ?? '?' }
            : null;
          return (
            <Box key={t.id} onClick={() => openTask(t.id)}
              sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.75, fontSize: 12.5,
                borderBottom: 1, borderColor: 'divider', cursor: 'default',
                '&:hover': { bgcolor: 'action.hover' } }}>
              <Box sx={{ width: 84, px: 0.5 }}>
                <MonoKey sx={{ fontSize: 11.5 }}>{t.key}</MonoKey>
              </Box>
              <Box sx={{ width: 28, px: 0.5 }}><TypeIcon type={t.type} size={13}/></Box>
              <Box sx={{ width: 28, px: 0.5 }}><PriorityIcon priority={t.priority}/></Box>
              <Box sx={{ flex: 1, px: 0.5, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</Box>
              <Box sx={{ width: 130, px: 0.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <FluxAvatar user={assignee} size={18}/>
                {t.assigneeName && <Box sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.assigneeName.split(' ')[0]}</Box>}
              </Box>
              <Box sx={{ width: 110, px: 0.5 }}>
                {status && (
                  <StatusBadge badgeColor={status.color}>
                    <ColorDot dotColor={status.color} dotSize={5}/>
                    {status.name}
                  </StatusBadge>
                )}
              </Box>
              <Box sx={{ width: 50, px: 0.5, fontVariantNumeric: 'tabular-nums', fontSize: 11.5, color: 'text.secondary' }}>{t.estimate ?? '—'}</Box>
              <Box sx={{ width: 70, px: 0.5, fontVariantNumeric: 'tabular-nums', fontSize: 11.5, color: 'text.secondary' }}>{t.logged}h</Box>
              <Box sx={{ width: 80, px: 0.5, fontSize: 11.5, color: 'text.secondary' }}>
                {t.dueDate ? new Date(t.dueDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' }) : '—'}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

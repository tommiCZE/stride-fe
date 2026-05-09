import { Box, Card, Typography } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getUser, getEpic, getLabel } from '../../mocks/data';
import FluxAvatar from '../../components/flux-avatar';
import TypeIcon from '../../components/icons/type-icon';
import PriorityIcon from '../../components/icons/priority-icon';
import { ColorPill, MonoKey } from '../../components/ui/ui';
import { CheckIcon, CommentIcon } from '../../components/icons/icons';
import type { Task } from '../../types';

export interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task: t, onClick, isDragging }: TaskCardProps) {
  const assignee = t.assignee ? getUser(t.assignee) : null;
  const epic = t.epic ? getEpic(t.epic) : null;
  const subDone = t.subtasks.filter(s => s.done).length;
  const subTotal = t.subtasks.length;

  return (
    <Card onClick={onClick} elevation={isDragging ? 4 : 0}
      sx={{ cursor: 'default', borderRadius: 1.2, p: 1.25,
        transition: 'all 0.12s', opacity: isDragging ? 0.5 : 1,
        '&:hover': { borderColor: 'primary.main' } }}>
      {epic && (
        <ColorPill pillColor={epic.color} sx={{ mb: 0.75 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{epic.key}</Typography>
          <Typography sx={{ fontSize: 10, fontWeight: 500 }}>· {epic.title}</Typography>
        </ColorPill>
      )}
      <Typography sx={{ fontSize: 12.5, lineHeight: 1.35, fontWeight: 500, mb: 0.75 }}>{t.title}</Typography>
      {t.labels.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
          {t.labels.slice(0, 3).map(lid => {
            const l = getLabel(lid)!;
            return <ColorPill key={lid} pillColor={l.color} sx={{ fontSize: 10, py: '1px', px: '6px' }}>{l.name}</ColorPill>;
          })}
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
        <TypeIcon type={t.type} size={13}/>
        <MonoKey sx={{ fontSize: 10.5 }}>{t.key}</MonoKey>
        <PriorityIcon priority={t.priority}/>
        <Box sx={{ flex: 1 }}/>
        {subTotal > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontSize: 11 }}>
            <CheckIcon/> {subDone}/{subTotal}
          </Box>
        )}
        {t.comments > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontSize: 11 }}>
            <CommentIcon/> {t.comments}
          </Box>
        )}
        {t.estimate != null && (
          <Box sx={{ fontSize: 10.5, fontWeight: 600, px: 0.5, borderRadius: 0.6, bgcolor: 'action.hover' }}>{t.estimate}</Box>
        )}
        <FluxAvatar user={assignee} size={18}/>
      </Box>
    </Card>
  );
}

export function SortableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  return (
    <Box ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} isDragging={isDragging}/>
    </Box>
  );
}

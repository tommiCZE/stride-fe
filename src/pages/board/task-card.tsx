import { Box, Card, Typography } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import FluxAvatar from '../../components/flux-avatar';
import TypeIcon from '../../components/icons/type-icon';
import PriorityIcon from '../../components/icons/priority-icon';
import { MonoKey } from '../../components/ui/ui';
import { CommentIcon } from '../../components/icons/icons';
import type { TaskSummaryDto } from '../../api/types';

export interface TaskCardProps {
  task: TaskSummaryDto;
  onClick: () => void;
  isDragging?: boolean;
}

function priorityBarColor(priority: string): string {
  switch (priority) {
    case 'HIGHEST':
    case 'HIGH':    return 'error.main';
    case 'MEDIUM':  return 'warning.main';
    default:        return 'text.disabled';
  }
}

export function TaskCard({ task: t, onClick, isDragging }: TaskCardProps) {
  const assignee = t.assigneeId
    ? { color: t.assigneeColor ?? '#94a3b8', initials: t.assigneeInitials ?? '?' }
    : null;

  return (
    <Card onClick={onClick} elevation={isDragging ? 4 : 0}
      sx={{ cursor: 'default', borderRadius: 1.2, position: 'relative',
        pl: 1.625, pr: 1.25, py: 1.25,
        transition: 'all 0.12s', opacity: isDragging ? 0.5 : 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 3,
          bgcolor: priorityBarColor(t.priority),
          borderTopLeftRadius: 'inherit',
          borderBottomLeftRadius: 'inherit',
        },
        '&:hover': { borderColor: 'primary.main' } }}>
      <Typography sx={{ fontSize: 15, lineHeight: 1.35, fontWeight: 600, mb: 0.75 }}>{t.title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
        <TypeIcon type={t.type} size={13}/>
        <MonoKey sx={{ fontSize: 14 }}>{t.key}</MonoKey>
        <PriorityIcon priority={t.priority}/>
        <Box sx={{ flex: 1 }}/>
        {t.commentCount > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, fontSize: 13 }}>
            <CommentIcon/> {t.commentCount}
          </Box>
        )}
        {t.estimate != null && (
          <Box sx={{ fontSize: 14, fontWeight: 600, px: 0.5, borderRadius: 0.6, bgcolor: 'action.hover' }}>{t.estimate}</Box>
        )}
        <FluxAvatar user={assignee} size={18}/>
      </Box>
    </Card>
  );
}

export function SortableTaskCard({ task, onClick }: { task: TaskSummaryDto; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  return (
    <Box ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} isDragging={isDragging}/>
    </Box>
  );
}

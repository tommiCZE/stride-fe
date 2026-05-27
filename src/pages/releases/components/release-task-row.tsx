import { Box, Stack, Typography } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TypeIcon from '../../../components/icons/type-icon';
import FluxAvatar from '../../../components/flux-avatar';
import { MonoKey, StatusBadge, ColorPill } from '../../../components/ui/ui';
import { BOARD_STATUSES } from '../../../constants/statuses';
import { PRIORITIES } from '../../../constants/priorities';
import type { TaskSummaryDto } from '../../../api/types';

interface Props {
  task: TaskSummaryDto;
  draggableId: string;
  onOpen?: (key: string) => void;
}

function priorityPill(priority: string) {
  if (priority === 'LOW') return null;
  const p = PRIORITIES.find(x => x.id === priority);
  if (!p) return null;
  if (priority === 'URGENT') {
    return (
      <Box sx={{
        fontSize: 10, fontWeight: 700, color: '#fff', bgcolor: p.color,
        px: 0.75, py: 0.15, borderRadius: 0.75, textTransform: 'uppercase',
        letterSpacing: '0.04em', lineHeight: 1.4,
      }}>
        {p.name}
      </Box>
    );
  }
  return (
    <ColorPill pillColor={p.color} sx={{ fontSize: 10, py: 0.05, px: 0.6 }}>
      {p.name}
    </ColorPill>
  );
}

export default function ReleaseTaskRow({ task, draggableId, onOpen }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: draggableId });
  const assignee = task.assigneeId
    ? { color: task.assigneeColor ?? '#94a3b8', initials: task.assigneeInitials ?? '?' }
    : null;
  const status = BOARD_STATUSES.find(s => s.id === task.status);

  return (
    <Stack
      ref={setNodeRef}
      direction="row" spacing={1}
      onClick={() => {
        if (isDragging) return;
        onOpen?.(task.key);
      }}
      {...attributes}
      {...listeners}
      sx={{
        alignItems: 'center',
        minHeight: 32, px: 2.25,
        opacity: isDragging ? 0.4 : 1,
        transform: CSS.Transform.toString(transform),
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
        '&:hover': { bgcolor: 'action.hover' },
        borderBottom: 1, borderColor: 'divider',
        '&:last-child': { borderBottom: 0 },
      }}
    >
      <TypeIcon type={task.type} size={13}/>
      <MonoKey sx={{ fontSize: 11, minWidth: 56 }}>{task.key}</MonoKey>
      <Typography sx={{
        flex: 1, minWidth: 0, fontSize: 13,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {task.title}
      </Typography>
      {priorityPill(task.priority)}
      {status && (
        <StatusBadge badgeColor={status.color} sx={{ fontSize: 10, py: 0.05, px: 0.6 }}>
          {status.name}
        </StatusBadge>
      )}
      <FluxAvatar user={assignee} size={18}/>
    </Stack>
  );
}

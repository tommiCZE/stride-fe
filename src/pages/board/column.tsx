import { Box, IconButton, Typography } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreIcon } from '../../components/icons/icons';
import { SortableTaskCard } from './task-card';
import type { TaskSummaryDto } from '../../api/types';
import type { BoardStatus } from '../../constants/statuses';

interface ColumnProps {
  status: BoardStatus;
  tasks: TaskSummaryDto[];
  onTaskClick: (id: string) => void;
}

export default function Column({ status, tasks, onTaskClick }: ColumnProps) {
  const count = tasks.length;
  const isWipBreached = status.wip != null && count > status.wip;
  const { setNodeRef, isOver } = useDroppable({ id: status.id });

  return (
    <Box sx={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
      bgcolor: 'action.hover', borderRadius: 1.5, border: 1,
      borderColor: isOver ? 'primary.main' : 'transparent',
      maxHeight: '100%', minHeight: 0 }}>
      <Box sx={{ px: 1.25, py: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: status.color }}/>
        <Typography sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
          color: 'text.secondary' }}>{status.name}</Typography>
        <Typography sx={{ fontSize: 11, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>{count}</Typography>
        {status.wip && (
          <Box sx={{ ml: 0.25, fontSize: 9.5, fontWeight: 700, px: 0.5, borderRadius: 0.5,
            bgcolor: isWipBreached ? 'error.main' : 'action.selected',
            color: isWipBreached ? '#fff' : 'text.secondary' }}>
            WIP {status.wip}
          </Box>
        )}
        <Box sx={{ flex: 1 }}/>
        <IconButton size="small" sx={{ p: 0.25 }}><MoreIcon/></IconButton>
      </Box>

      <Box ref={setNodeRef} sx={{ px: 1, pb: 1, display: 'flex', flexDirection: 'column', gap: 0.75,
        overflowY: 'auto', flex: 1, minHeight: 0 }}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(t => (
            <SortableTaskCard key={t.id} task={t} onClick={() => onTaskClick(t.id)}/>
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.disabled', fontSize: 11.5,
            border: 1, borderColor: 'divider', borderStyle: 'dashed', borderRadius: 1 }}>
            Žádné tasky
          </Box>
        )}
      </Box>
    </Box>
  );
}

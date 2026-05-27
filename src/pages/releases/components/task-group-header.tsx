import { useId } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useDroppable } from '@dnd-kit/core';
import { CaretIcon, CaretRIcon } from '../../../components/icons/icons';

interface Props {
  droppableId?: string;
  title: string;
  count: number;
  color: string;
  context?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function TaskGroupHeader({
  droppableId, title, count, color, context,
  collapsible, collapsed, onToggle,
}: Props) {
  const fallbackId = useId();
  const drop = useDroppable({ id: droppableId ?? fallbackId, disabled: !droppableId });
  const isOver = !!droppableId && drop.isOver;

  return (
    <Stack
      ref={droppableId ? drop.setNodeRef : undefined}
      direction="row" spacing={1}
      onClick={collapsible ? onToggle : undefined}
      sx={{
        alignItems: 'center', userSelect: 'none',
        position: 'relative',
        py: 0.85, pl: 2.25, pr: 1.5,
        background: `linear-gradient(90deg, ${alpha(color, isOver ? 0.22 : 0.10)}, transparent 60%)`,
        cursor: collapsible ? 'pointer' : 'default',
        outline: isOver ? `2px solid ${color}` : 'none',
        outlineOffset: -2,
        transition: 'background 0.15s, outline 0.15s',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0, top: 4, bottom: 4, width: 3,
          bgcolor: color, borderRadius: 1.5,
        },
      }}
    >
      {collapsible && (
        <Box sx={{ display: 'flex', color: 'text.secondary' }}>
          {collapsed ? <CaretRIcon/> : <CaretIcon/>}
        </Box>
      )}
      <Typography sx={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'text.primary',
      }}>
        {title}
      </Typography>
      <Typography sx={{
        fontSize: '14px', fontWeight: 700, color: 'text.primary',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {count}
      </Typography>
      <Box sx={{ flex: 1 }}/>
      {context && (
        <Typography sx={{
          fontSize: '10.5px', color: 'text.secondary',
        }}>
          {context}
        </Typography>
      )}
    </Stack>
  );
}

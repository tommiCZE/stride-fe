import { Box, Skeleton, Stack } from '@mui/material';

const COLUMN_TASK_COUNTS = [4, 3, 4];

function TaskCardSkeleton() {
  return (
    <Stack spacing={0.75}
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.2,
        p: 1.25 }}
    >
      {/* Epic pill */}
      <Skeleton variant="rectangular" width={120} height={14} sx={{ borderRadius: 0.5 }} />
      {/* Title — two lines */}
      <Skeleton variant="text" width="92%" height={14} />
      <Skeleton variant="text" width="60%" height={14} />
      {/* Footer row: type icon, key, priority, spacer, avatar */}
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.5 }}>
        <Skeleton variant="circular" width={13} height={13} />
        <Skeleton variant="text" width={40} height={12} />
        <Skeleton variant="circular" width={12} height={12} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="circular" width={18} height={18} />
      </Stack>
    </Stack>
  );
}

function ColumnSkeleton({ taskCount }: { taskCount: number }) {
  return (
    <Stack
      sx={{
        width: 280,
        flexShrink: 0,
        bgcolor: 'action.hover',
        borderRadius: 1.5,
        maxHeight: '100%',
        minHeight: 0 }}
    >
      {/* Column header */}
      <Stack direction="row" spacing={0.75} sx={{ px: 1.25, py: 1, alignItems: 'center' }}>
        <Skeleton variant="circular" width={8} height={8} />
        <Skeleton variant="text" width={70} height={14} />
        <Skeleton variant="text" width={16} height={12} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="circular" width={16} height={16} />
        <Skeleton variant="circular" width={16} height={16} />
      </Stack>
      {/* Task cards */}
      <Stack spacing={0.75} sx={{ px: 1, pb: 1 }}>
        {Array.from({ length: taskCount }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </Stack>
    </Stack>
  );
}

export default function BoardSkeleton() {
  return (
    <Stack
      sx={{
        height: '100%',
        overflow: 'hidden' }}
      role="status"
      aria-label="Načítání nástěnky"
    >
      {/* Toolbar skeleton */}
      <Stack direction="row" spacing={1}
        sx={{
        px: 2,
          py: 1,
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0 }}
      >
        <Skeleton variant="text" width={140} height={16} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="rectangular" width={160} height={26} sx={{ borderRadius: 1 }} />
        <Stack direction="row" spacing={0.5} >
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="circular" width={22} height={22} />
          ))}
        </Stack>
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={72} height={24} sx={{ borderRadius: 1 }} />
      </Stack>

      {/* Columns */}
      <Stack direction="row" spacing={1.5}
        sx={{
        flex: 1,
          overflow: 'hidden',
          px: 2,
          py: 2,
          alignItems: 'flex-start' }}
      >
        {COLUMN_TASK_COUNTS.map((count, i) => (
          <ColumnSkeleton key={i} taskCount={count} />
        ))}
      </Stack>
    </Stack>
  );
}

import { Box, Skeleton } from '@mui/material';

const COLUMN_TASK_COUNTS = [4, 3, 4];

function TaskCardSkeleton() {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.2,
        p: 1.25,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
      }}
    >
      {/* Epic pill */}
      <Skeleton variant="rectangular" width={120} height={14} sx={{ borderRadius: 0.5 }} />
      {/* Title — two lines */}
      <Skeleton variant="text" width="92%" height={14} />
      <Skeleton variant="text" width="60%" height={14} />
      {/* Footer row: type icon, key, priority, spacer, avatar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
        <Skeleton variant="circular" width={13} height={13} />
        <Skeleton variant="text" width={40} height={12} />
        <Skeleton variant="circular" width={12} height={12} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="circular" width={18} height={18} />
      </Box>
    </Box>
  );
}

function ColumnSkeleton({ taskCount }: { taskCount: number }) {
  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'action.hover',
        borderRadius: 1.5,
        maxHeight: '100%',
        minHeight: 0,
      }}
    >
      {/* Column header */}
      <Box sx={{ px: 1.25, py: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Skeleton variant="circular" width={8} height={8} />
        <Skeleton variant="text" width={70} height={14} />
        <Skeleton variant="text" width={16} height={12} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="circular" width={16} height={16} />
        <Skeleton variant="circular" width={16} height={16} />
      </Box>
      {/* Task cards */}
      <Box sx={{ px: 1, pb: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {Array.from({ length: taskCount }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </Box>
    </Box>
  );
}

export default function BoardSkeleton() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      role="status"
      aria-label="Načítání nástěnky"
    >
      {/* Toolbar skeleton */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Skeleton variant="text" width={140} height={16} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="rectangular" width={160} height={26} sx={{ borderRadius: 1 }} />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="circular" width={22} height={22} />
          ))}
        </Box>
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={72} height={24} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Columns */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          px: 2,
          py: 2,
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-start',
        }}
      >
        {COLUMN_TASK_COUNTS.map((count, i) => (
          <ColumnSkeleton key={i} taskCount={count} />
        ))}
      </Box>
    </Box>
  );
}

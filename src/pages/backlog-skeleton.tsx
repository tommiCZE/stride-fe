import { Box, Card, Skeleton } from '@mui/material';

const SPRINT_TASK_COUNTS = [5, 4];
const BACKLOG_TASK_COUNT = 6;

function TaskRowSkeleton({ isLast }: { isLast?: boolean }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 0.85,
        borderBottom: isLast ? 0 : 1,
        borderColor: 'divider',
      }}
    >
      {/* Priority icon */}
      <Skeleton variant="circular" width={12} height={12} />
      {/* Type icon */}
      <Skeleton variant="circular" width={13} height={13} />
      {/* Key */}
      <Skeleton variant="text" width={60} height={14} />
      {/* Title */}
      <Skeleton variant="text" sx={{ flex: 1 }} height={14} />
      {/* Estimate badge */}
      <Skeleton variant="rectangular" width={28} height={16} sx={{ borderRadius: 0.6 }} />
      {/* Avatar */}
      <Skeleton variant="circular" width={18} height={18} />
    </Box>
  );
}

function SprintSectionSkeleton({ taskCount }: { taskCount: number }) {
  return (
    <Card sx={{ borderRadius: 1.5 }}>
      {/* Sprint header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Skeleton variant="circular" width={14} height={14} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <Skeleton variant="text" width={220} height={16} />
          <Skeleton variant="text" width={280} height={12} />
        </Box>
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="rectangular" width={70} height={18} sx={{ borderRadius: 0.5 }} />
      </Box>
      {/* Rows */}
      {Array.from({ length: taskCount }).map((_, i) => (
        <TaskRowSkeleton key={i} isLast={i === taskCount - 1} />
      ))}
    </Card>
  );
}

export default function BacklogSkeleton() {
  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'hidden',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: 'background.default',
        height: '100%',
      }}
      role="status"
      aria-label="Načítání backlogu"
    >
      {SPRINT_TASK_COUNTS.map((count, i) => (
        <SprintSectionSkeleton key={i} taskCount={count} />
      ))}
      <SprintSectionSkeleton taskCount={BACKLOG_TASK_COUNT} />
    </Box>
  );
}

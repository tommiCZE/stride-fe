import { Box, Card, Skeleton, Stack } from '@mui/material';

function StatCardSkeleton() {
  return (
    <Card sx={{ p: 1.75, borderRadius: 1.5 }}>
      <Skeleton variant="text" width="55%" height={12} />
      <Skeleton variant="text" width={60} height={28} sx={{ mt: 0.25 }} />
      <Skeleton variant="text" width="70%" height={11} />
    </Card>
  );
}

function TaskListItemSkeleton({ isLast }: { isLast?: boolean }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        px: 1.5,
        py: 1,
        alignItems: 'center',
        borderBottom: isLast ? 0 : 1,
        borderColor: 'divider',
      }}
    >
      <Skeleton variant="circular" width={12} height={12} />
      <Skeleton variant="circular" width={13} height={13} />
      <Skeleton variant="text" width={56} height={12} />
      <Skeleton variant="text" sx={{ flex: 1 }} height={14} />
      <Skeleton variant="rectangular" width={70} height={16} sx={{ borderRadius: 0.6 }} />
    </Stack>
  );
}

function ActivityItemSkeleton() {
  return (
    <Stack direction="row" spacing={1}>
      <Skeleton variant="circular" width={22} height={22} />
      <Stack spacing={0.4} sx={{ flex: 1 }}>
        <Skeleton variant="text" width="80%" height={13} />
        <Skeleton variant="text" width="56%" height={12} />
        <Skeleton variant="text" width={40} height={10} />
      </Stack>
    </Stack>
  );
}

function ProjectCardSkeleton() {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.2,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
        <Skeleton variant="rectangular" width={28} height={28} sx={{ borderRadius: 1 }} />
        <Stack spacing={0.3} sx={{ flex: 1 }}>
          <Skeleton variant="text" width="70%" height={14} />
          <Skeleton variant="text" width="55%" height={11} />
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Skeleton variant="rectangular" sx={{ flex: 1, borderRadius: 2 }} height={4} />
        <Skeleton variant="text" width={32} height={11} />
      </Stack>
    </Box>
  );
}

export default function DashboardSkeleton() {
  return (
    <Box
      sx={{ p: 3, overflow: 'hidden', bgcolor: 'background.default', height: '100%' }}
      role="status"
      aria-label="Načítání přehledu"
    >
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Skeleton variant="text" width={170} height={14} />
        <Skeleton variant="text" width={320} height={34} />
        <Skeleton variant="text" width="55%" height={14} />
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' },
          gap: 1.5,
          mb: 3,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Card sx={{ borderRadius: 1.5 }}>
          <Stack
            direction="row"
            sx={{
              p: 1.5,
              alignItems: 'center',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Skeleton variant="text" width={90} height={14} />
            <Box sx={{ flex: 1 }} />
            <Skeleton variant="text" width={40} height={12} />
          </Stack>
          {Array.from({ length: 5 }).map((_, i) => (
            <TaskListItemSkeleton key={i} isLast={i === 4} />
          ))}
        </Card>

        <Card sx={{ borderRadius: 1.5 }}>
          <Stack
            direction="row"
            sx={{
              p: 1.5,
              alignItems: 'center',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Skeleton variant="text" width={110} height={14} />
          </Stack>
          <Stack spacing={1.25} sx={{ p: 1.5 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <ActivityItemSkeleton key={i} />
            ))}
          </Stack>
        </Card>

        <Card sx={{ borderRadius: 1.5, gridColumn: '1 / -1' }}>
          <Stack
            direction="row"
            sx={{
              p: 1.5,
              alignItems: 'center',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Skeleton variant="text" width={80} height={14} />
            <Box sx={{ flex: 1 }} />
            <Skeleton variant="rectangular" width={110} height={26} sx={{ borderRadius: 1 }} />
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2,1fr)',
                md: 'repeat(3,1fr)',
              },
              gap: 1.5,
              p: 1.5,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

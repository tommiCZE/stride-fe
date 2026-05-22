import { Box, Skeleton, Stack } from '@mui/material';

function SidebarFieldSkeleton() {
  return (
    <Stack spacing={0.5}>
      <Skeleton variant="text" width={70} height={11} />
      <Skeleton variant="rectangular" height={28} sx={{ borderRadius: 1 }} />
    </Stack>
  );
}

export default function TaskDetailSkeleton() {
  return (
    <Stack
      sx={{
        height: '100%',
        bgcolor: 'background.default',
      }}
      role="status"
      aria-label="Načítání detailu úkolu"
    >
      {/* Header */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          px: 2.5,
          py: 1.25,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 0.5 }} />
        <Skeleton variant="text" width={110} height={14} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="circular" width={26} height={26} />
        <Skeleton variant="circular" width={26} height={26} />
        <Skeleton variant="circular" width={26} height={26} />
        <Skeleton variant="circular" width={26} height={26} />
      </Stack>

      {/* Two-column grid: content + sidebar */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 300px', lg: '1fr 320px' },
          minHeight: 0,
        }}
      >
        {/* Main content */}
        <Stack spacing={2} sx={{ overflow: 'hidden', p: 3 }}>
          <Skeleton variant="text" width="70%" height={32} />

          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
            <Skeleton variant="rectangular" width={96} height={26} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={88} height={26} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={140} height={26} sx={{ borderRadius: 1 }} />
          </Stack>

          <Skeleton variant="text" width={60} height={11} sx={{ mt: 1 }} />

          <Stack spacing={0.6}>
            <Skeleton variant="text" width="100%" height={14} />
            <Skeleton variant="text" width="96%" height={14} />
            <Skeleton variant="text" width="88%" height={14} />
            <Skeleton variant="text" width="64%" height={14} />
          </Stack>

          <Skeleton variant="text" width={80} height={11} sx={{ mt: 1 }} />
          <Stack spacing={0.75}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Skeleton variant="rectangular" width={14} height={14} sx={{ borderRadius: 0.4 }} />
                <Skeleton variant="text" sx={{ flex: 1 }} height={14} />
              </Stack>
            ))}
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              mt: 2,
              borderBottom: 1,
              borderColor: 'divider',
              pb: 0.5,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="text" width={70} height={20} />
            ))}
          </Stack>

          <Stack spacing={1.5}>
            {Array.from({ length: 2 }).map((_, i) => (
              <Stack key={i} direction="row" spacing={1}>
                <Skeleton variant="circular" width={28} height={28} />
                <Stack spacing={0.5} sx={{ flex: 1 }}>
                  <Skeleton variant="text" width={140} height={12} />
                  <Skeleton variant="text" width="92%" height={13} />
                  <Skeleton variant="text" width="74%" height={13} />
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>

        {/* Sidebar */}
        <Stack
          spacing={1.5}
          sx={{
            borderLeft: { md: 1 },
            borderColor: { md: 'divider' },
            p: 2.5,
            display: { xs: 'none', md: 'flex' },
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SidebarFieldSkeleton key={i} />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

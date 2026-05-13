import { Box, Skeleton } from '@mui/material';

function SidebarFieldSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Skeleton variant="text" width={70} height={11} />
      <Skeleton variant="rectangular" height={28} sx={{ borderRadius: 1 }} />
    </Box>
  );
}

export default function TaskDetailSkeleton() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
      role="status"
      aria-label="Načítání detailu úkolu"
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
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
      </Box>

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
        <Box sx={{ overflow: 'hidden', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Title */}
          <Skeleton variant="text" width="70%" height={32} />

          {/* Status / priority / epic chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            <Skeleton variant="rectangular" width={96} height={26} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={88} height={26} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={140} height={26} sx={{ borderRadius: 1 }} />
          </Box>

          {/* Description label */}
          <Skeleton variant="text" width={60} height={11} sx={{ mt: 1 }} />

          {/* Description body */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
            <Skeleton variant="text" width="100%" height={14} />
            <Skeleton variant="text" width="96%" height={14} />
            <Skeleton variant="text" width="88%" height={14} />
            <Skeleton variant="text" width="64%" height={14} />
          </Box>

          {/* Subtasks */}
          <Skeleton variant="text" width={80} height={11} sx={{ mt: 1 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Skeleton variant="rectangular" width={14} height={14} sx={{ borderRadius: 0.4 }} />
                <Skeleton variant="text" sx={{ flex: 1 }} height={14} />
              </Box>
            ))}
          </Box>

          {/* Tabs */}
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              gap: 2,
              borderBottom: 1,
              borderColor: 'divider',
              pb: 0.5,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="text" width={70} height={20} />
            ))}
          </Box>

          {/* Tab content (comments) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {Array.from({ length: 2 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="circular" width={28} height={28} />
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Skeleton variant="text" width={140} height={12} />
                  <Skeleton variant="text" width="92%" height={13} />
                  <Skeleton variant="text" width="74%" height={13} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Sidebar */}
        <Box
          sx={{
            borderLeft: { md: 1 },
            borderColor: { md: 'divider' },
            p: 2.5,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            gap: 1.5,
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SidebarFieldSkeleton key={i} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

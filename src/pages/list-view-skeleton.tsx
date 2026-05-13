import { Box, Skeleton } from '@mui/material';

const ROW_COUNT = 10;

const COLS = [
  { key: 'key', w: 84 },
  { key: 'type', w: 28 },
  { key: 'priority', w: 28 },
  { key: 'title', flex: 1 },
  { key: 'epic', w: 160 },
  { key: 'assignee', w: 130 },
  { key: 'status', w: 110 },
  { key: 'estimate', w: 50 },
  { key: 'logged', w: 70 },
  { key: 'due', w: 80 },
] as const;

function HeaderCell({ width, flex }: { width?: number; flex?: number }) {
  return (
    <Box sx={{ width, flex, px: 0.5 }}>
      <Skeleton variant="text" width={28} height={11} />
    </Box>
  );
}

function RowCell({ width, flex, variant = 'text' }: {
  width?: number;
  flex?: number;
  variant?: 'text' | 'pill' | 'avatar';
}) {
  return (
    <Box sx={{ width, flex, px: 0.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
      {variant === 'avatar' ? (
        <>
          <Skeleton variant="circular" width={18} height={18} />
          <Skeleton variant="text" width="60%" height={12} />
        </>
      ) : variant === 'pill' ? (
        <Skeleton variant="rectangular" width="80%" height={16} sx={{ borderRadius: 0.5 }} />
      ) : (
        <Skeleton variant="text" width="80%" height={13} />
      )}
    </Box>
  );
}

function TableRowSkeleton() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.75,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ width: 84, px: 0.5 }}>
        <Skeleton variant="text" width={56} height={13} />
      </Box>
      <Box sx={{ width: 28, px: 0.5 }}>
        <Skeleton variant="circular" width={13} height={13} />
      </Box>
      <Box sx={{ width: 28, px: 0.5 }}>
        <Skeleton variant="circular" width={12} height={12} />
      </Box>
      <RowCell flex={1} />
      <RowCell width={160} variant="pill" />
      <RowCell width={130} variant="avatar" />
      <RowCell width={110} variant="pill" />
      <RowCell width={50} />
      <RowCell width={70} />
      <RowCell width={80} />
    </Box>
  );
}

export default function ListViewSkeleton() {
  return (
    <Box
      sx={{ flex: 1, overflow: 'hidden', bgcolor: 'background.paper', height: '100%' }}
      role="status"
      aria-label="Načítání seznamu úkolů"
    >
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1,
          gap: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Skeleton variant="rectangular" width={200} height={26} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={88} height={26} sx={{ borderRadius: 1 }} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="text" width={60} height={12} />
      </Box>

      <Box sx={{ minWidth: 1100 }}>
        {/* Header row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 1.5,
            py: 0.75,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {COLS.map(c => (
            <HeaderCell
              key={c.key}
              width={'w' in c ? c.w : undefined}
              flex={'flex' in c ? c.flex : undefined}
            />
          ))}
        </Box>

        {/* Rows */}
        {Array.from({ length: ROW_COUNT }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </Box>
    </Box>
  );
}

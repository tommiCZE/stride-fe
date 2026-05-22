import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useGlobalActivity } from '../hooks/useActivity';
import ActivityFeedItem from './activity-feed-item';

interface Props {
  limit?: number;
}

export default function ActivityFeed({ limit = 20 }: Props) {
  const [, setSearchParams] = useSearchParams();
  const openTask = (key: string) =>
    setSearchParams(prev => {
      prev.set('task', key);
      return prev;
    });

  const { data = [], isLoading } = useGlobalActivity(limit);

  if (isLoading) {
    return (
      <Stack spacing={1.25} >
        {Array.from({ length: 6 }).map((_, i) => (
          <Stack direction="row" spacing={1} key={i} >
            <Skeleton variant="circular" width={22} height={22} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" sx={{ fontSize: '14px' }} width="80%" />
              <Skeleton variant="text" sx={{ fontSize: '14px' }} width="40%" />
            </Box>
          </Stack>
        ))}
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Typography sx={{ fontSize: '14px', color: 'text.disabled', textAlign: 'center', py: 2 }}>
        Žádná aktivita.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.25} >
      {data.slice(0, limit).map(item => (
        <ActivityFeedItem key={item.id} item={item} onOpen={openTask} />
      ))}
    </Stack>
  );
}

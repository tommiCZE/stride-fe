import { Box, Skeleton, Typography } from '@mui/material';
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="circular" width={22} height={22} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" sx={{ fontSize: 12.5 }} width="80%" />
              <Skeleton variant="text" sx={{ fontSize: 10.5 }} width="40%" />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Typography sx={{ fontSize: 12, color: 'text.disabled', textAlign: 'center', py: 2 }}>
        Žádná aktivita.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      {data.slice(0, limit).map(item => (
        <ActivityFeedItem key={item.id} item={item} onOpen={openTask} />
      ))}
    </Box>
  );
}

import { useMemo, useState } from 'react';
import { Box, Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotificationsStore, type NotificationItem, type NotificationType } from '../store/notifications-store';
import { BellIcon, CheckIcon, CommentIcon, ListIcon, CalendarIcon } from '../components/icons/icons';
import EmptyState from '../components/empty-state/EmptyState';

type Filter = 'all' | 'unread';

function relativeTime(ts: number, now: number = Date.now()): string {
  const diffSec = Math.max(0, Math.floor((now - ts) / 1000));
  if (diffSec < 60) return 'právě teď';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  return new Date(ts).toLocaleDateString();
}

function iconForType(type: NotificationType) {
  switch (type) {
    case 'task:created':  return <ListIcon />;
    case 'task:updated':  return <CheckIcon />;
    case 'comment:added': return <CommentIcon />;
    case 'sprint:updated': return <CalendarIcon />;
  }
}

function InboxRow({ item, onSelect }: { item: NotificationItem; onSelect: (it: NotificationItem) => void }) {
  return (
    <Box
      onClick={() => onSelect(item)}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.25,
        px: 1.5, py: 1.1,
        borderRadius: 1.2, border: 1, borderColor: 'divider',
        bgcolor: item.read ? 'background.paper' : (theme) => alpha(theme.palette.primary.main, 0.05),
        cursor: 'pointer',
        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{
        width: 26, height: 26, borderRadius: 1, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        bgcolor: 'action.hover', color: 'text.secondary', flexShrink: 0,
      }}>
        {iconForType(item.type)}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: 13,
          fontWeight: item.read ? 400 : 600,
          color: 'text.primary',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {item.message}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 11.5, color: 'text.disabled', minWidth: 60, textAlign: 'right' }}>
        {relativeTime(item.createdAt)}
      </Typography>
      {!item.read && (
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }}/>
      )}
    </Box>
  );
}

export default function Inbox() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const items = useNotificationsStore(s => s.items);
  const markRead = useNotificationsStore(s => s.markRead);
  const markAllRead = useNotificationsStore(s => s.markAllRead);
  const clearAll = useNotificationsStore(s => s.clearAll);

  const [filter, setFilter] = useState<Filter>('all');
  const unreadCount = items.filter(i => !i.read).length;

  const visible = useMemo(
    () => (filter === 'unread' ? items.filter(i => !i.read) : items),
    [items, filter],
  );

  const handleSelect = (item: NotificationItem) => {
    markRead(item.id);
    if (item.taskKey) navigate(`/task/${item.taskKey}`);
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: 'background.default', height: '100%' }}>
      <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
            {t('inbox.title')}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            {unreadCount > 0
              ? t('inbox.unreadCount', { count: unreadCount })
              : t('inbox.noUnread')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <ToggleButtonGroup
            size="small"
            value={filter}
            exclusive
            onChange={(_, v: Filter | null) => v && setFilter(v)}
          >
            <ToggleButton value="all" sx={{ fontSize: 11.5, px: 1.5, py: 0.5 }}>
              {t('inbox.showAll')}
            </ToggleButton>
            <ToggleButton value="unread" sx={{ fontSize: 11.5, px: 1.5, py: 0.5 }}>
              {t('inbox.showUnread')}
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            size="small"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            sx={{ fontSize: 11.5 }}
          >
            {t('notifications.markAllRead')}
          </Button>
          <Button
            size="small"
            color="error"
            onClick={clearAll}
            disabled={items.length === 0}
            sx={{ fontSize: 11.5 }}
          >
            {t('inbox.clearAll')}
          </Button>
        </Stack>
      </Stack>

      {visible.length === 0 ? (
        <EmptyState
          icon={<BellIcon />}
          title={t('inbox.emptyTitle')}
          description={
            filter === 'unread'
              ? t('inbox.emptyUnreadDescription')
              : t('inbox.emptyDescription')
          }
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {visible.map((item) => (
            <InboxRow key={item.id} item={item} onSelect={handleSelect} />
          ))}
        </Box>
      )}
    </Box>
  );
}

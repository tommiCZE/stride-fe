import { Box, Button, Divider, Popover, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotificationsStore, type NotificationItem, type NotificationType } from '../store/notifications-store';
import { BellIcon, CheckIcon, CommentIcon, ListIcon, CalendarIcon } from './icons/icons';

interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const POPOVER_LIMIT = 15;

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

function NotificationRow({ item, onSelect }: { item: NotificationItem; onSelect: (it: NotificationItem) => void }) {
  return (
    <Box
      onClick={() => onSelect(item)}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        px: 1.75,
        py: 1.1,
        cursor: 'pointer',
        bgcolor: item.read ? 'transparent' : (theme) => alpha(theme.palette.primary.main, 0.06),
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{
        mt: 0.25, width: 24, height: 24, borderRadius: 1, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        bgcolor: 'action.hover', color: 'text.secondary', flexShrink: 0,
      }}>
        {iconForType(item.type)}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: 14,
          fontWeight: item.read ? 400 : 600,
          color: 'text.primary',
          lineHeight: 1.35,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {item.message}
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
          {relativeTime(item.createdAt)}
        </Typography>
      </Box>
      {!item.read && (
        <Box sx={{
          width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main',
          mt: 1, flexShrink: 0,
        }}/>
      )}
    </Box>
  );
}

export default function NotificationsPopover({ anchorEl, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const items = useNotificationsStore(s => s.items);
  const markRead = useNotificationsStore(s => s.markRead);
  const markAllRead = useNotificationsStore(s => s.markAllRead);

  const unreadCount = items.filter(i => !i.read).length;
  const visible = items.slice(0, POPOVER_LIMIT);

  const handleSelect = (item: NotificationItem) => {
    markRead(item.id);
    onClose();
    if (item.taskKey) navigate(`/task/${item.taskKey}`);
  };

  const handleViewAll = () => {
    onClose();
    navigate('/inbox');
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { width: 360, maxHeight: 480, mt: 0.5 } } }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 1.75, py: 1.25, borderBottom: 1, borderColor: 'divider',
      }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
          {t('notifications.title')}
          {unreadCount > 0 && (
            <Typography component="span" sx={{ fontSize: 13, color: 'text.secondary', ml: 0.75, fontWeight: 500 }}>
              · {unreadCount}
            </Typography>
          )}
        </Typography>
        {unreadCount > 0 && (
          <Button size="small" onClick={markAllRead} sx={{ fontSize: 13, minWidth: 0, px: 1 }}>
            {t('notifications.markAllRead')}
          </Button>
        )}
      </Box>

      {visible.length === 0 ? (
        <Stack alignItems="center" spacing={1} sx={{ py: 4, px: 2, color: 'text.secondary' }}>
          <BellIcon />
          <Typography sx={{ fontSize: 14 }}>{t('notifications.empty')}</Typography>
        </Stack>
      ) : (
        <Box sx={{ overflowY: 'auto', maxHeight: 360 }}>
          {visible.map((item, idx) => (
            <Box key={item.id}>
              <NotificationRow item={item} onSelect={handleSelect} />
              {idx < visible.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', py: 0.5 }}>
        <Button size="small" onClick={handleViewAll} sx={{ fontSize: 14, fontWeight: 500 }}>
          {t('notifications.viewAll')}
        </Button>
      </Box>
    </Popover>
  );
}

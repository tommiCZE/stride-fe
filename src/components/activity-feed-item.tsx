import { Box, Typography } from '@mui/material';
import FluxAvatar from './flux-avatar';
import type { ActivityDto, User } from '../types';
import { timeAgo, STATUSES } from '../mocks/data';

interface Props {
  item: ActivityDto;
  onOpen: (taskKey: string) => void;
}

/**
 * Map an enum-ish status name coming from the BE (TODO, IN_PROGRESS, …) to a pretty label.
 * Falls back to the original string for unknown values.
 */
function prettyStatus(raw: string | null | undefined): string {
  if (!raw) return '';
  const normalized = raw.toLowerCase().replace(/_/g, ' ');
  const match = STATUSES.find(s => s.name.toLowerCase() === normalized || s.id === raw.toLowerCase());
  return match ? match.name : raw;
}

/**
 * Build a human-readable Czech activity sentence from an ActivityDto.
 * Returns the action phrase only (without the actor's name).
 */
function describeAction(item: ActivityDto): string {
  const target = (item.target ?? '').toLowerCase();
  const action = (item.action ?? '').toLowerCase();
  const from = prettyStatus(item.fromValue);
  const to = prettyStatus(item.toValue);

  // Status change: action=updated, target=status
  if (action === 'updated' && target === 'status') {
    if (from && to) return `změnil/a status z „${from}” na „${to}”`;
    if (to) return `změnil/a status na „${to}”`;
    return 'změnil/a status';
  }
  if (action === 'updated' && target === 'priority') {
    if (from && to) return `změnil/a prioritu z „${from}” na „${to}”`;
    return 'změnil/a prioritu';
  }
  if (action === 'updated' && target === 'title') return 'přejmenoval/a úkol';
  if (action === 'updated') return `upravil/a ${target || 'úkol'}`;
  if (action === 'created' && target === 'task') return 'vytvořil/a úkol';
  if (action === 'created') return `vytvořil/a ${target || 'položku'}`;
  if (action === 'assigned') return to ? `přiřadil/a úkol uživateli ${to}` : 'přiřadil/a úkol';
  if (action === 'commented') return 'přidal/a komentář';
  if (action === 'mentioned') return 'vás zmínil/a v komentáři';
  if (action === 'sprint_started' || (action === 'started' && target === 'sprint')) return 'spustil/a sprint';

  // Fallback — show raw action.
  return `${action} ${target}`.trim();
}

export default function ActivityFeedItem({ item, onOpen }: Props) {
  const actor: User | null = item.actor
    ? {
        id: item.actor.id,
        name: item.actor.name,
        initials: item.actor.initials,
        color: item.actor.color,
        role: '',
        email: item.actor.email ?? undefined,
      }
    : null;
  const sentence = describeAction(item);

  return (
    <Box
      onClick={() => onOpen(item.taskKey)}
      sx={{
        display: 'flex',
        gap: 1,
        cursor: 'pointer',
        borderRadius: 1,
        p: 0.5,
        mx: -0.5,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <FluxAvatar user={actor} size={22} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12.5, lineHeight: 1.4 }}>
          <b>{actor?.name ?? 'Někdo'}</b>{' '}
          <Box component="span" sx={{ color: 'text.secondary' }}>{sentence}</Box>
          {' '}
          <Box component="span" sx={{ fontFamily: 'ui-monospace, monospace', color: 'info.main' }}>
            {item.taskKey}
          </Box>
        </Typography>
        {item.taskTitle && (
          <Typography
            sx={{
              fontSize: 11.5,
              color: 'text.secondary',
              mt: 0.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.taskTitle}
          </Typography>
        )}
        <Typography sx={{ fontSize: 10.5, color: 'text.disabled', mt: 0.1 }}>
          {timeAgo(item.createdAt)}
          {item.projectName ? ` · ${item.projectName}` : ''}
        </Typography>
      </Box>
    </Box>
  );
}

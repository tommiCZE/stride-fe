import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import type { UserDto as User } from '../../../api/types';
import FluxAvatar from '../../flux-avatar';

export interface MentionListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface Props {
  items: User[];
  command: (props: { id: string | null; label?: string | null }) => void;
}

const MentionList = forwardRef<MentionListHandle, Props>(function MentionList(
  { items, command },
  ref,
) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  const selectItem = (index: number) => {
    const item = items[index];
    if (!item) return;
    command({ id: item.id, label: item.name });
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev + items.length - 1) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev + 1) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (!items.length) {
    return (
      <Paper
        elevation={6}
        sx={{
          p: 1.25,
          minWidth: 220,
          borderRadius: 1.25,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
          Žádný člen týmu nenalezen
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={6}
      sx={{
        py: 0.5,
        minWidth: 240,
        maxWidth: 320,
        borderRadius: 1.25,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      {items.map((item, index) => (
        <Box
          key={item.id}
          onMouseDown={(e) => {
            e.preventDefault();
            selectItem(index);
          }}
          onMouseEnter={() => setSelectedIndex(index)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.25,
            py: 0.75,
            cursor: 'default',
            bgcolor: index === selectedIndex ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <FluxAvatar user={item} size={24} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }} noWrap>
              {item.name}
            </Typography>
            {item.email && (
              <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.2 }} noWrap>
                {item.email}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Paper>
  );
});

export default MentionList;

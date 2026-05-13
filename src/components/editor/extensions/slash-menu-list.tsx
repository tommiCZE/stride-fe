import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SlashMenuItem } from './slash-menu';

/**
 * Imperative API exposed via `ref` so the Suggestion plugin can forward
 * key events from ProseMirror to the dropdown without re-rendering.
 */
export interface SlashMenuListHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

interface Props {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
  /** ProseMirror gives us the bounding rect of the trigger character. */
  clientRect?: (() => DOMRect | null) | null;
}

/**
 * Linear/Notion-style slash command dropdown.
 *
 * Positioned via `position: fixed` anchored at the trigger's DOMRect
 * (returned by Suggestion's `clientRect`). This matches the `BubbleToolbar`
 * pattern (`menu-bar.tsx`) — Portal + fixed positioning, no tippy.js.
 */
const SlashMenuList = forwardRef<SlashMenuListHandle, Props>(function SlashMenuList(
  { items, command, clientRect },
  ref,
) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(() => clientRect?.() ?? null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Reset highlight whenever the filtered list changes.
  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  // Update anchor rect on every render — ProseMirror moves the trigger
  // as the user types into the query.
  useLayoutEffect(() => {
    if (!clientRect) return;
    const next = clientRect();
    if (next) setRect(next);
  });

  // Scroll the selected item into view inside the dropdown.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const child = list.children[selectedIndex] as HTMLElement | undefined;
    if (!child) return;
    const childTop = child.offsetTop;
    const childBottom = childTop + child.offsetHeight;
    if (childTop < list.scrollTop) {
      list.scrollTop = childTop;
    } else if (childBottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = childBottom - list.clientHeight;
    }
  }, [selectedIndex]);

  const selectItem = (index: number) => {
    const item = items[index];
    if (!item) return;
    command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        setSelectedIndex(prev => (items.length === 0 ? 0 : (prev + 1) % items.length));
        return true;
      }
      if (event.key === 'ArrowUp') {
        setSelectedIndex(prev => (items.length === 0 ? 0 : (prev - 1 + items.length) % items.length));
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (!rect) return null;
  if (items.length === 0) {
    return (
      <Paper
        elevation={6}
        sx={{
          position: 'fixed',
          left: `${rect.left}px`,
          top: `${rect.bottom + 6}px`,
          zIndex: theme => theme.zIndex.tooltip,
          minWidth: 260,
          py: 1,
          px: 1.5,
          borderRadius: 1.5,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          Žádné výsledky
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      ref={listRef}
      elevation={6}
      sx={{
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.bottom + 6}px`,
        zIndex: theme => theme.zIndex.tooltip,
        minWidth: 280,
        maxHeight: 320,
        overflowY: 'auto',
        py: 0.5,
        borderRadius: 1.5,
        border: 1,
        borderColor: 'divider',
      }}
    >
      {items.map((item, index) => (
        <Box
          key={item.id}
          onMouseDown={e => {
            e.preventDefault();
            selectItem(index);
          }}
          onMouseEnter={() => setSelectedIndex(index)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            px: 1.25,
            py: 0.75,
            cursor: 'pointer',
            bgcolor: index === selectedIndex
              ? theme => alpha(theme.palette.primary.main, 0.12)
              : 'transparent',
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              color: 'text.primary',
              flexShrink: 0,
            }}
          >
            {item.icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {item.label}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.description}
            </Typography>
          </Box>
        </Box>
      ))}
    </Paper>
  );
});

export default SlashMenuList;

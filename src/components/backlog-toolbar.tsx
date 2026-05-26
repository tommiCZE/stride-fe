import { useState } from 'react';
import {
  Box, Button, IconButton, InputBase, Menu, MenuItem, Stack, Typography,
} from '@mui/material';
import { CaretIcon, SearchIcon, CloseIcon } from './icons/icons';
import { QUICK_CHIPS, SORT_OPTIONS, type QuickChip, type SortBy } from '../utils/backlog-filter';
import { GROUP_OPTIONS, type GroupBy } from '../utils/backlog-group';
import type { ReleaseDto } from '../api/types';

interface Props {
  count: number;
  totalEstimate: number;
  search: string;
  onSearchChange: (s: string) => void;
  quickChip: QuickChip;
  onQuickChipChange: (q: QuickChip) => void;
  groupBy: GroupBy;
  onGroupByChange: (g: GroupBy) => void;
  sortBy: SortBy;
  onSortByChange: (s: SortBy) => void;
  activeRelease?: ReleaseDto | null;
}

function DropdownButton<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const active = options.find(o => o.id === value);
  return (
    <>
      <Button
        size="small" variant="text"
        onClick={e => setAnchor(e.currentTarget)}
        endIcon={<CaretIcon/>}
        sx={{
          fontSize: 12, fontWeight: 500, color: 'text.secondary',
          bgcolor: 'background.default', px: 1.1, py: 0.4,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Box component="span" sx={{ color: 'text.disabled', mr: 0.6 }}>{label}:</Box>
        <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
          {active?.label ?? value}
        </Box>
      </Button>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        {options.map(o => (
          <MenuItem key={o.id}
            selected={o.id === value}
            onClick={() => { onChange(o.id); setAnchor(null); }}>
            {o.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default function BacklogToolbar({
  count, totalEstimate, search, onSearchChange,
  quickChip, onQuickChipChange,
  groupBy, onGroupByChange,
  sortBy, onSortByChange,
  activeRelease,
}: Props) {
  const allChips = activeRelease
    ? [...QUICK_CHIPS, { id: 'active-release' as QuickChip, label: `📦 ${activeRelease.name}` }]
    : QUICK_CHIPS;
  return (
    <Stack spacing={1} sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 700 }}>
          Backlog
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {count} tasků{totalEstimate > 0 && ` · ${totalEstimate}h est`}
        </Typography>
        <Box sx={{ flex: 1 }}/>
        <Stack direction="row" spacing={0.75} sx={{
          alignItems: 'center',
          bgcolor: 'background.default',
          borderRadius: 1.5, px: 1, py: 0.3,
          minWidth: 200, maxWidth: 320,
          '&:focus-within': { boxShadow: '0 0 0 2px var(--mui-palette-primary-main)' },
        }}>
          <Box sx={{ color: 'text.disabled', display: 'inline-flex' }}>
            <SearchIcon/>
          </Box>
          <InputBase
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Hledat v backlogu…"
            sx={{ flex: 1, fontSize: 13 }}
          />
          {search && (
            <IconButton size="small" onClick={() => onSearchChange('')}
              sx={{ p: 0.25, color: 'text.disabled' }}>
              <CloseIcon/>
            </IconButton>
          )}
        </Stack>
      </Stack>

      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
        {allChips.map(c => {
          const active = c.id === quickChip;
          return (
            <Box
              key={c.id}
              onClick={() => onQuickChipChange(c.id)}
              sx={{
                fontSize: 12, fontWeight: 600,
                px: 1.1, py: 0.35, borderRadius: 999,
                cursor: 'default',
                bgcolor: active ? 'text.primary' : 'background.default',
                color: active ? 'background.paper' : 'text.secondary',
                border: 1, borderColor: active ? 'text.primary' : 'transparent',
                '&:hover': { bgcolor: active ? 'text.primary' : 'action.hover' },
              }}
            >
              {c.label}
            </Box>
          );
        })}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <DropdownButton<GroupBy>
          label="Group" value={groupBy} options={GROUP_OPTIONS} onChange={onGroupByChange}
        />
        <DropdownButton<SortBy>
          label="Sort" value={sortBy} options={SORT_OPTIONS} onChange={onSortByChange}
        />
      </Stack>
    </Stack>
  );
}

import { useState } from 'react';
import { Box, Menu, MenuItem } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { BOARD_STATUSES } from '../../../constants/statuses';

export function StatusPicker({ statusId, onChange }: { statusId: string; onChange: (id: string) => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const status = BOARD_STATUSES.find(s => s.id === statusId) ?? BOARD_STATUSES[0];

  return (
    <>
      <Box onClick={e => setAnchor(e.currentTarget)}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5,
          borderRadius: 1, fontSize: 14, fontWeight: 600, cursor: 'default',
          bgcolor: alpha(status.color, 0.14), color: status.color,
          border: 1, borderColor: alpha(status.color, 0.25),
          '&:hover': { bgcolor: alpha(status.color, 0.22) } }}>
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: status.color }}/>
        {status.name}
        <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="m4 6 4 4 4-4"/></svg>
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        {BOARD_STATUSES.map(s => (
          <MenuItem key={s.id} onClick={() => { onChange(s.id); setAnchor(null); }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: s.color, mr: 1 }}/>
            {s.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

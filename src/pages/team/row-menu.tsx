import { useState } from 'react';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import { SectionLabel } from '../../components/ui/ui';
import { MoreIcon } from '../../components/icons/icons';
import { roleLabel } from './role-badge';
import type { WorkspaceRole } from './role-badge';

interface RowMenuProps {
  userId: string;
  currentRole: WorkspaceRole;
  onRoleChange: (role: WorkspaceRole) => void;
  onRemove: () => void;
}

export function RowMenu({ userId, currentRole, onRoleChange, onRemove }: RowMenuProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const isMe = userId === 'u1';

  return (
    <>
      <IconButton size="small" onClick={e => setAnchor(e.currentTarget)} disabled={isMe}>
        <MoreIcon/>
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Box sx={{ px: 1.5, py: 0.5 }}>
          <SectionLabel>Oprávnění</SectionLabel>
        </Box>
        {(['admin', 'member', 'viewer'] as WorkspaceRole[]).map(r => (
          <MenuItem key={r} selected={r === currentRole}
            onClick={() => { onRoleChange(r); setAnchor(null); }}
            sx={{ fontSize: 13 }}>
            {roleLabel[r]}
          </MenuItem>
        ))}
        <Box sx={{ my: 0.5, borderTop: 1, borderColor: 'divider' }}/>
        <MenuItem onClick={() => { onRemove(); setAnchor(null); }}
          sx={{ fontSize: 13, color: 'error.main' }}>
          Odebrat z týmu
        </MenuItem>
      </Menu>
    </>
  );
}

import { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { MoreIcon, DeleteIcon } from './icons/icons';

interface Props {
  onDelete: () => void;
}

export default function SprintActionsMenu({ onDelete }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <IconButton
        size="small"
        onClick={e => { e.stopPropagation(); setAnchor(e.currentTarget); }}
        sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}
      >
        <MoreIcon/>
      </IconButton>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MenuItem onClick={() => { onDelete(); setAnchor(null); }} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}><DeleteIcon/></ListItemIcon>
          <ListItemText primary="Smazat sprint"/>
        </MenuItem>
      </Menu>
    </>
  );
}

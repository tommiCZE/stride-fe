import { Box } from '@mui/material';
import type { UserDto } from '../api/types';

interface Props {
  user?: Pick<UserDto, 'color' | 'initials'> | null;
  size?: number;
  ring?: boolean;
}

export default function FluxAvatar({ user, size = 22, ring = false }: Props) {
  if (!user) {
    return (
      <Box component="span" sx={{
        width: size, height: size, borderRadius: '50%',
        background: 'transparent',
        border: '1px dashed currentColor',
        opacity: 0.4,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: `${size * 0.45}px`, fontWeight: 600, color: 'inherit', flexShrink: 0,
      }}>?</Box>
    );
  }
  return (
    <Box component="span" sx={{
      width: size, height: size, borderRadius: '50%',
      background: user.color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff',
      fontSize: `${size * 0.42}px`, fontWeight: 600,
      letterSpacing: '0.02em',
      boxShadow: ring ? '0 0 0 2px var(--paper, #fff)' : 'none',
      flexShrink: 0,
    }}>{user.initials}</Box>
  );
}

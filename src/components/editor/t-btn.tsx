import { Divider, Stack, Tooltip, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface TBtnProps {
  title: string;
  active?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

export function TBtn({ title, active, onMouseDown, children }: TBtnProps) {
  const theme = useTheme();
  return (
    <Tooltip title={title} enterDelay={600} placement="top">
      <Stack direction="row" onMouseDown={onMouseDown} sx={{
        width: 26, height: 26, alignItems: 'center', justifyContent: 'center',
        borderRadius: 0.75, cursor: 'default', fontSize: '14px', fontWeight: 700, userSelect: 'none',
        color: active ? 'primary.main' : 'text.secondary',
        bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
        '&:hover': { bgcolor: active ? alpha(theme.palette.primary.main, 0.2) : 'action.hover' } }}>
        {children}
      </Stack>
    </Tooltip>
  );
}

export const Sep = () => <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5 }}/>;

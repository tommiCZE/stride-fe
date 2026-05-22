import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useUiStore } from '../store/ui-store';
import Sidebar from './sidebar';
import GlobalHeader from './global-header';
import ProjectTopbar from './project-topbar';

export default function AppLayout({ children }: { children?: ReactNode }) {
  const { mobileMenuOpen, setMobileMenu } = useUiStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Stack direction="row" sx={{ height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      {isMobile ? (
        <Drawer open={mobileMenuOpen} onClose={() => setMobileMenu(false)}
          slotProps={{ paper: { sx: { width: 232, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider' } } }}>
          <Sidebar onClose={() => setMobileMenu(false)}/>
        </Drawer>
      ) : (
        <Box sx={{ width: 232, flexShrink: 0, height: '100%', borderRight: 1, borderColor: 'divider' }}>
          <Sidebar/>
        </Box>
      )}

      <Stack sx={{ flex: 1, minWidth: 0, height: '100%' }}>
        <GlobalHeader/>
        <ProjectTopbar/>
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {children ?? <Outlet />}
        </Box>
      </Stack>
    </Stack>
  );
}

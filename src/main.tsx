import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';
import 'dayjs/locale/cs';
import { buildTheme } from './theme';
import { useUiStore } from './store/ui-store';
import App from './App';
import AppErrorBoundary from './components/error-boundary/app-error-boundary';
import { queryClient } from './api/query-client';
import './locales';
import './index.css';

// eslint-disable-next-line react-refresh/only-export-components -- main.tsx entry point, not HMR-target
function ThemedApp() {
  const themeMode = useUiStore(s => s.themeMode);
  const theme = buildTheme(themeMode);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="cs">
        <AppErrorBoundary>
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <App />
          </SnackbarProvider>
        </AppErrorBoundary>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemedApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);

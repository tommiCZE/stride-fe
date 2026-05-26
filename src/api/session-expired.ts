import { enqueueSnackbar } from 'notistack';
import { useAuthStore } from '../store/auth-store';
import { queryClient } from './query-client';

let triggered = false;

// Single entrypoint for force-logout flows (401 from REST, repeated SSE failures).
// The flag prevents a burst of failing requests from stacking N toasts; ProtectedLayout
// observes the cleared store and routes to /login via React Router (no hard reload,
// so the toast actually survives long enough to be seen).
export function forceSessionExpired() {
  if (triggered) return;
  triggered = true;
  enqueueSnackbar('Your session has expired. Please log in again.', { variant: 'warning' });
  useAuthStore.getState().logout();
  queryClient.clear();
  // Re-arm so a subsequent real login + re-expiry still works.
  setTimeout(() => { triggered = false; }, 1000);
}

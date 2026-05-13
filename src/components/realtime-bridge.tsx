import { useRealtimeEvents } from '../hooks/useRealtimeEvents';

/**
 * Invisible bridge that mounts the SSE listener once inside the authenticated
 * layout. Rendering null keeps it out of the React tree but lets the hook own
 * its EventSource lifecycle alongside the rest of the app.
 */
export default function RealtimeBridge(): null {
  useRealtimeEvents();
  return null;
}

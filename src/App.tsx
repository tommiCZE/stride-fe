import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { CircularProgress, Stack } from '@mui/material';
import { useAuthStore } from './store/auth-store';
import { useUiStore } from './store/ui-store';
import AppLayout from './layouts/app-layout';
import Board from './pages/board';
import Dashboard from './pages/dashboard';
import Backlog from './pages/backlog';
import ListView from './pages/list-view';
import Reports from './pages/reports';
import Settings from './pages/settings';
import WorkspaceSettings from './pages/workspace-settings';
import MyWork from './pages/my-work';
import Inbox from './pages/inbox';
import TaskDetail from './pages/task-detail';
import TaskPage from './pages/task-page';
import Login from './pages/login';
import Profile from './pages/profile';
import SearchPage from './pages/search';
import ReleasesPage from './pages/releases';
import ReleaseDetailPage from './pages/releases/release-detail';
import CreateTaskModal from './components/create-task-modal';
import KeyboardHelpDialog from './components/keyboard-help/keyboard-help-dialog';
import CommandPalette from './components/command-palette/CommandPalette';
import RealtimeBridge from './components/realtime-bridge';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';

const Calendar = lazy(() => import('./pages/calendar'));

function PageFallback() {
  return (
    <Stack direction="row" sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <CircularProgress size={20}/>
    </Stack>
  );
}

function ProtectedLayout() {
  const token = useAuthStore(s => s.token);
  const createModalOpen = useUiStore(s => s.createModalOpen);
  const [searchParams] = useSearchParams();
  const hasTask = searchParams.has('task');

  if (!token) return <Navigate to="/login" replace />;

  return (
    <AppLayout>
      <RealtimeBridge />
      <Outlet />
      {hasTask && <TaskDetail />}
      {createModalOpen && <CreateTaskModal />}
    </AppLayout>
  );
}

function AuthGuard() {
  const token = useAuthStore(s => s.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

const router = createBrowserRouter([
  { path: '/login', element: <AuthGuard /> },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'inbox',     element: <Inbox /> },
      { path: 'my-work',   element: <MyWork /> },
      { path: 'calendar',  element: <Suspense fallback={<PageFallback />}><Calendar /></Suspense> },
      { path: 'reports',   element: <Reports /> },
      { path: 'profile',   element: <Profile /> },
      { path: 'search',    element: <SearchPage /> },
      { path: 'task/:taskKey', element: <TaskPage /> },
      { path: 'settings',           element: <WorkspaceSettings /> },
      { path: 'settings/:section',  element: <WorkspaceSettings /> },
      {
        path: 'projects/:projectKey',
        children: [
          { index: true, element: <Navigate to="board" relative="path" replace /> },
          { path: 'board',     element: <Board /> },
          { path: 'backlog',   element: <Backlog /> },
          { path: 'list',      element: <ListView /> },
          { path: 'reports',   element: <Reports /> },
          { path: 'releases',  element: <ReleasesPage /> },
          { path: 'releases/:releaseId', element: <ReleaseDetailPage /> },
          { path: 'settings',  element: <Settings /> },
        ],
      },
    ],
  },
]);

export default function App() {
  const { open, setOpen, paletteOpen, setPaletteOpen } = useKeyboardShortcuts();
  return (
    <>
      <RouterProvider router={router} />
      <KeyboardHelpDialog open={open} onClose={() => setOpen(false)} />
      {paletteOpen && <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />}
    </>
  );
}

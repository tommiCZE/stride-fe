import { createBrowserRouter, RouterProvider, Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuthStore } from './store/auth-store';
import { useUiStore } from './store/ui-store';
import AppLayout from './layouts/app-layout';
import Board from './pages/board';
import Dashboard from './pages/dashboard';
import Backlog from './pages/backlog';
import ListView from './pages/list-view';
import Reports from './pages/reports';
import Settings from './pages/settings';
import MyWork from './pages/my-work';
import Team from './pages/team';
import TaskDetail from './pages/task-detail';
import Login from './pages/login';
import Profile from './pages/profile';
import CreateTaskModal from './components/create-task-modal';
import KeyboardHelpDialog from './components/keyboard-help/keyboard-help-dialog';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';

function ProtectedLayout() {
  const token = useAuthStore(s => s.token);
  const createModalOpen = useUiStore(s => s.createModalOpen);
  const [searchParams] = useSearchParams();
  const hasTask = searchParams.has('task');

  if (!token) return <Navigate to="/login" replace />;

  return (
    <AppLayout>
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
      { path: 'inbox',     element: <MyWork /> },
      { path: 'my-work',   element: <MyWork /> },
      { path: 'reports',   element: <Reports /> },
      { path: 'team',      element: <Team /> },
      { path: 'profile',   element: <Profile /> },
      {
        path: 'projects/:projectId',
        children: [
          { index: true, element: <Navigate to="board" relative="path" replace /> },
          { path: 'board',     element: <Board /> },
          { path: 'backlog',   element: <Backlog /> },
          { path: 'list',      element: <ListView /> },
          { path: 'reports',   element: <Reports /> },
          { path: 'settings',  element: <Settings /> },
        ],
      },
    ],
  },
]);

export default function App() {
  const { open, setOpen } = useKeyboardShortcuts();
  return (
    <>
      <RouterProvider router={router} />
      <KeyboardHelpDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

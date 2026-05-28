import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

export default function RequireAdmin({ children, fallback = '/my-time' }: {
  children: ReactNode;
  fallback?: string;
}) {
  const { isAdmin } = usePermissions();
  if (!isAdmin) return <Navigate to={fallback} replace />;
  return <>{children}</>;
}

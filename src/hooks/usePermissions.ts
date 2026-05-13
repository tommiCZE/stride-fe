import { useAuthStore } from '../store/auth-store';

export type WorkspaceRole = 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface Permissions {
  role: WorkspaceRole;
  isAdmin: boolean;
  isMember: boolean;
  isViewer: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageTeam: boolean;
  canCreateProject: boolean;
}

/**
 * Returns the current user's role and permission flags.
 *
 * Role semantics:
 * - ADMIN  – full access (edit, delete, manage team, create project)
 * - MEMBER – edit access (no destructive admin actions)
 * - VIEWER – read-only
 */
export function usePermissions(): Permissions {
  const user = useAuthStore(s => s.user);
  const rawRole = (user?.workspaceRole ?? 'VIEWER').toUpperCase();
  const role: WorkspaceRole =
    rawRole === 'ADMIN' || rawRole === 'MEMBER' || rawRole === 'VIEWER'
      ? (rawRole as WorkspaceRole)
      : 'VIEWER';

  const isAdmin = role === 'ADMIN';
  const isMember = role === 'MEMBER';
  const isViewer = role === 'VIEWER';

  return {
    role,
    isAdmin,
    isMember,
    isViewer,
    canEdit: isAdmin || isMember,
    canDelete: isAdmin,
    canManageTeam: isAdmin,
    canCreateProject: isAdmin,
  };
}

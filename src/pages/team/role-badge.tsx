import { Box } from '@mui/material';
import type { User } from '../../types';

export type WorkspaceRole = 'admin' | 'member' | 'viewer';
export type Status = 'active' | 'pending';

export interface TeamUser extends User {
  workspaceRole: WorkspaceRole;
  status: Status;
}

/* eslint-disable react-refresh/only-export-components -- constants colocated with badges */
export const roleLabel: Record<WorkspaceRole, string> = {
  admin:  'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

export const roleColor: Record<WorkspaceRole, { color: string; bg: string }> = {
  admin:  { color: '#6366f1', bg: '#6366f122' },
  member: { color: '#64748b', bg: '#64748b18' },
  viewer: { color: '#94a3b8', bg: 'transparent' },
};

const statusColor: Record<Status, { color: string; bg: string }> = {
  active:  { color: '#10b981', bg: '#10b98122' },
  pending: { color: '#f59e0b', bg: '#f59e0b22' },
};

export const AVATAR_COLORS = ['#6366f1', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];
/* eslint-enable react-refresh/only-export-components */

export function RoleBadge({ role }: { role: WorkspaceRole }) {
  const c = roleColor[role];
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 0.75, py: 0.2, borderRadius: 0.75,
      fontSize: '13px', fontWeight: 600, color: c.color, bgcolor: c.bg,
      border: role === 'viewer' ? '1px solid' : 'none', borderColor: 'divider' }}>
      {roleLabel[role]}
    </Box>
  );
}

export function StatusBadgeLocal({ status }: { status: Status }) {
  const c = statusColor[status];
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.2, borderRadius: 0.75,
      fontSize: '13px', fontWeight: 600, color: c.color, bgcolor: c.bg }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: c.color }}/>
      {status === 'active' ? 'Aktivní' : 'Čekající'}
    </Box>
  );
}

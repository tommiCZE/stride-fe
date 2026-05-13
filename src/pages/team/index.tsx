import { useState } from 'react';
import { Box, Button, Card, CircularProgress, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTeamMembers, useUpdateMember } from '../../hooks/useTeam';
import { useAuthStore } from '../../store/auth-store';
import FluxAvatar from '../../components/flux-avatar';
import { CardTitle } from '../../components/ui/ui';
import { PlusIcon } from '../../components/icons/icons';
import { RoleBadge, StatusBadgeLocal } from './role-badge';
import type { WorkspaceRole, Status } from './role-badge';
import { RowMenu } from './row-menu';
import { InviteDialog } from './invite-dialog';

export default function Team() {
  const { enqueueSnackbar } = useSnackbar();
  const { data: members = [], isLoading } = useTeamMembers();
  const updateMember = useUpdateMember();
  const currentUserId = useAuthStore(s => s.userId);
  const [inviteOpen, setInviteOpen] = useState(false);

  const total   = members.length;
  const active  = members.filter(u => u.status === 'ACTIVE').length;
  const pending = members.filter(u => u.status === 'PENDING').length;

  const changeRole = (id: string, role: WorkspaceRole) =>
    updateMember.mutate(
      { id, body: { workspaceRole: role.toUpperCase() } },
      { onSuccess: () => enqueueSnackbar('Oprávnění aktualizováno', { variant: 'success' }) },
    );

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: 'background.default', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', mb: 0.25 }}>
            Správa týmu
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            {total} členů · Acme s.r.o.
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<PlusIcon/>}
          onClick={() => setInviteOpen(true)}>
          Pozvat člena
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 3 }}>
        {[
          { label: 'Celkem členů',  value: total,   color: '#5A5BFF' },
          { label: 'Aktivní',       value: active,  color: '#10b981' },
          { label: 'Čekající',      value: pending, color: '#f59e0b' },
        ].map((s, i) => (
          <Card key={i} sx={{ p: 1.75, borderRadius: 1.5 }}>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 500 }}>{s.label}</Typography>
            <Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: s.color, mt: 0.25 }}>{s.value}</Typography>
          </Card>
        ))}
      </Box>

      <Card sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CardTitle>Členové</CardTitle>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.75,
          fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'text.secondary', borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
          <Box sx={{ flex: 1 }}>Člen</Box>
          <Box sx={{ width: 90 }}>Oprávnění</Box>
          <Box sx={{ width: 90 }}>Status</Box>
          <Box sx={{ width: 36 }}/>
        </Box>

        {isLoading && (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={20}/>
          </Box>
        )}

        {members.map(u => {
          const role = (u.workspaceRole?.toLowerCase() ?? 'member') as WorkspaceRole;
          const status = (u.status === 'ACTIVE' ? 'active' : 'pending') as Status;
          return (
            <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.25,
              borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 },
              '&:hover': { bgcolor: 'action.hover' } }}>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                <FluxAvatar user={u} size={32}/>
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{u.name}</Typography>
                    {u.id === currentUserId && (
                      <Typography sx={{ fontSize: 10.5, color: 'text.disabled' }}>(Vy)</Typography>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 11.5, color: 'text.secondary', lineHeight: 1.2 }}>{u.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ width: 90 }}>
                <RoleBadge role={role}/>
              </Box>
              <Box sx={{ width: 90 }}>
                <StatusBadgeLocal status={status}/>
              </Box>
              <Box sx={{ width: 36, display: 'flex', justifyContent: 'flex-end' }}>
                <RowMenu
                  userId={u.id}
                  currentRole={role}
                  onRoleChange={r => changeRole(u.id, r)}
                  onRemove={() => {}}
                />
              </Box>
            </Box>
          );
        })}
      </Card>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)}/>
    </Box>
  );
}

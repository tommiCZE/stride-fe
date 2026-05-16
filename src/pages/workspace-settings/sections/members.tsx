import { useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTeamMembers, useUpdateMember } from '../../../hooks/useTeam';
import { useAuthStore } from '../../../store/auth-store';
import FluxAvatar from '../../../components/flux-avatar';
import { PlusIcon } from '../../../components/icons/icons';
import { RoleBadge, StatusBadgeLocal } from '../../team/role-badge';
import type { WorkspaceRole, Status } from '../../team/role-badge';
import { RowMenu } from '../../team/row-menu';
import { InviteDialog } from '../../team/invite-dialog';
import { SectionHeader, SettingsCard } from '../../settings/shared';

export function WorkspaceMembersSection({ readOnly }: { readOnly: boolean }) {
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
    <>
      <SectionHeader hint={`${total} členů celkem, ${active} aktivních, ${pending} čekajících na pozvánku.`} />

      <SettingsCard
        title="Členové workspace"
        description="Lidé, kteří mají přístup do workspace. Per-projektová oprávnění se nastavují v Project settings."
        action={
          !readOnly && (
            <Button variant="contained" size="small" startIcon={<PlusIcon/>}
              onClick={() => setInviteOpen(true)}>
              Pozvat člena
            </Button>
          )
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.75,
          fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>
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
            <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', px: 1, py: 1.25,
              borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                <FluxAvatar user={u} size={32}/>
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>{u.name}</Typography>
                    {u.id === currentUserId && (
                      <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>(Vy)</Typography>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.2 }}>{u.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ width: 90 }}>
                <RoleBadge role={role}/>
              </Box>
              <Box sx={{ width: 90 }}>
                <StatusBadgeLocal status={status}/>
              </Box>
              <Box sx={{ width: 36, display: 'flex', justifyContent: 'flex-end' }}>
                {!readOnly && (
                  <RowMenu
                    userId={u.id}
                    currentRole={role}
                    onRoleChange={r => changeRole(u.id, r)}
                    onRemove={() => {}}
                  />
                )}
              </Box>
            </Box>
          );
        })}
      </SettingsCard>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)}/>
    </>
  );
}

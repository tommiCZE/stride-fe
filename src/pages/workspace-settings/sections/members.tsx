import { useState } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
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
        <Stack direction="row" sx={{ alignItems: 'center', px: 1, py: 0.75,
          fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'text.secondary', borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ flex: 1 }}>Člen</Box>
          <Box sx={{ width: 90 }}>Oprávnění</Box>
          <Box sx={{ width: 90 }}>Status</Box>
          <Box sx={{ width: 36 }}/>
        </Stack>

        {isLoading && (
          <Stack sx={{ p: 3, alignItems: 'center' }}>
            <CircularProgress size={20}/>
          </Stack>
        )}

        {members.map(u => {
          const role = (u.workspaceRole?.toLowerCase() ?? 'member') as WorkspaceRole;
          const status = (u.status === 'ACTIVE' ? 'active' : 'pending') as Status;
          return (
            <Stack key={u.id} direction="row" sx={{ alignItems: 'center', px: 1, py: 1.25,
              borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
              <Stack direction="row" spacing={1.25} sx={{ flex: 1, alignItems: 'center', minWidth: 0 }}>
                <FluxAvatar user={u} size={32}/>
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>{u.name}</Typography>
                    {u.id === currentUserId && (
                      <Typography variant="caption" color="text.disabled">(Vy)</Typography>
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, display: 'block' }}>{u.email}</Typography>
                </Box>
              </Stack>
              <Box sx={{ width: 90 }}>
                <RoleBadge role={role}/>
              </Box>
              <Box sx={{ width: 90 }}>
                <StatusBadgeLocal status={status}/>
              </Box>
              <Stack sx={{ width: 36, alignItems: 'flex-end' }}>
                {!readOnly && (
                  <RowMenu
                    userId={u.id}
                    currentRole={role}
                    onRoleChange={r => changeRole(u.id, r)}
                    onRemove={() => {}}
                  />
                )}
              </Stack>
            </Stack>
          );
        })}
      </SettingsCard>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)}/>
    </>
  );
}

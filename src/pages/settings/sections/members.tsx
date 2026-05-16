import { useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import FluxAvatar from '../../../components/flux-avatar';
import { SectionHeader, SettingsCard, FieldRow } from '../shared';
import { useProjectSettings, type ProjectRoleId } from '../../../store/project-settings-store';
import { useProjectMembersRes } from '../../../hooks/useProjectSettingsResources';
import { useTeamMembers } from '../../../hooks/useTeam';
import type { ProjectDto } from '../../../api/types';
import type { ProjectMemberDto } from '../../../api/project-settings';
import { PlusIcon, CloseIcon } from '../../../components/icons/icons';

const ROLE_OPTIONS: { id: ProjectRoleId; label: string; hint: string }[] = [
  { id: 'project_admin', label: 'Project admin', hint: 'Vše včetně settings a smazání projektu.' },
  { id: 'contributor',   label: 'Contributor',   hint: 'Vytvářet a upravovat tasky, vést sprint.' },
  { id: 'viewer',        label: 'Viewer',        hint: 'Pouze čtení.' },
];

export function MembersSection({ project, readOnly }: { project: ProjectDto; readOnly: boolean }) {
  const { settings, update } = useProjectSettings(project.key);
  const members = useProjectMembersRes(project.key);
  const { data: workspaceMembers = [] } = useTeamMembers();
  const [pickerUserId, setPickerUserId] = useState('');
  const [pickerRole, setPickerRole] = useState<ProjectRoleId>('contributor');
  const [guestEmail, setGuestEmail] = useState('');

  const byId = useMemo(() => new Map(workspaceMembers.map(u => [u.id, u])), [workspaceMembers]);
  const memberIds = new Set(members.data.map(m => m.userId));
  const availableToAdd = workspaceMembers.filter(u => !memberIds.has(u.id));

  const addMember = () => {
    if (!pickerUserId) return;
    const next: ProjectMemberDto = {
      userId: pickerUserId,
      role: pickerRole,
      addedAt: new Date().toISOString(),
    };
    members.replace([...members.data, next]);
    setPickerUserId('');
  };

  const removeMember = (userId: string) => {
    members.replace(members.data.filter(m => m.userId !== userId));
  };

  const changeRole = (userId: string, role: ProjectRoleId) => {
    members.replace(members.data.map(m => m.userId === userId ? { ...m, role } : m));
  };

  return (
    <Box>
      <SectionHeader
        title="Členové projektu"
        hint="Spravuj kdo má přístup k tomuto projektu a v jaké roli. Neovlivňuje workspace přístup."
      />

      <SettingsCard
        title="Členové"
        description={`${members.data.length} z ${workspaceMembers.length} členů workspace má přístup k projektu.`}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
          {members.data.length === 0 && (
            <Typography sx={{ fontSize: 14, color: 'text.secondary', py: 1.5, textAlign: 'center' }}>
              Zatím nikdo. Přidej členy z dropdownu níže.
            </Typography>
          )}
          {members.data.map(m => {
            const user = byId.get(m.userId);
            if (!user) return null;
            return (
              <Box key={m.userId} sx={{
                display: 'flex', alignItems: 'center', gap: 1.25, px: 1, py: 0.75,
                borderRadius: 1, '&:hover': { bgcolor: 'action.hover' },
              }}>
                <FluxAvatar user={user} size={26}/>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{user.name}</Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{user.email}</Typography>
                </Box>
                <TextField
                  size="small" select value={m.role}
                  onChange={e => changeRole(m.userId, e.target.value as ProjectRoleId)}
                  disabled={readOnly}
                  sx={{ width: 160 }}
                >
                  {ROLE_OPTIONS.map(r => (
                    <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>
                  ))}
                </TextField>
                <IconButton size="small" disabled={readOnly} onClick={() => removeMember(m.userId)}>
                  <CloseIcon/>
                </IconButton>
              </Box>
            );
          })}
        </Box>

        <Box sx={{
          display: 'flex', gap: 1, p: 1.25, borderRadius: 1,
          border: 1, borderColor: 'divider', borderStyle: 'dashed',
        }}>
          <TextField
            size="small" select value={pickerUserId}
            onChange={e => setPickerUserId(e.target.value)}
            disabled={readOnly || availableToAdd.length === 0}
            sx={{ flex: 1 }}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="" disabled>
              {availableToAdd.length ? 'Vybrat člena…' : 'Všichni už jsou členové'}
            </MenuItem>
            {availableToAdd.map(u => (
              <MenuItem key={u.id} value={u.id}>{u.name} · {u.email}</MenuItem>
            ))}
          </TextField>
          <TextField
            size="small" select value={pickerRole}
            onChange={e => setPickerRole(e.target.value as ProjectRoleId)}
            disabled={readOnly}
            sx={{ width: 160 }}
          >
            {ROLE_OPTIONS.map(r => (
              <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>
            ))}
          </TextField>
          <Button
            size="small" variant="contained" disabled={readOnly || !pickerUserId}
            onClick={addMember}
            startIcon={<PlusIcon/>}
          >
            Přidat
          </Button>
        </Box>
      </SettingsCard>

      <SettingsCard title="Výchozí přiřazení" description="Komu se přiřadí task, který nemá ručně zvoleného assignee.">
        <FieldRow label="Výchozí assignee">
          <TextField
            size="small" select value={settings.defaultAssigneeId ?? ''}
            onChange={e => update({ defaultAssigneeId: e.target.value || null })}
            disabled={readOnly}
            sx={{ width: 280 }}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="">— bez výchozího přiřazení —</MenuItem>
            {members.data.map(m => {
              const u = byId.get(m.userId);
              if (!u) return null;
              return <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>;
            })}
          </TextField>
        </FieldRow>
      </SettingsCard>

      <SettingsCard
        title="Hosté"
        description="Externí lidi s přístupem ke konkrétním taskům či sprintům. Účet se vytvoří jako pending."
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small" fullWidth placeholder="e-mail@externi.firma"
            value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
            disabled={readOnly}
          />
          <Button size="small" variant="outlined" disabled={readOnly || !guestEmail}
            onClick={() => setGuestEmail('')}>
            Pozvat
          </Button>
        </Box>
        <Box sx={{ mt: 1.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip size="small" label="anna@klient.cz · pending" variant="outlined"/>
          <Chip size="small" label="petr@dodavatel.io · pending" variant="outlined"/>
        </Box>
      </SettingsCard>
    </Box>
  );
}

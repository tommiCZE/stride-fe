import { Box, Checkbox, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { SectionHeader, SettingsCard } from '../shared';
import { useProjectSettings, type PermissionKey, type ProjectRoleId } from '../../../store/project-settings-store';
import type { ProjectDto } from '../../../api/types';

const ROLE_COLUMNS: { id: ProjectRoleId; label: string }[] = [
  { id: 'project_admin', label: 'Admin' },
  { id: 'contributor',   label: 'Contributor' },
  { id: 'viewer',        label: 'Viewer' },
];

const PERMISSION_ROWS: { id: PermissionKey; label: string; hint: string; group: string }[] = [
  { id: 'task.edit',          group: 'Tasky',     label: 'Upravit task',          hint: 'Měnit titul, popis, status, priority, labels.' },
  { id: 'task.delete',        group: 'Tasky',     label: 'Smazat task',           hint: 'Nevratné smazání včetně podtasků.' },
  { id: 'comment.delete',     group: 'Tasky',     label: 'Smazat komentář',       hint: 'Smazat cizí komentáře.' },
  { id: 'sprint.manage',      group: 'Plánování', label: 'Spravovat sprinty',     hint: 'Vytvořit, startovat, zavřít sprint.' },
  { id: 'settings.manage',    group: 'Projekt',   label: 'Spravovat nastavení',   hint: 'Přístup do této sekce.' },
  { id: 'member.manage',      group: 'Projekt',   label: 'Spravovat členy',       hint: 'Přidat / odebrat / měnit role.' },
  { id: 'integration.manage', group: 'Projekt',   label: 'Spravovat integrace',   hint: 'Git, Slack, API klíče, webhooks.' },
];

export function PermissionsSection({ readOnly, project }: { project: ProjectDto; readOnly: boolean }) {
  const { settings, update } = useProjectSettings(project.key);

  const toggle = (role: ProjectRoleId, perm: PermissionKey) => {
    const next = {
      ...settings.permissions,
      [role]: { ...settings.permissions[role], [perm]: !settings.permissions[role][perm] },
    };
    update({ permissions: next });
  };

  const groups = Array.from(new Set(PERMISSION_ROWS.map(r => r.group)));

  return (
    <Box>
      <SectionHeader
        title="Oprávnění"
        hint="Detailní matice rolí a oprávnění v tomto projektu. Project admin má vždy plný přístup."
      />
      <SettingsCard
        title="Matice rolí"
        description="Zaškrtnutí povolí dané roli vykonat akci. Změny platí ihned po uložení."
      >
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: `minmax(0, 1fr) repeat(${ROLE_COLUMNS.length}, 110px)`,
          alignItems: 'center',
          rowGap: 0.25,
        }}>
          <Box/>
          {ROLE_COLUMNS.map(r => (
            <Typography key={r.id} sx={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.06em', textAlign: 'center', color: 'text.secondary',
            }}>{r.label}</Typography>
          ))}

          {groups.map(group => (
            <Box key={group} sx={{ display: 'contents' }}>
              <Box sx={{
                gridColumn: `1 / -1`, mt: 1.25, mb: 0.25, pl: 0.5,
                fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'text.disabled',
              }}>{group}</Box>
              {PERMISSION_ROWS.filter(r => r.group === group).map(row => (
                <Box key={row.id} sx={{ display: 'contents' }}>
                  <Box sx={{
                    py: 0.75, pr: 1, borderTop: 1, borderColor: 'divider',
                  }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 500 }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{row.hint}</Typography>
                  </Box>
                  {ROLE_COLUMNS.map(role => {
                    const locked = role.id === 'project_admin';
                    return (
                      <Box key={role.id} sx={{
                        display: 'flex', justifyContent: 'center',
                        borderTop: 1, borderColor: 'divider',
                        bgcolor: locked ? theme => alpha(theme.palette.primary.main, 0.04) : 'transparent',
                      }}>
                        <Checkbox
                          size="small"
                          checked={settings.permissions[role.id][row.id]}
                          onChange={() => toggle(role.id, row.id)}
                          disabled={readOnly || locked}
                        />
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </SettingsCard>

      <SettingsCard title="Co která role znamená">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>Project admin</Typography>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
              Plný přístup. Vidí danger zónu, fakturaci a audit log.
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>Contributor</Typography>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
              Pracuje s tasky a sprinty. Nemůže měnit settings nebo členy.
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>Viewer</Typography>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
              Pouze čtení. Vhodné pro stakeholdery a klienty.
            </Typography>
          </Box>
        </Box>
      </SettingsCard>
    </Box>
  );
}

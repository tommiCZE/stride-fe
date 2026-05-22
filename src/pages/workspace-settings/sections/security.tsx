import { useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Skeleton, Slider, Stack, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { SectionHeader, SettingsCard, FieldRow, ToggleRow } from '../../settings/shared';
import {
  useWorkspaceSecurity, useUpdateWorkspaceSecurity,
} from '../../../hooks/useWorkspaceSecurity';
import type { WorkspaceSecurityPolicyDto } from '../../../api/workspace-security';
import { useWorkspaceSettingsStore } from '../../../store/workspace-settings-store';
import { relativeTime } from './relative-time';

const EXPIRY_OPTIONS: { value: string; label: string }[] = [
  { value: '',    label: 'Nikdy' },
  { value: '30',  label: '30 dní' },
  { value: '60',  label: '60 dní' },
  { value: '90',  label: '90 dní' },
  { value: '180', label: '180 dní' },
];

export function WorkspaceSecuritySection({ readOnly }: { readOnly: boolean }) {
  const { data, isLoading } = useWorkspaceSecurity();
  const update = useUpdateWorkspaceSecurity();
  const [confirm2faOpen, setConfirm2faOpen] = useState(false);

  const sessions = useWorkspaceSettingsStore(s => s.sessions);
  const removeSession = useWorkspaceSettingsStore(s => s.removeSession);
  const removeAllOthers = useWorkspaceSettingsStore(s => s.removeAllOthers);
  const { enqueueSnackbar } = useSnackbar();

  if (isLoading || !data) {
    return (
      <Stack spacing={2} >
        <Skeleton variant="rounded" height={140}/>
        <Skeleton variant="rounded" height={120}/>
        <Skeleton variant="rounded" height={220}/>
        <Skeleton variant="rounded" height={220}/>
      </Stack>
    );
  }

  const patch = (p: Partial<WorkspaceSecurityPolicyDto>) => update.mutate(p);

  const handleConfirm2fa = () => {
    patch({ enforce2fa: true });
    setConfirm2faOpen(false);
  };

  const handleLogoutSession = (id: string) => {
    removeSession(id);
    enqueueSnackbar('Relace ukončena', { variant: 'success' });
  };

  const handleLogoutOthers = () => {
    removeAllOthers();
    enqueueSnackbar('Ostatní relace ukončeny', { variant: 'success' });
  };

  return (
    <>
      <SectionHeader hint="SSO, dvoufaktorová autentizace, politika hesel a relace pro celý workspace." />

      <SettingsCard title="Single Sign-On" description="Vynucená autentizace přes externí Identity Provider.">
        <ToggleRow
          label="SAML SSO"
          hint="Vyžaduje placený plán. Po zapnutí se přihlášení provede přes konfigurovaný IdP."
          checked={data.samlSsoEnabled}
          onChange={() => {}}
          disabled
        />
        <ToggleRow
          label="Google Workspace SSO"
          hint="Vynutit přihlášení přes účet z propojené Google Workspace domény."
          checked={data.googleSsoEnabled}
          onChange={v => patch({ googleSsoEnabled: v })}
          disabled={readOnly || update.isPending}
        />
      </SettingsCard>

      <SettingsCard title="Dvoufaktorová autentizace" description="Vyžadovat 2FA u všech členů workspace.">
        <ToggleRow
          label="Vynutit 2FA"
          hint="Členové bez nakonfigurovaného druhého faktoru budou při dalším přihlášení vyzváni k nastavení."
          checked={data.enforce2fa}
          onChange={v => {
            if (v) setConfirm2faOpen(true);
            else patch({ enforce2fa: false });
          }}
          disabled={readOnly || update.isPending}
        />
        <Typography sx={{ fontSize: '12px', color: 'text.disabled', pt: 1.5 }}>
          BE flag uložen; vynucení při loginu bude přidáno později.
        </Typography>
      </SettingsCard>

      <SettingsCard title="Politika hesel" description="Pravidla pro síla hesla a expiraci.">
        <FieldRow label="Minimální délka" hint={`Aktuálně: ${data.passwordMinLength} znaků`}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', width: 360 }}>
            <Slider
              size="small"
              value={data.passwordMinLength}
              min={8} max={32} step={1}
              onChangeCommitted={(_, v) => patch({ passwordMinLength: Array.isArray(v) ? v[0] : v })}
              disabled={readOnly || update.isPending}
              valueLabelDisplay="auto"
              marks={[{ value: 8, label: '8' }, { value: 16, label: '16' }, { value: 24, label: '24' }, { value: 32, label: '32' }]}
              sx={{ flex: 1 }}
            />
          </Stack>
        </FieldRow>
        <ToggleRow
          label="Vyžadovat velké písmeno"
          checked={data.passwordRequireUpper}
          onChange={v => patch({ passwordRequireUpper: v })}
          disabled={readOnly || update.isPending}
        />
        <ToggleRow
          label="Vyžadovat číslici"
          checked={data.passwordRequireDigit}
          onChange={v => patch({ passwordRequireDigit: v })}
          disabled={readOnly || update.isPending}
        />
        <ToggleRow
          label="Vyžadovat speciální znak"
          checked={data.passwordRequireSpecial}
          onChange={v => patch({ passwordRequireSpecial: v })}
          disabled={readOnly || update.isPending}
        />
        <FieldRow label="Platnost hesla" hint="Po této době budou členové vyzváni ke změně.">
          <TextField
            select size="small"
            value={data.passwordExpiryDays?.toString() ?? ''}
            onChange={e => {
              const v = e.target.value === '' ? null : Number(e.target.value);
              patch({ passwordExpiryDays: v });
            }}
            disabled={readOnly || update.isPending}
            sx={{ width: 180 }}
          >
            {EXPIRY_OPTIONS.map(o => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </TextField>
        </FieldRow>
      </SettingsCard>

      <SettingsCard
        title="Aktivní relace"
        description="Seznam zařízení, kde je workspace aktuálně přihlášen."
        action={sessions.filter(s => !s.isCurrent).length > 0 && (
          <Button size="small" variant="outlined" color="inherit" onClick={handleLogoutOthers}>
            Odhlásit všude jinde
          </Button>
        )}
      >
        {sessions.length === 0 ? (
          <Typography sx={{ fontSize: '13px', color: 'text.disabled', py: 1 }}>
            Žádná aktivní relace.
          </Typography>
        ) : sessions.map((s, idx) => (
          <Stack direction="row" spacing={2}
            key={s.id}
            sx={{
        alignItems: 'center', py: 1.25,
              borderBottom: idx === sessions.length - 1 ? 0 : 1, borderColor: 'divider' }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                  {s.device} · {s.browser}
                </Typography>
                {s.isCurrent && (
                  <Box sx={{
                    px: 0.75, py: 0.1, borderRadius: 0.6, fontSize: '11px', fontWeight: 600,
                    color: 'primary.main', bgcolor: theme => theme.palette.primary.main + '1f',
                  }}>Tato relace</Box>
                )}
              </Stack>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.25 }}>
                {s.location} · {s.ipMasked} · poslední aktivita {relativeTime(s.lastActive)}
              </Typography>
            </Box>
            {!s.isCurrent && (
              <Button size="small" variant="text" color="error"
                onClick={() => handleLogoutSession(s.id)}>
                Odhlásit
              </Button>
            )}
          </Stack>
        ))}
        <Alert severity="info" sx={{ mt: 1.5, fontSize: '12px' }}>
          Mock data — JWT je aktuálně stateless. Tracking relací bude přidán později.
        </Alert>
      </SettingsCard>

      <Dialog open={confirm2faOpen} onClose={() => setConfirm2faOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: '15px', fontWeight: 700 }}>Vynutit 2FA?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
            Všichni členové bez nakonfigurovaného druhého faktoru budou při dalším přihlášení
            vyzváni k nastavení. Aktuálně je vynucení pouze uloženo v konfiguraci — implementace
            v login flow přijde později.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button size="small" onClick={() => setConfirm2faOpen(false)}>Zrušit</Button>
          <Button size="small" variant="contained" onClick={handleConfirm2fa}>Vynutit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

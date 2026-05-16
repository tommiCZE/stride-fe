import { Typography } from '@mui/material';
import { SectionHeader, SettingsCard, ToggleRow } from '../../settings/shared';

export function WorkspaceSecuritySection({ readOnly }: { readOnly: boolean }) {
  const noop = () => {};
  return (
    <>
      <SectionHeader hint="SSO, dvoufaktorová autentizace a další bezpečnostní politika pro celý workspace." />

      <SettingsCard title="Single Sign-On" description="Vynucená autentizace přes externí Identity Provider.">
        <ToggleRow
          label="SAML SSO"
          hint="Vyžaduje placený plán. Po zapnutí se přihlášení provede přes konfigurovaný IdP."
          checked={false}
          onChange={noop}
          disabled
        />
        <ToggleRow
          label="Google Workspace SSO"
          hint="Vynutit přihlášení přes účet z propojené Google Workspace domény."
          checked={false}
          onChange={noop}
          disabled={readOnly}
        />
      </SettingsCard>

      <SettingsCard title="Dvoufaktorová autentizace" description="Vyžadovat 2FA u všech členů workspace.">
        <ToggleRow
          label="Vynutit 2FA"
          hint="Členové bez nakonfigurovaného druhého faktoru budou při dalším přihlášení vyzváni k nastavení."
          checked={false}
          onChange={noop}
          disabled={readOnly}
        />
        <Typography sx={{ fontSize: 13, color: 'text.disabled', pt: 1.5 }}>
          Detailní audit relací a politika hesel budou k dispozici v dalším updatu.
        </Typography>
      </SettingsCard>
    </>
  );
}

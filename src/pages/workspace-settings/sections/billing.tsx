import { Box, Typography } from '@mui/material';
import { SectionHeader, SettingsCard, FieldRow } from '../../settings/shared';

export function WorkspaceBillingSection() {
  return (
    <>
      <SectionHeader hint="Plán, fakturace a limity workspace." />

      <SettingsCard title="Aktuální plán" description="Free — do 10 členů a 3 aktivních projektů.">
        <FieldRow label="Plán">
          <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1, py: 0.4, borderRadius: 1,
            bgcolor: 'action.hover', fontWeight: 600 }}>Free</Box>
        </FieldRow>
        <FieldRow label="Členové" hint="Maximální počet přizvaných lidí na Free plánu.">
          <Typography sx={{ fontSize: 15 }}>8 / 10</Typography>
        </FieldRow>
        <FieldRow label="Projekty">
          <Typography sx={{ fontSize: 15 }}>3 / 3</Typography>
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Fakturační údaje" description="Údaje budou potřeba při přechodu na placený plán.">
        <Typography sx={{ fontSize: 14, color: 'text.disabled', py: 1 }}>
          Billing není zatím k dispozici — připravujeme.
        </Typography>
      </SettingsCard>
    </>
  );
}

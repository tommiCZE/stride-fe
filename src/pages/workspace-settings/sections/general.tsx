import { useState } from 'react';
import { Alert, Box, MenuItem, TextField, Typography } from '@mui/material';
import { SectionHeader, SettingsCard, FieldRow } from '../../settings/shared';

const TIMEZONES = [
  'Europe/Prague',
  'Europe/Berlin',
  'Europe/London',
  'America/New_York',
  'UTC',
];

const LANGUAGES: { value: string; label: string }[] = [
  { value: 'cs', label: 'Čeština' },
  { value: 'en', label: 'English' },
];

export function WorkspaceGeneralSection({ readOnly }: { readOnly: boolean }) {
  const [name, setName] = useState('Acme s.r.o.');
  const [slug, setSlug] = useState('acme');
  const [timezone, setTimezone] = useState('Europe/Prague');
  const [language, setLanguage] = useState('cs');

  return (
    <>
      <SectionHeader hint="Identita celého workspace. Tyto hodnoty vidí všichni členové a slouží jako default pro nově vytvořené projekty." />

      <SettingsCard title="Identita" description="Jméno, slug a logo workspace.">
        <FieldRow label="Název workspace" hint="Zobrazí se v sidebaru, na fakturách a v notifikacích.">
          <TextField
            size="small"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={readOnly}
            sx={{ width: 320 }}
          />
        </FieldRow>
        <FieldRow label="Slug" hint="Krátký identifikátor pro URL. Pouze malá písmena a pomlčky.">
          <TextField
            size="small"
            value={slug}
            onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            disabled={readOnly}
            sx={{ width: 220, '& .MuiOutlinedInput-input': { fontFamily: 'ui-monospace, monospace' } }}
            slotProps={{ input: { startAdornment: <Typography sx={{ color: 'text.disabled', mr: 0.5 }}>stride.app/</Typography> } }}
          />
        </FieldRow>
        <FieldRow label="Logo" hint="Volitelně. SVG nebo PNG, doporučeně 128 × 128.">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'primary.main',
              color: 'primary.contrastText', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700 }}>
              {name.slice(0, 1).toUpperCase()}
            </Box>
            <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>
              Upload zatím není k dispozici.
            </Typography>
          </Box>
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Regionální nastavení" description="Časové pásmo a výchozí jazyk pro nové členy.">
        <FieldRow label="Časové pásmo">
          <TextField
            select size="small" value={timezone}
            onChange={e => setTimezone(e.target.value)}
            disabled={readOnly}
            sx={{ width: 260 }}
          >
            {TIMEZONES.map(tz => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
          </TextField>
        </FieldRow>
        <FieldRow label="Výchozí jazyk">
          <TextField
            select size="small" value={language}
            onChange={e => setLanguage(e.target.value)}
            disabled={readOnly}
            sx={{ width: 200 }}
          >
            {LANGUAGES.map(l => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
          </TextField>
        </FieldRow>
      </SettingsCard>

      <Alert severity="info" sx={{ fontSize: 14 }}>
        Tyto hodnoty slouží jako default pro nové projekty. Jednotlivé projekty
        mohou jazyk a časové pásmo přepsat v Project settings → Obecné.
      </Alert>
    </>
  );
}

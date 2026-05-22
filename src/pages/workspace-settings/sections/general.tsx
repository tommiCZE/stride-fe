import { useState } from 'react';
import { Alert, Button, MenuItem, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { z } from 'zod';
import i18n from '../../../locales';
import { SectionHeader, SettingsCard, FieldRow } from '../../settings/shared';
import { useWorkspaceSettings, useUpdateWorkspaceSettings } from '../../../hooks/useWorkspaceSettings';

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

const schema = z.object({
  name: z.string().min(2, 'Min. 2 znaky').max(60, 'Max. 60 znaků'),
  slug: z.string().regex(/^[a-z0-9-]{2,40}$/, 'Pouze malá písmena, číslice a pomlčky (2–40)'),
  timezone: z.string().min(1),
  language: z.string().min(1),
});

type FormState = z.infer<typeof schema>;

export function WorkspaceGeneralSection({ readOnly }: { readOnly: boolean }) {
  const { data, isLoading } = useWorkspaceSettings();
  const updateMutation = useUpdateWorkspaceSettings();

  const [draft, setDraft] = useState<FormState | null>(null);

  if (data && !draft) {
    setDraft({
      name: data.name, slug: data.slug,
      timezone: data.timezone, language: data.language,
    });
  }

  if (isLoading || !draft || !data) {
    return (
      <Stack spacing={2} >
        <Skeleton variant="rounded" height={180}/>
        <Skeleton variant="rounded" height={140}/>
      </Stack>
    );
  }

  const validation = schema.safeParse(draft);
  const errors = validation.success ? {} as Partial<Record<keyof FormState, string>>
    : Object.fromEntries(
        validation.error.issues.map(i => [i.path[0], i.message]),
      ) as Partial<Record<keyof FormState, string>>;

  const hasChanges =
    draft.name !== data.name
    || draft.slug !== data.slug
    || draft.timezone !== data.timezone
    || draft.language !== data.language;

  const canSave = !readOnly && hasChanges && validation.success && !updateMutation.isPending;

  const handleSave = () => {
    if (!validation.success) return;
    const patch: Partial<FormState> = {};
    if (draft.name !== data.name) patch.name = draft.name;
    if (draft.slug !== data.slug) patch.slug = draft.slug;
    if (draft.timezone !== data.timezone) patch.timezone = draft.timezone;
    if (draft.language !== data.language) {
      patch.language = draft.language;
      i18n.changeLanguage(draft.language);
    }
    updateMutation.mutate(patch);
  };

  const handleReset = () => setDraft({
    name: data.name, slug: data.slug,
    timezone: data.timezone, language: data.language,
  });

  return (
    <>
      <SectionHeader hint="Identita celého workspace. Tyto hodnoty vidí všichni členové a slouží jako default pro nově vytvořené projekty." />

      <SettingsCard
        title="Identita"
        description="Jméno, slug a logo workspace."
        action={
          <Stack direction="row" spacing={1} >
            {hasChanges && (
              <Button size="small" variant="text" onClick={handleReset} disabled={updateMutation.isPending}>
                Zrušit
              </Button>
            )}
            <Button
              size="small" variant="contained"
              disabled={!canSave}
              onClick={handleSave}
            >
              {updateMutation.isPending ? 'Ukládám…' : 'Uložit'}
            </Button>
          </Stack>
        }
      >
        <FieldRow label="Název workspace" hint="Zobrazí se v sidebaru, na fakturách a v notifikacích.">
          <TextField
            size="small"
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
            disabled={readOnly}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ width: 320 }}
          />
        </FieldRow>
        <FieldRow label="Slug" hint="Krátký identifikátor pro URL. Pouze malá písmena, číslice a pomlčky.">
          <TextField
            size="small"
            value={draft.slug}
            onChange={e => setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
            disabled={readOnly}
            error={!!errors.slug}
            helperText={errors.slug}
            sx={{ width: 260, '& .MuiOutlinedInput-input': { fontFamily: 'ui-monospace, monospace' } }}
            slotProps={{ input: { startAdornment: <Typography sx={{ color: 'text.disabled', mr: 0.5 }}>stride.app/</Typography> } }}
          />
        </FieldRow>
        <FieldRow label="Logo" hint="Volitelně. SVG nebo PNG, doporučeně 128 × 128.">
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <Stack direction="row" sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'primary.main',
              color: 'primary.contrastText', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700 }}>
              {draft.name.slice(0, 1).toUpperCase()}
            </Stack>
            <Typography sx={{ fontSize: '13px', color: 'text.disabled' }}>
              Upload zatím není k dispozici.
            </Typography>
          </Stack>
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Regionální nastavení" description="Časové pásmo a výchozí jazyk pro nové členy.">
        <FieldRow label="Časové pásmo">
          <TextField
            select size="small" value={draft.timezone}
            onChange={e => setDraft({ ...draft, timezone: e.target.value })}
            disabled={readOnly}
            sx={{ width: 260 }}
          >
            {TIMEZONES.map(tz => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
          </TextField>
        </FieldRow>
        <FieldRow label="Výchozí jazyk">
          <TextField
            select size="small" value={draft.language}
            onChange={e => setDraft({ ...draft, language: e.target.value })}
            disabled={readOnly}
            sx={{ width: 200 }}
          >
            {LANGUAGES.map(l => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
          </TextField>
        </FieldRow>
      </SettingsCard>

      <Alert severity="info" sx={{ fontSize: '14px' }}>
        Tyto hodnoty slouží jako default pro nové projekty. Jednotlivé projekty
        mohou jazyk a časové pásmo přepsat v Project settings → Obecné.
      </Alert>
    </>
  );
}

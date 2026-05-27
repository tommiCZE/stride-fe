import { Box, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import InlineEdit from '../../../components/inline-edit';
import { useUpdateRelease } from '../../../hooks/useReleases';
import type { ReleaseDto } from '../../../api/types';

interface Props {
  release: ReleaseDto;
}

function MetaRow({
  label, children,
}: { label: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={2} sx={{
      alignItems: 'flex-start', py: 0.75,
      borderBottom: 1, borderColor: 'divider',
      '&:last-child': { borderBottom: 0 },
    }}>
      <Typography sx={{
        width: 110, flexShrink: 0,
        fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
        textTransform: 'uppercase', color: 'text.secondary',
        pt: 1,
      }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Stack>
  );
}

function formatDate(iso: string | null): string {
  return iso ? dayjs(iso).format('D. M. YYYY') : '';
}

export default function ReleaseDetailMeta({ release }: Props) {
  const updateRelease = useUpdateRelease();

  const saveGoal = (next: string) =>
    updateRelease.mutate({ id: release.id, body: { goal: next || null } });

  const saveDescription = (next: string) =>
    updateRelease.mutate({ id: release.id, body: { description: next || null } });

  const timing = [
    release.startDate ? `Start ${formatDate(release.startDate)}` : null,
    release.releaseDate ? `Vydání ${formatDate(release.releaseDate)}` : null,
  ].filter(Boolean).join(' · ') || '—';

  return (
    <Box sx={{
      mx: { xs: 2, md: 4 }, mb: 3,
      border: 1, borderColor: 'divider', borderRadius: 1.5,
      px: 2.5, py: 1,
    }}>
      <MetaRow label="Cíl">
        <InlineEdit
          value={release.goal ?? ''}
          onSave={saveGoal}
          placeholder="Přidej cíl této verze…"
          multiline
        />
      </MetaRow>
      <MetaRow label="Popis">
        <InlineEdit
          value={release.description ?? ''}
          onSave={saveDescription}
          placeholder="Doplň popis…"
          multiline
        />
      </MetaRow>
      <MetaRow label="Časování">
        <Typography sx={{ fontSize: 13, color: 'text.primary', py: 0.5 }}>
          {timing}
        </Typography>
      </MetaRow>
      <MetaRow label="Vytvořeno">
        <Typography sx={{ fontSize: 13, color: 'text.secondary', py: 0.5 }}>
          {formatDate(release.createdAt)}
        </Typography>
      </MetaRow>
    </Box>
  );
}

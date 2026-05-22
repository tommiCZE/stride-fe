import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useTeamMembers } from '../../../hooks/useTeam';
import type { AuditSearchParams } from '../../../api/workspace-audit';

const ACTION_GROUPS: { group: string; actions: { value: string; label: string }[] }[] = [
  { group: 'Členové', actions: [
    { value: 'member.invite', label: 'Pozvánka člena' },
    { value: 'member.update', label: 'Změna člena' },
  ]},
  { group: 'Integrace', actions: [
    { value: 'integration.connect',    label: 'Připojení integrace' },
    { value: 'integration.disconnect', label: 'Odpojení integrace' },
  ]},
  { group: 'Zabezpečení', actions: [
    { value: 'security.update', label: 'Změna politiky' },
  ]},
  { group: 'Obecné', actions: [
    { value: 'settings.update', label: 'Změna nastavení' },
  ]},
];

interface FilterValues {
  actorIds: string[];
  action: string;
  fromDate: string;     // YYYY-MM-DD
  toDate: string;       // YYYY-MM-DD
  q: string;
}

const EMPTY: FilterValues = {
  actorIds: [], action: '', fromDate: '', toDate: '', q: '',
};

interface Props {
  value: AuditSearchParams;
  onChange: (next: AuditSearchParams) => void;
}

function searchParamsToFilters(p: AuditSearchParams): FilterValues {
  return {
    actorIds: p.actorIds ?? [],
    action: p.action ?? '',
    fromDate: p.from ? p.from.slice(0, 10) : '',
    toDate: p.to ? p.to.slice(0, 10) : '',
    q: p.q ?? '',
  };
}

function filtersToSearchParams(f: FilterValues): AuditSearchParams {
  const out: AuditSearchParams = {};
  if (f.actorIds.length > 0) out.actorIds = f.actorIds;
  if (f.action) out.action = f.action;
  if (f.fromDate) out.from = new Date(f.fromDate + 'T00:00:00').toISOString();
  if (f.toDate) out.to = new Date(f.toDate + 'T23:59:59').toISOString();
  if (f.q.trim()) out.q = f.q.trim();
  return out;
}

export function AuditFilters({ value, onChange }: Props) {
  const { data: members = [] } = useTeamMembers();
  const [local, setLocal] = useState<FilterValues>(() => searchParamsToFilters(value));

  // Debounce search text
  useEffect(() => {
    const sync = filtersToSearchParams(local);
    const handle = setTimeout(() => {
      onChange(sync);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  const isFiltered = useMemo(
    () => local.actorIds.length > 0 || !!local.action || !!local.fromDate || !!local.toDate || !!local.q,
    [local],
  );

  const selectedActors = members.filter(m => local.actorIds.includes(m.id));

  return (
    <Stack direction="row" spacing={1.25} sx={{
        flexWrap: 'wrap', alignItems: 'flex-start',
      py: 1.5, px: 0.25, mb: 1.5,
      borderBottom: 1, borderColor: 'divider' }}>
      <Autocomplete
        multiple size="small"
        options={members}
        value={selectedActors}
        onChange={(_, vals) => setLocal({ ...local, actorIds: vals.map(v => v.id) })}
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        sx={{ minWidth: 260, flex: '0 1 320px' }}
        renderInput={(params) => <TextField {...params} label="Aktor" placeholder="Všichni"/>}
        slotProps={{ chip: { size: 'small' } }}
      />

      <TextField
        select size="small" label="Akce"
        value={local.action}
        onChange={e => setLocal({ ...local, action: e.target.value })}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="">Všechny akce</MenuItem>
        {ACTION_GROUPS.flatMap(g => [
          <MenuItem key={g.group} disabled sx={{ opacity: 0.6, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
            {g.group}
          </MenuItem>,
          ...g.actions.map(a => (
            <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>
          )),
        ])}
      </TextField>

      <TextField
        size="small" label="Od"
        type="date"
        value={local.fromDate}
        onChange={e => setLocal({ ...local, fromDate: e.target.value })}
        sx={{ width: 160 }}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <TextField
        size="small" label="Do"
        type="date"
        value={local.toDate}
        onChange={e => setLocal({ ...local, toDate: e.target.value })}
        sx={{ width: 160 }}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <TextField
        size="small" label="Hledat v textu"
        value={local.q}
        onChange={e => setLocal({ ...local, q: e.target.value })}
        sx={{ minWidth: 200, flex: '1 1 200px' }}
      />

      {isFiltered && (
        <Button size="small" variant="text" onClick={() => setLocal(EMPTY)} sx={{ alignSelf: 'center' }}>
          <Typography sx={{ fontSize: '13px' }}>Reset filtrů</Typography>
        </Button>
      )}
    </Stack>
  );
}

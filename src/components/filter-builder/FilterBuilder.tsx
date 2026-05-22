import { useMemo } from 'react';
import { Autocomplete, Box, Chip, IconButton, MenuItem, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  type FilterCombinator,
  type FilterField,
  type FilterGroup,
  type FilterOp,
  type FilterRule,
  isGroup,
  newRule,
} from './filter-evaluator';
import { BOARD_STATUSES } from '../../constants/statuses';
import { PRIORITIES } from '../../constants/priorities';
import { TASK_TYPES } from '../../constants/taskTypes';
import { CloseIcon, PlusIcon } from '../icons/icons';
import { useTeamMembers } from '../../hooks/useTeam';

interface FilterBuilderProps {
  value: FilterGroup;
  onChange: (next: FilterGroup) => void;
}

interface FieldOption {
  id: string;
  label: string;
}

const FIELD_LABELS: Record<FilterField, string> = {
  status: 'Status',
  priority: 'Priorita',
  assignee: 'Přiřazeno',
  label: 'Štítek',
  type: 'Typ',
};

const FIELDS: { value: FilterField; label: string }[] = [
  { value: 'status', label: FIELD_LABELS.status },
  { value: 'priority', label: FIELD_LABELS.priority },
  { value: 'assignee', label: FIELD_LABELS.assignee },
  { value: 'label', label: FIELD_LABELS.label },
  { value: 'type', label: FIELD_LABELS.type },
];

const OPS: { value: FilterOp; label: string }[] = [
  { value: 'is', label: 'je' },
  { value: 'is not', label: 'není' },
  { value: 'in', label: 'patří mezi' },
];

export default function FilterBuilder({ value, onChange }: FilterBuilderProps) {
  const { data: teamMembers = [] } = useTeamMembers();

  const optionsByField = useMemo<Record<FilterField, FieldOption[]>>(() => ({
    status: BOARD_STATUSES.map(s => ({ id: s.id, label: s.name })),
    priority: PRIORITIES.map(p => ({ id: p.id, label: p.name })),
    assignee: teamMembers.map(m => ({ id: m.id, label: m.name })),
    label: [],
    type: TASK_TYPES.map(t => ({ id: t.id, label: t.name })),
  }), [teamMembers]);

  const handleCombinatorChange = (
    _e: React.MouseEvent<HTMLElement>,
    next: FilterCombinator | null,
  ) => {
    if (!next) return;
    onChange({ ...value, combinator: next });
  };

  const updateRule = (ruleId: string, patch: Partial<FilterRule>) => {
    onChange({
      ...value,
      rules: value.rules.map(item => {
        if (isGroup(item)) return item;
        if (item.id !== ruleId) return item;
        return { ...item, ...patch };
      }),
    });
  };

  const removeRule = (ruleId: string) => {
    onChange({
      ...value,
      rules: value.rules.filter(item => isGroup(item) || item.id !== ruleId),
    });
  };

  const addRule = () => {
    onChange({
      ...value,
      rules: [...value.rules, newRule('status')],
    });
  };

  const leafRules = value.rules.filter((r): r is FilterRule => !isGroup(r));

  return (
    <Stack spacing={1.5} >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
          Kombinátor:
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={value.combinator}
          onChange={handleCombinatorChange}
          sx={{ '& .MuiToggleButton-root': { px: 1.5, py: 0.25, fontSize: '14px' } }}
        >
          <ToggleButton value="AND">AND</ToggleButton>
          <ToggleButton value="OR">OR</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: '13px', color: 'text.disabled' }}>
          {leafRules.length} {leafRules.length === 1 ? 'pravidlo' : 'pravidel'}
        </Typography>
      </Stack>

      <Stack spacing={1} >
        {leafRules.length === 0 && (
          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'action.hover', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
              Zatím žádná pravidla. Přidej první pomocí tlačítka níže.
            </Typography>
          </Box>
        )}

        {leafRules.map((rule, idx) => (
          <RuleRow
            key={rule.id}
            rule={rule}
            isFirst={idx === 0}
            combinator={value.combinator}
            options={optionsByField[rule.field]}
            onChange={patch => updateRule(rule.id, patch)}
            onRemove={() => removeRule(rule.id)}
          />
        ))}
      </Stack>

      <Box>
        <Chip
          icon={<PlusIcon />}
          label="Přidat pravidlo"
          size="small"
          onClick={addRule}
          sx={{ fontSize: '14px', cursor: 'pointer' }}
        />
      </Box>
    </Stack>
  );
}

interface RuleRowProps {
  rule: FilterRule;
  isFirst: boolean;
  combinator: FilterCombinator;
  options: FieldOption[];
  onChange: (patch: Partial<FilterRule>) => void;
  onRemove: () => void;
}

function RuleRow({ rule, isFirst, combinator, options, onChange, onRemove }: RuleRowProps) {
  const handleFieldChange = (e: SelectChangeEvent) => {
    const nextField = e.target.value as FilterField;
    // Reset value when field changes — values are field-specific.
    onChange({ field: nextField, value: rule.op === 'in' ? [] : '' });
  };

  const handleOpChange = (e: SelectChangeEvent) => {
    const nextOp = e.target.value as FilterOp;
    const isMulti = nextOp === 'in';
    const wasMulti = rule.op === 'in';
    let nextValue: string | string[] = rule.value;
    if (isMulti && !wasMulti) {
      nextValue = rule.value ? [rule.value as string] : [];
    } else if (!isMulti && wasMulti) {
      const arr = rule.value as string[];
      nextValue = arr[0] ?? '';
    }
    onChange({ op: nextOp, value: nextValue });
  };

  const isMulti = rule.op === 'in';

  return (
    <Stack direction="row" spacing={1}
      sx={{
        alignItems: 'center',
        p: 1,
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.default' }}
    >
      <Box sx={{ width: 44, flexShrink: 0 }}>
        <Typography
          sx={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'text.secondary',
            textAlign: 'center',
          }}
        >
          {isFirst ? 'KDE' : combinator}
        </Typography>
      </Box>

      <Select
        size="small"
        value={rule.field}
        onChange={handleFieldChange}
        sx={{ minWidth: 120, fontSize: '14px', '& .MuiSelect-select': { py: 0.5 } }}
      >
        {FIELDS.map(f => (
          <MenuItem key={f.value} value={f.value} sx={{ fontSize: '14px' }}>
            {f.label}
          </MenuItem>
        ))}
      </Select>

      <Select
        size="small"
        value={rule.op}
        onChange={handleOpChange}
        sx={{ minWidth: 110, fontSize: '14px', '& .MuiSelect-select': { py: 0.5 } }}
      >
        {OPS.map(o => (
          <MenuItem key={o.value} value={o.value} sx={{ fontSize: '14px' }}>
            {o.label}
          </MenuItem>
        ))}
      </Select>

      <Box sx={{ flex: 1, minWidth: 180 }}>
        {isMulti ? (
          <Autocomplete
            multiple
            size="small"
            disableCloseOnSelect
            options={options}
            value={options.filter(o => (rule.value as string[]).includes(o.id))}
            onChange={(_e, next) => onChange({ value: next.map(n => n.id) })}
            getOptionLabel={o => o.label}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={(rule.value as string[]).length === 0 ? 'Vyber hodnoty…' : ''}
                sx={{ '& .MuiInputBase-root': { fontSize: '14px', py: 0.25 } }}
              />
            )}
          />
        ) : (
          <Autocomplete
            size="small"
            options={options}
            value={options.find(o => o.id === rule.value) ?? null}
            onChange={(_e, next) => onChange({ value: next?.id ?? '' })}
            getOptionLabel={o => o.label}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Vyber hodnotu…"
                sx={{ '& .MuiInputBase-root': { fontSize: '14px', py: 0.25 } }}
              />
            )}
          />
        )}
      </Box>

      <IconButton size="small" onClick={onRemove} aria-label="Odebrat pravidlo">
        <CloseIcon />
      </IconButton>
    </Stack>
  );
}

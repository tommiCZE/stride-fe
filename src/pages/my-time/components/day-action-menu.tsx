import { useState } from 'react';
import {
  Button, Divider, Menu, MenuItem, Stack, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import type { DayDto, DayType } from '../../../api/types';
import { useUpsertDay } from '../../../hooks/useDays';
import { DAY_TYPE_COLOR, DAY_TYPE_ICON, DAY_TYPE_LABEL } from '../lib/week-math';

interface Props {
  userId: string;
  weekIso: string;
  dateIso: string;
  day: DayDto | undefined;
  hasEntries: boolean;
  onOpenEditor: () => void;
}

const TYPES: DayType[] = ['PTO', 'SICK', 'HOLIDAY', 'PERSONAL'];

export default function DayActionMenu({ userId, weekIso, dateIso, day, hasEntries, onOpenEditor }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const upsertDayMut = useUpsertDay(userId, weekIso);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = !!anchor;

  const hasType = !!day?.type;
  const closed = !!day?.closed;
  const label = closed ? 'Otevřít' : hasType ? 'Změnit ▾' : (hasEntries ? 'Otevřít' : 'Označit ▾');

  const setType = async (type: DayType) => {
    setAnchor(null);
    if (hasEntries) {
      enqueueSnackbar(
        `Den má záznamy. Před označením je smaž v editoru.`,
        { variant: 'warning' },
      );
      onOpenEditor();
      return;
    }
    try {
      await upsertDayMut.mutateAsync({ date: dateIso, patch: { type } });
      enqueueSnackbar(`${DAY_TYPE_ICON[type]} ${DAY_TYPE_LABEL[type]} označeno`, { variant: 'success' });
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Označení selhalo';
      enqueueSnackbar(detail, { variant: 'error' });
    }
  };

  const clearType = async () => {
    setAnchor(null);
    try {
      await upsertDayMut.mutateAsync({ date: dateIso, patch: { clearType: true } });
      enqueueSnackbar('Značka odebrána', { variant: 'success' });
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Selhalo';
      enqueueSnackbar(detail, { variant: 'error' });
    }
  };

  // Day with entries or any worklog content → simply open the editor.
  if (hasEntries || closed) {
    return (
      <Button size="small" variant="text" onClick={onOpenEditor}>
        {label}
      </Button>
    );
  }

  return (
    <>
      <Button
        size="small"
        variant="text"
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
      </Button>
      <Menu anchorEl={anchor} open={open} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { setAnchor(null); onOpenEditor(); }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2">+ Doplnit záznam</Typography>
          </Stack>
        </MenuItem>
        <Divider/>
        {TYPES.map(type => (
          <MenuItem key={type} onClick={() => setType(type)}
            sx={{ color: DAY_TYPE_COLOR[type], fontWeight: 600 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography component="span" variant="body2">
                {DAY_TYPE_ICON[type]} {DAY_TYPE_LABEL[type]}
              </Typography>
            </Stack>
          </MenuItem>
        ))}
        {hasType && (
          <>
            <Divider/>
            <MenuItem onClick={clearType}>
              <Typography variant="body2" color="error.main">⨯ Odebrat značku</Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}

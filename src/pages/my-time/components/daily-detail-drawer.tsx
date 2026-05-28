import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Drawer, IconButton, InputBase, Stack, Typography,
} from '@mui/material';
import { useTheme, type Theme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { useAuthStore } from '../../../store/auth-store';
import { useProjects } from '../../../hooks/useProjects';
import { useAllProjectTasks } from '../../../hooks/useTasks';
import { useUserWorklogs, useCreateUserWorklog, useUpdateUserWorklog, useDeleteUserWorklog } from '../../../hooks/useWorklogs';
import { useDays, useUpsertDay } from '../../../hooks/useDays';
import { useRunningTimer } from '../../../hooks/useTimer';
import {
  addMinutesToHM, fmtHM, isoLocal, isoToday, startOfWeek,
} from '../../../lib/time';
import {
  DAILY_GOAL_MIN, DAY_TYPE_COLOR, DAY_TYPE_ICON, DAY_TYPE_LABEL, statusForDay,
} from '../lib/week-math';
import EntryRow, { type EntryDraft } from './entry-row';
import DayTimeline from './day-timeline';
import DayDistributionBar from './day-distribution-bar';
import type { WorklogDto } from '../../../api/types';

const WEEKDAYS_LONG = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];

function toDraft(w: WorklogDto): EntryDraft {
  return {
    id: w.id,
    taskId: w.taskId,
    mode: w.mode,
    start: w.start ? w.start.slice(0, 5) : null,
    end: w.end ? w.end.slice(0, 5) : null,
    minutes: w.minutes,
    note: w.note ?? w.comment ?? '',
    kind: w.kind,
    _state: 'unchanged',
  };
}

function tempId(): string {
  return 'temp-' + Math.random().toString(36).slice(2, 10);
}

export default function DailyDetailDrawer() {
  const userId = useAuthStore(s => s.userId);
  const [searchParams, setSearchParams] = useSearchParams();
  const dayParam = searchParams.get('day');
  const open = !!dayParam && !!userId;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => {/* handled inside body */}}
      keepMounted={false}
      slotProps={{ paper: { sx: { width: { xs: '100vw', sm: 720 }, maxWidth: '100vw' } } }}
    >
      {open && (
        <DrawerBody
          key={dayParam}
          userId={userId!}
          dateIso={dayParam!}
          onClose={() => {
            const next = new URLSearchParams(searchParams);
            next.delete('day');
            setSearchParams(next, { replace: false });
          }}
        />
      )}
    </Drawer>
  );
}

function DrawerBody({ userId, dateIso, onClose }: { userId: string; dateIso: string; onClose: () => void }) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const weekIso = useMemo(() => startOfWeek(dateIso).format('YYYY-MM-DD'), [dateIso]);
  const { data: worklogs = [] } = useUserWorklogs(userId, weekIso);
  const { data: daysData = [] } = useDays(userId, weekIso);
  const { data: projects = [] } = useProjects();
  const projectIds = useMemo(() => projects.map(p => p.id), [projects]);
  const { data: tasks = [] } = useAllProjectTasks(projectIds);
  const { data: runningTimer } = useRunningTimer();

  const createMut = useCreateUserWorklog(userId, weekIso);
  const updateMut = useUpdateUserWorklog(userId, weekIso);
  const deleteMut = useDeleteUserWorklog(userId, weekIso);
  const upsertDayMut = useUpsertDay(userId, weekIso);

  const day = daysData.find(d => d.date === dateIso);
  const closed = !!day?.closed;
  const dayTyped = !!day?.type;
  const disabled = closed || dayTyped;

  const initialDrafts = useMemo(
    () => worklogs.filter(w => (w.date ?? w.loggedAt) === dateIso).map(toDraft),
    [worklogs, dateIso],
  );
  const initialDayNote = day?.note ?? '';

  const [drafts, setDrafts] = useState<EntryDraft[]>(initialDrafts);
  const [dayNote, setDayNote] = useState(initialDayNote);
  const [confirmClose, setConfirmClose] = useState(false);
  const [pristineDayNote] = useState(initialDayNote);

  const dirty = useMemo(() => {
    if (dayNote !== pristineDayNote) return true;
    return drafts.some(d => d._state !== 'unchanged');
  }, [drafts, dayNote, pristineDayNote]);

  const totalMin = drafts.filter(d => d._state !== 'deleted').reduce((s, d) => s + d.minutes, 0);
  const hasDurationEntry = drafts.some(d => d._state !== 'deleted' && d.mode === 'DURATION');
  const isToday = dateIso === isoToday();
  const nowHM = isToday ? dayjs().format('HH:mm') : null;
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    if (!runningTimer) return;
    const id = setInterval(() => setNowTick(Date.now()), 60000);
    return () => clearInterval(id);
  }, [runningTimer]);
  const liveExtraMin = runningTimer && isoLocal(runningTimer.startedAt) === dateIso
    ? Math.max(0, Math.round((nowTick - new Date(runningTimer.startedAt).getTime()) / 60000))
    : 0;

  const status = statusForDay({
    dateIso, todayIso: isoToday(), totalMin: totalMin + liveExtraMin, day,
  });

  const updateDraft = (id: string, patch: Partial<EntryDraft>) => {
    setDrafts(prev => prev.map(d => {
      if (d.id !== id) return d;
      const next = { ...d, ...patch };
      if (d._state === 'unchanged') next._state = 'modified';
      return next;
    }));
  };

  const deleteDraft = (id: string) => {
    setDrafts(prev => prev
      .map(d => d.id === id ? { ...d, _state: 'deleted' as const } : d)
      .filter(d => !(d.id.startsWith('temp-') && d._state === 'deleted')),
    );
  };

  const addEntry = () => {
    const lastEnd = drafts
      .filter(d => d._state !== 'deleted' && d.mode === 'TIME' && d.end)
      .map(d => d.end!)
      .sort()
      .pop() ?? '09:00';
    const start = lastEnd;
    const end = addMinutesToHM(start, 30) ?? start;
    setDrafts(prev => [...prev, {
      id: tempId(),
      taskId: null,
      mode: 'TIME',
      start,
      end,
      minutes: 30,
      note: '',
      kind: 'MEETING',
      _state: 'created',
    }]);
  };

  const handleSave = async () => {
    if (totalMin > 24 * 60) {
      enqueueSnackbar('Den má víc než 24h. Uprav záznamy.', { variant: 'error' });
      return;
    }
    if (hasOverlappingTimeEntries(drafts)) {
      enqueueSnackbar('Některé časové intervaly se překrývají — zkontroluj.', { variant: 'warning' });
    }
    try {
      const creates = drafts.filter(d => d._state === 'created');
      const modifies = drafts.filter(d => d._state === 'modified');
      const deletes = drafts.filter(d => d._state === 'deleted' && !d.id.startsWith('temp-'));

      await Promise.all([
        ...creates.map(d => createMut.mutateAsync({
          taskId: d.taskId,
          minutes: d.minutes,
          loggedAt: dateIso,
          start: d.mode === 'TIME' ? d.start : null,
          end: d.mode === 'TIME' ? d.end : null,
          note: d.note || null,
          kind: d.kind,
          mode: d.mode,
        })),
        ...modifies.map(d => updateMut.mutateAsync({
          id: d.id,
          patch: {
            taskId: d.taskId,
            clearTaskId: d.taskId === null,
            minutes: d.minutes,
            loggedAt: dateIso,
            start: d.mode === 'TIME' ? d.start : null,
            end: d.mode === 'TIME' ? d.end : null,
            note: d.note || null,
            kind: d.kind,
            mode: d.mode,
          },
        })),
        ...deletes.map(d => deleteMut.mutateAsync(d.id)),
      ]);
      if (dayNote !== initialDayNote) {
        await upsertDayMut.mutateAsync({ date: dateIso, patch: { note: dayNote || null } });
      }
      enqueueSnackbar('Záznamy uloženy', { variant: 'success' });
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Uložení selhalo';
      enqueueSnackbar(detail, { variant: 'error' });
    }
  };

  const handleCloseDay = async () => {
    if (totalMin === 0) {
      enqueueSnackbar('Prázdný den nelze uzavřít', { variant: 'warning' });
      return;
    }
    if (dirty) await handleSave();
    try {
      await upsertDayMut.mutateAsync({ date: dateIso, patch: { closed: true } });
      enqueueSnackbar('Den uzavřen', { variant: 'success' });
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Uzavření selhalo';
      enqueueSnackbar(detail, { variant: 'error' });
    }
  };

  const handleReopenDay = async () => {
    try {
      await upsertDayMut.mutateAsync({ date: dateIso, patch: { closed: false } });
      enqueueSnackbar('Den znovu otevřen', { variant: 'success' });
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Otevření selhalo';
      enqueueSnackbar(detail, { variant: 'error' });
    }
  };

  const handleClose = () => {
    if (dirty) setConfirmClose(true);
    else onClose();
  };

  return (
    <Stack sx={{ height: '100%' }}>
      <Stack direction="row" spacing={1.5}
        sx={{ p: 2, alignItems: 'baseline', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="caption" sx={{
          textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', fontWeight: 700,
        }}>Denní výkaz</Typography>
        <StatusBadge label={statusLabel(status)} color={statusColor(status, theme)} />
        {dirty && (
          <Chip size="small" label="⚠ Neuložené změny"
            sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', fontWeight: 600 }}/>
        )}
        <Box sx={{ flex: 1 }}/>
        <Typography variant="caption" color="text.secondary">Celkem</Typography>
        <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums' }}>{fmtHM(totalMin)}</Typography>
        <IconButton onClick={handleClose} size="small" aria-label="Zavřít">✕</IconButton>
      </Stack>

      <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5">
          {capitalize(WEEKDAYS_LONG[dayjs(dateIso).day()])}, {dayjs(dateIso).format('D. M. YYYY')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {totalMin >= DAILY_GOAL_MIN
            ? `cíl 8h splněn (${fmtHM(totalMin - DAILY_GOAL_MIN)} navíc)`
            : `do cíle 8h: ${fmtHM(DAILY_GOAL_MIN - totalMin)}`}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {dayTyped && day && (
          <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: `${DAY_TYPE_COLOR[day.type!]}18`,
            borderLeft: `4px solid ${DAY_TYPE_COLOR[day.type!]}`, mb: 2 }}>
            <Typography sx={{ fontWeight: 700, color: DAY_TYPE_COLOR[day.type!] }}>
              {DAY_TYPE_ICON[day.type!]} {DAY_TYPE_LABEL[day.type!]}
            </Typography>
            {day.typeNote && (
              <Typography variant="caption" color="text.secondary">{day.typeNote}</Typography>
            )}
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
              Záznamy nelze přidávat. Odeber značku v menu řádku, pokud chceš logovat práci.
            </Typography>
          </Box>
        )}

        {!dayTyped && (
          <Stack spacing={1.5}>
            {hasDurationEntry ? (
              <DayDistributionBar drafts={drafts} projects={projects} tasks={tasks} />
            ) : (
              <DayTimeline drafts={drafts} projects={projects} tasks={tasks} isToday={isToday} nowHM={nowHM} />
            )}

            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
              {drafts.filter(d => d._state !== 'deleted').map(d => (
                <EntryRow
                  key={d.id}
                  draft={d}
                  tasks={tasks}
                  projects={projects}
                  disabled={disabled}
                  onChange={(patch) => updateDraft(d.id, patch)}
                  onDelete={() => deleteDraft(d.id)}
                />
              ))}
              {drafts.filter(d => d._state !== 'deleted').length === 0 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.disabled">
                    Žádné záznamy v tomto dni
                  </Typography>
                </Box>
              )}
            </Box>

            {!disabled && (
              <Button variant="text" onClick={addEntry} sx={{ alignSelf: 'flex-start' }}>
                + Přidat záznam
              </Button>
            )}
          </Stack>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" sx={{
            textTransform: 'uppercase', letterSpacing: '0.04em',
            color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5,
          }}>
            Poznámka ke dni
          </Typography>
          <InputBase
            value={dayNote}
            disabled={closed}
            multiline
            minRows={2}
            placeholder="Poznámka pro tento den…"
            onChange={(e) => setDayNote(e.target.value)}
            fullWidth
            sx={{
              fontSize: '13px', p: 1, border: 1, borderColor: 'divider', borderRadius: 1,
              '&:focus-within': { borderColor: 'primary.main' },
            }}
          />
        </Box>
      </Box>

      <Stack direction="row" spacing={1}
        sx={{ p: 2, borderTop: 1, borderColor: 'divider', alignItems: 'center' }}>
        <Typography variant="caption" color="text.disabled">
          {totalMin < DAILY_GOAL_MIN
            ? `Pod cíl ${fmtHM(DAILY_GOAL_MIN - totalMin)} chybí`
            : 'Cíl splněn'}
        </Typography>
        <Box sx={{ flex: 1 }}/>
        <Button variant="text" onClick={handleClose}>Zavřít</Button>
        {!closed && (
          <Button variant="contained" disabled={!dirty || disabled} onClick={handleSave}>
            Uložit
          </Button>
        )}
        {closed ? (
          <Button variant="outlined" color="warning" onClick={handleReopenDay}>
            🔓 Otevřít den
          </Button>
        ) : (
          !dayTyped && (
            <Button variant="outlined" color="success" onClick={handleCloseDay}>
              🔒 Uzavřít den
            </Button>
          )
        )}
      </Stack>

      <Dialog open={confirmClose} onClose={() => setConfirmClose(false)}>
        <DialogTitle>Zahodit změny?</DialogTitle>
        <DialogContent>
          <Typography>Máš neuložené změny. Zavřít drawer bez uložení?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClose(false)}>Pokračovat v úpravách</Button>
          <Button color="error" onClick={() => { setConfirmClose(false); onClose(); }}>Zahodit</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <Chip size="small" label={label} sx={{
      bgcolor: `${color}1c`, color, fontWeight: 600, height: 22,
    }}/>
  );
}

function statusLabel(s: ReturnType<typeof statusForDay>): string {
  switch (s) {
    case 'closed':   return 'Uzavřeno';
    case 'open':     return 'Otevřeno';
    case 'today':    return 'Dnes';
    case 'missing':  return 'Chybí výkaz';
    case 'future':   return 'Plánováno';
    case 'weekend':  return 'Víkend';
    case 'pto':      return 'Dovolená';
    case 'sick':     return 'Nemoc';
    case 'holiday':  return 'Svátek';
    case 'personal': return 'Osobní volno';
  }
}

function statusColor(s: ReturnType<typeof statusForDay>, theme: Theme): string {
  switch (s) {
    case 'closed':   return theme.palette.success.main;
    case 'open':     return theme.palette.warning.main;
    case 'today':    return theme.palette.primary.main;
    case 'missing':  return theme.palette.error.main;
    case 'pto':      return DAY_TYPE_COLOR.PTO;
    case 'sick':     return DAY_TYPE_COLOR.SICK;
    case 'holiday':  return DAY_TYPE_COLOR.HOLIDAY;
    case 'personal': return DAY_TYPE_COLOR.PERSONAL;
    default:         return theme.palette.text.disabled;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function hasOverlappingTimeEntries(drafts: EntryDraft[]): boolean {
  const intervals = drafts
    .filter(d => d._state !== 'deleted' && d.mode === 'TIME' && d.start && d.end)
    .map(d => ({ start: d.start!, end: d.end! }))
    .sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i].start < intervals[i - 1].end) return true;
  }
  return false;
}

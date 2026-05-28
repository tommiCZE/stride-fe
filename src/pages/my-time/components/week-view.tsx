import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import {
  Alert, Box, Button, Card, IconButton, Stack, Typography,
} from '@mui/material';
import { useAuthStore } from '../../../store/auth-store';
import { useProjects } from '../../../hooks/useProjects';
import { useAllProjectTasks } from '../../../hooks/useTasks';
import { useUserWorklogs } from '../../../hooks/useWorklogs';
import { useDays } from '../../../hooks/useDays';
import { useRunningTimer } from '../../../hooks/useTimer';
import {
  daysOfWeek, isoLocal, isoToday, isWeekend, startOfWeek,
} from '../../../lib/time';
import {
  aggregateDay, daysByIso, weekRangeLabel, worklogsByDay,
} from '../lib/week-math';
import WeekChart from './week-chart';
import WeekStats from './week-stats';
import DayRow from './day-row';
import { CaretIcon } from '../../../components/icons/icons';

export default function WeekView() {
  const userId = useAuthStore(s => s.userId);
  const [, setSearchParams] = useSearchParams();
  const [refIso, setRefIso] = useState<string>(() => isoToday());
  const weekIso = useMemo(() => startOfWeek(refIso).format('YYYY-MM-DD'), [refIso]);
  const prevWeekIso = useMemo(() => startOfWeek(refIso).subtract(7, 'day').format('YYYY-MM-DD'), [refIso]);
  const todayWeekIso = useMemo(() => startOfWeek(isoToday()).format('YYYY-MM-DD'), []);
  const days7 = useMemo(() => daysOfWeek(weekIso), [weekIso]);

  const { data: worklogs = [] } = useUserWorklogs(userId, weekIso);
  const { data: daysData = [] } = useDays(userId, weekIso);
  const { data: prevWorklogs = [] } = useUserWorklogs(userId, prevWeekIso);
  const { data: prevDaysData = [] } = useDays(userId, prevWeekIso);
  const { data: projects = [] } = useProjects();
  const projectIds = useMemo(() => projects.map(p => p.id), [projects]);
  const { data: tasks = [] } = useAllProjectTasks(projectIds);
  const { data: runningTimer } = useRunningTimer();

  const byDay = useMemo(() => worklogsByDay(worklogs), [worklogs]);
  const dayMap = useMemo(() => daysByIso(daysData), [daysData]);

  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    if (!runningTimer) return;
    const id = setInterval(() => setTick(Date.now()), 60000);
    return () => clearInterval(id);
  }, [runningTimer]);
  const liveMin = useMemo(() => {
    if (!runningTimer) return 0;
    return Math.max(0, Math.round((tick - new Date(runningTimer.startedAt).getTime()) / 60000));
  }, [runningTimer, tick]);
  const liveDateIso = runningTimer ? isoLocal(runningTimer.startedAt) : null;

  const totals = useMemo(() => {
    let logged = 0;
    let workdays = 0;
    let closed = 0;
    let open = 0;
    let missing = 0;
    const todayIso = isoToday();
    for (const iso of days7) {
      const total = aggregateDay(byDay.get(iso) ?? []).totalMin;
      logged += total;
      const day = dayMap.get(iso);
      if (day?.type) continue;
      if (isWeekend(iso) && total === 0) continue;
      workdays += 1;
      if (day?.closed) {
        closed += 1;
      } else if (total > 0) {
        open += 1;
      } else if (iso <= todayIso) {
        missing += 1;
      }
    }
    return { logged, workdays, closed, open, missing };
  }, [days7, byDay, dayMap]);

  const previousWeekOpenDays = useMemo(() => {
    if (weekIso !== todayWeekIso) return [];
    const prevByDay = worklogsByDay(prevWorklogs);
    const prevDayMap = daysByIso(prevDaysData);
    const prevDays = daysOfWeek(prevWeekIso);
    return prevDays.filter(iso => {
      const d = prevDayMap.get(iso);
      if (d?.type || d?.closed) return false;
      if (isWeekend(iso)) return false;
      const total = aggregateDay(prevByDay.get(iso) ?? []).totalMin;
      return total > 0;
    });
  }, [weekIso, todayWeekIso, prevWorklogs, prevDaysData, prevWeekIso]);

  const goTo = (iso: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('day', iso);
    setSearchParams(params, { replace: false });
  };

  const stepWeek = (delta: number) => {
    setRefIso(dayjs(weekIso).add(delta, 'week').format('YYYY-MM-DD'));
  };

  return (
    <Stack spacing={2}>
      <Card sx={{ borderRadius: 1.5, p: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton size="small" onClick={() => stepWeek(-1)} aria-label="Předchozí týden">
            <Box sx={{ transform: 'rotate(90deg)' }}><CaretIcon /></Box>
          </IconButton>
          <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {weekRangeLabel(weekIso)}
          </Typography>
          <IconButton size="small" onClick={() => stepWeek(1)} aria-label="Další týden">
            <Box sx={{ transform: 'rotate(-90deg)' }}><CaretIcon /></Box>
          </IconButton>
          <Box sx={{ flex: 1 }}/>
          <Button
            size="small"
            variant="outlined"
            disabled={weekIso === todayWeekIso}
            onClick={() => setRefIso(isoToday())}
          >
            Dnes
          </Button>
        </Stack>
      </Card>

      {previousWeekOpenDays.length > 0 && (
        <Alert severity="error" action={
          <Button color="error" size="small" onClick={() => goTo(previousWeekOpenDays[0])}>
            Uzavřít teď →
          </Button>
        }>
          <Typography sx={{ fontWeight: 600 }}>Nezavřené dny z minulého týdne</Typography>
          <Typography variant="caption">
            Máš {previousWeekOpenDays.length}{' '}
            {previousWeekOpenDays.length === 1 ? 'den' : 'dnů'} s vykázanou prací,
            ale neuzavřené: {previousWeekOpenDays.map(formatShortDate).join(', ')}
          </Typography>
        </Alert>
      )}

      <WeekStats
        loggedMin={totals.logged}
        closedCount={totals.closed}
        openCount={totals.open}
        missingCount={totals.missing}
        workdaysInWeek={Math.max(totals.workdays, 5)}
      />

      <Card sx={{ borderRadius: 1.5, p: 2 }}>
        <Typography variant="caption"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', fontWeight: 600 }}>
          Hodiny po dnech
        </Typography>
        <WeekChart
          weekDays={days7}
          worklogs={worklogs}
          days={daysData}
          liveExtraMin={liveMin}
          liveDateIso={liveDateIso}
          onDayClick={goTo}
        />
      </Card>

      <Card sx={{ borderRadius: 1.5 }}>
        <Box sx={{
          display: 'grid', gridTemplateColumns: '110px 78px 1fr 90px 130px',
          gap: 1.5, px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider',
        }}>
          {['Den', 'Celkem', 'Rozložení', 'Stav', ''].map((label, i) => (
            <Typography key={i} variant="caption" sx={{
              textTransform: 'uppercase', letterSpacing: '0.04em',
              color: 'text.disabled', fontWeight: 600,
            }}>{label}</Typography>
          ))}
        </Box>
        {days7.map((iso, i) => (
          <DayRow
            key={iso}
            userId={userId!}
            weekIso={weekIso}
            dateIso={iso}
            weekdayIndex={i}
            worklogs={byDay.get(iso) ?? []}
            day={dayMap.get(iso)}
            projects={projects}
            tasks={tasks}
            onOpen={() => goTo(iso)}
          />
        ))}
      </Card>
    </Stack>
  );
}

function formatShortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${Number(d)}. ${Number(m)}.`;
}

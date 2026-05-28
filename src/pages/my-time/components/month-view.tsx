import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Box, Button, Card, IconButton, Stack, Typography } from '@mui/material';
import { useAuthStore } from '../../../store/auth-store';
import { useProjects } from '../../../hooks/useProjects';
import { useAllProjectTasks } from '../../../hooks/useTasks';
import { useUserWorklogsMonth } from '../../../hooks/useWorklogs';
import { useDaysMonth } from '../../../hooks/useDays';
import { isoToday, isWeekend } from '../../../lib/time';
import {
  DAILY_GOAL_MIN, DAY_TYPE_COLOR, DAY_TYPE_LABEL,
  WEEKDAY_SHORT, daysByIso, worklogsByDay,
} from '../lib/week-math';
import MonthCell from './month-cell';
import { CaretIcon } from '../../../components/icons/icons';
import type { DayType } from '../../../api/types';

export default function MonthView() {
  const userId = useAuthStore(s => s.userId);
  const [, setSearchParams] = useSearchParams();
  const [refIso, setRefIso] = useState<string>(() => isoToday());
  const monthIso = useMemo(() => dayjs(refIso).startOf('month').format('YYYY-MM-DD'), [refIso]);

  const { data: worklogs = [] } = useUserWorklogsMonth(userId, monthIso);
  const { data: daysData = [] } = useDaysMonth(userId, monthIso);
  const { data: projects = [] } = useProjects();
  const projectIds = useMemo(() => projects.map(p => p.id), [projects]);
  const { data: tasks = [] } = useAllProjectTasks(projectIds);

  const byDay = useMemo(() => worklogsByDay(worklogs), [worklogs]);
  const dayMap = useMemo(() => daysByIso(daysData), [daysData]);

  const grid = useMemo(() => buildMonthGrid(monthIso), [monthIso]);
  const todayIso = isoToday();

  const stats = useMemo(() => {
    const monthStart = dayjs(monthIso).startOf('month');
    const monthEnd = dayjs(monthIso).endOf('month');
    let workdays = 0;
    let logged = 0;
    let closed = 0;
    let openWithLogs = 0;
    let missing = 0;
    const byType: Record<DayType, number> = { PTO: 0, SICK: 0, HOLIDAY: 0, PERSONAL: 0 };
    for (let d = monthStart; d.isBefore(monthEnd) || d.isSame(monthEnd, 'day'); d = d.add(1, 'day')) {
      const iso = d.format('YYYY-MM-DD');
      const day = dayMap.get(iso);
      const total = (byDay.get(iso) ?? []).reduce((s, w) => s + w.minutes, 0);
      logged += total;
      if (day?.type) { byType[day.type] += 1; continue; }
      if (isWeekend(iso) && total === 0) continue;
      workdays += 1;
      if (day?.closed) closed += 1;
      else if (total > 0) openWithLogs += 1;
      else if (iso <= todayIso) missing += 1;
    }
    return { workdays, logged, closed, openWithLogs, missing, byType };
  }, [monthIso, byDay, dayMap, todayIso]);

  const projectBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const w of worklogs) {
      if (!w.taskId) continue;
      const projectId = tasks.find(t => t.id === w.taskId)?.projectId;
      if (!projectId) continue;
      map.set(projectId, (map.get(projectId) ?? 0) + w.minutes);
    }
    return Array.from(map.entries())
      .map(([projectId, min]) => ({
        project: projects.find(p => p.id === projectId)!,
        min,
      }))
      .filter(r => r.project)
      .sort((a, b) => b.min - a.min);
  }, [worklogs, tasks, projects]);

  const monthGoal = (stats.workdays + stats.openWithLogs + stats.closed) * DAILY_GOAL_MIN;
  const goto = (iso: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('day', iso);
    setSearchParams(params, { replace: false });
  };
  const stepMonth = (delta: number) => {
    setRefIso(dayjs(monthIso).add(delta, 'month').format('YYYY-MM-DD'));
  };

  return (
    <Stack spacing={2}>
      <Card sx={{ borderRadius: 1.5, p: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton size="small" onClick={() => stepMonth(-1)} aria-label="Předchozí měsíc">
            <Box sx={{ transform: 'rotate(90deg)' }}><CaretIcon/></Box>
          </IconButton>
          <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums', minWidth: 180 }}>
            {capitalize(dayjs(monthIso).format('MMMM YYYY'))}
          </Typography>
          <IconButton size="small" onClick={() => stepMonth(1)} aria-label="Další měsíc">
            <Box sx={{ transform: 'rotate(-90deg)' }}><CaretIcon/></Box>
          </IconButton>
          <Box sx={{ flex: 1 }}/>
          <Button size="small" variant="outlined"
            disabled={monthIso === dayjs(isoToday()).startOf('month').format('YYYY-MM-DD')}
            onClick={() => setRefIso(isoToday())}>Tento měsíc</Button>
        </Stack>
      </Card>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <MiniStat label="Vykázáno" value={fmtMin(stats.logged)} sub={`z cíle ${fmtMin(monthGoal)}`} color="primary.main"/>
        <MiniStat label="Uzavřené dny" value={String(stats.closed)} sub={`${stats.openWithLogs} otevřených`} color="success.main"/>
        <MiniStat label="Dovolená" value={String(stats.byType.PTO)} sub={`+ ${stats.byType.HOLIDAY} svátek, ${stats.byType.PERSONAL} volno`} color={DAY_TYPE_COLOR.PTO}/>
        <MiniStat label="Nemoc" value={String(stats.byType.SICK)} sub="omluvené dny" color={DAY_TYPE_COLOR.SICK}/>
        <MiniStat label="Chybí výkaz" value={String(stats.missing)} sub="dní bez záznamů" color={stats.missing > 0 ? 'error.main' : 'text.disabled'}/>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card sx={{ borderRadius: 1.5, p: 1.5, flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
            {WEEKDAY_SHORT.map(d => (
              <Box key={d} sx={{ px: 1, py: 0.5, textAlign: 'center' }}>
                <Typography variant="caption" sx={{
                  textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, color: 'text.disabled',
                }}>{d}</Typography>
              </Box>
            ))}
            {grid.map(({ iso, inMonth }) => (
              <MonthCell
                key={iso}
                dateIso={iso}
                inMonth={inMonth}
                isToday={iso === todayIso}
                worklogs={byDay.get(iso) ?? []}
                day={dayMap.get(iso)}
                onClick={() => goto(iso)}
              />
            ))}
          </Box>
        </Card>

        <Card sx={{ borderRadius: 1.5, p: 2, width: { xs: '100%', md: 240 } }}>
          <Typography variant="caption" sx={{
            textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', fontWeight: 600,
            display: 'block', mb: 1,
          }}>Projekty</Typography>
          <Stack spacing={1}>
            {projectBreakdown.length === 0 && (
              <Typography variant="caption" color="text.disabled">Žádná data</Typography>
            )}
            {projectBreakdown.map(r => (
              <Stack key={r.project.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Box aria-hidden sx={{
                  width: 8, height: 8, borderRadius: '50%', bgcolor: r.project.color, flexShrink: 0,
                }}/>
                <Typography variant="body2" sx={{
                  flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{r.project.name}</Typography>
                <Typography variant="caption" sx={{
                  fontVariantNumeric: 'tabular-nums', fontWeight: 700,
                }}>{fmtMin(r.min)}</Typography>
              </Stack>
            ))}
          </Stack>

          <Typography variant="caption" sx={{
            textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', fontWeight: 600,
            display: 'block', mt: 3, mb: 1,
          }}>Legenda</Typography>
          <Stack spacing={0.5}>
            <LegendRow color="success.main" label="Uzavřeno"/>
            <LegendRow color="warning.main" label="Otevřeno"/>
            <LegendRow color="primary.main" label="Dnes"/>
            <LegendRow color="error.main" label="Chybí výkaz"/>
            {(['PTO', 'SICK', 'HOLIDAY', 'PERSONAL'] as DayType[]).map(t => (
              <LegendRow key={t} color={DAY_TYPE_COLOR[t]} label={DAY_TYPE_LABEL[t]}/>
            ))}
          </Stack>
        </Card>
      </Stack>
    </Stack>
  );
}

function MiniStat({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <Card sx={{ flex: 1, p: 1.5, borderRadius: 1.5 }}>
      <Typography variant="caption" sx={{
        textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', fontWeight: 600,
      }}>{label}</Typography>
      <Typography variant="h3" sx={{ color, mt: 0.25, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }}>{sub}</Typography>
    </Card>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
      <Box aria-hidden sx={{
        width: 10, height: 10, borderRadius: 0.5, bgcolor: color,
      }}/>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Stack>
  );
}

function buildMonthGrid(monthIso: string): { iso: string; inMonth: boolean }[] {
  const first = dayjs(monthIso).startOf('month');
  const last = dayjs(monthIso).endOf('month');
  const startOffset = (first.day() + 6) % 7;
  const totalDays = startOffset + last.date();
  const totalCells = Math.ceil(totalDays / 7) * 7;
  const start = first.subtract(startOffset, 'day');
  return Array.from({ length: totalCells }, (_, i) => {
    const d = start.add(i, 'day');
    return {
      iso: d.format('YYYY-MM-DD'),
      inMonth: d.month() === first.month(),
    };
  });
}

function fmtMin(min: number): string {
  const h = Math.floor(min / 60);
  return `${h}h`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

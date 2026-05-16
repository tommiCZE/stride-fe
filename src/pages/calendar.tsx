import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Button, IconButton, MenuItem, Select, Tooltip, Typography, useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { alpha } from '@mui/material/styles';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../hooks/useProjects';
import { useAllProjectTasks } from '../hooks/useTasks';
import { BOARD_STATUSES } from '../constants/statuses';
import type { TaskSummaryDto } from '../api/types';
import PriorityIcon from '../components/icons/priority-icon';
import { CaretIcon } from '../components/icons/icons';
import { ColorDot } from '../components/ui/ui';

const ALL_PROJECTS = 'all';
const WEEKDAYS_CS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

/** Returns an array of 6 weeks × 7 days (Mon–Sun) covering the visible month. */
function buildMonthGrid(anchor: Dayjs): Dayjs[] {
  const firstOfMonth = anchor.startOf('month');
  // dayjs: day() returns 0 = Sun, 1 = Mon … 6 = Sat. Shift so Monday = 0.
  const leading = (firstOfMonth.day() + 6) % 7;
  const gridStart = firstOfMonth.subtract(leading, 'day');
  return Array.from({ length: 42 }, (_, i) => gridStart.add(i, 'day'));
}

interface TaskPillProps {
  task: TaskSummaryDto;
  onOpen: (key: string) => void;
}

function TaskPill({ task, onOpen }: TaskPillProps) {
  const status = BOARD_STATUSES.find(s => s.id === task.status);
  const color = status?.color ?? '#64748b';
  return (
    <Tooltip title={`${task.key} — ${task.title}`} placement="top" disableInteractive>
      <Box
        onClick={() => onOpen(task.key)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 0.5,
          py: 0.25,
          borderRadius: 0.75,
          fontSize: 13,
          lineHeight: 1.3,
          cursor: 'pointer',
          color: 'text.primary',
          bgcolor: alpha(color, 0.14),
          borderLeft: 2,
          borderColor: color,
          '&:hover': { bgcolor: alpha(color, 0.24) },
        }}
      >
        <ColorDot dotColor={color} dotSize={5} />
        <PriorityIcon priority={task.priority} />
        <Box
          component="span"
          sx={{
            flex: 1,
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 500,
          }}
        >
          {task.title}
        </Box>
      </Box>
    </Tooltip>
  );
}

interface DayCellProps {
  day: Dayjs;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: TaskSummaryDto[];
  onOpen: (key: string) => void;
}

function DayCell({ day, isCurrentMonth, isToday, tasks, onOpen }: DayCellProps) {
  const MAX_VISIBLE = 4;
  const visible = tasks.slice(0, MAX_VISIBLE);
  const extra = tasks.length - visible.length;
  const weekend = day.day() === 0 || day.day() === 6;

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 110,
        display: 'flex',
        flexDirection: 'column',
        p: 0.75,
        gap: 0.5,
        borderRight: 1,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: isCurrentMonth
          ? weekend ? 'action.hover' : 'background.paper'
          : 'background.default',
        opacity: isCurrentMonth ? 1 : 0.55,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 22,
            height: 22,
            px: 0.75,
            borderRadius: '50%',
            fontSize: 13,
            fontWeight: isToday ? 700 : 500,
            color: isToday ? 'primary.contrastText' : isCurrentMonth ? 'text.primary' : 'text.disabled',
            bgcolor: isToday ? 'primary.main' : 'transparent',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {day.date()}
        </Box>
        {tasks.length > 0 && (
          <Typography sx={{ fontSize: 14, color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}>
            {tasks.length}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, minHeight: 0 }}>
        {visible.map(t => (
          <TaskPill key={t.id} task={t} onOpen={onOpen} />
        ))}
        {extra > 0 && (
          <Typography sx={{ fontSize: 14, color: 'text.secondary', px: 0.5 }}>
            +{extra} dalších
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function Calendar() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();
  const [anchor, setAnchor] = useState<Dayjs>(() => dayjs());
  const [projectId, setProjectId] = useState<string>(ALL_PROJECTS);

  const { data: projects = [] } = useProjects();
  const projectIds = projectId === ALL_PROJECTS ? projects.map(p => p.id) : [projectId];
  const { data: allTasks } = useAllProjectTasks(projectIds);

  const today = dayjs();
  const grid = useMemo(() => buildMonthGrid(anchor), [anchor]);
  const currentMonth = anchor.month();

  const tasksByDay = useMemo(() => {
    const map = new Map<string, TaskSummaryDto[]>();
    allTasks.forEach(task => {
      if (!task.dueDate) return;
      const key = dayjs(task.dueDate).format('YYYY-MM-DD');
      const arr = map.get(key);
      if (arr) arr.push(task);
      else map.set(key, [task]);
    });
    return map;
  }, [allTasks]);

  const openTask = (key: string) => setSearchParams({ task: key });

  const goPrev  = () => setAnchor(a => a.subtract(1, 'month'));
  const goNext  = () => setAnchor(a => a.add(1, 'month'));
  const goToday = () => setAnchor(dayjs());

  const handleProjectChange = (e: SelectChangeEvent<string>) => {
    setProjectId(e.target.value);
  };

  const monthLabel = anchor.toDate().toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
  const project = projectId === ALL_PROJECTS ? null : projects.find(p => p.id === projectId);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default', minHeight: 0 }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, px: 3, py: 1.75,
        borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper',
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
            {monthLabel}
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            {project ? project.name : t('nav.calendar')}
          </Typography>
        </Box>

        <Select
          size="small"
          value={projectId}
          onChange={handleProjectChange}
          sx={{ minWidth: 180, fontSize: 13 }}
        >
          <MenuItem value={ALL_PROJECTS}>{t('nav.projects')} — vše</MenuItem>
          {projects.map(p => (
            <MenuItem key={p.id} value={p.id}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <ColorDot dotColor={p.color} dotSize={8} />
                {p.name}
              </Box>
            </MenuItem>
          ))}
        </Select>

        <Button variant="outlined" size="small" onClick={goToday}>Dnes</Button>
        <IconButton size="small" onClick={goPrev} aria-label="Předchozí měsíc"
          sx={{ transform: 'rotate(90deg)' }}>
          <CaretIcon style={{ color: theme.palette.text.secondary }} />
        </IconButton>
        <IconButton size="small" onClick={goNext} aria-label="Další měsíc"
          sx={{ transform: 'rotate(-90deg)' }}>
          <CaretIcon style={{ color: theme.palette.text.secondary }} />
        </IconButton>
      </Box>

      <Box sx={{
        display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider',
      }}>
        {WEEKDAYS_CS.map(d => (
          <Box key={d} sx={{
            px: 1.5, py: 1, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'text.secondary', borderRight: 1, borderColor: 'divider',
            '&:last-of-type': { borderRight: 0 },
          }}>
            {d}
          </Box>
        ))}
      </Box>

      <Box sx={{
        flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gridAutoRows: '1fr', overflowY: 'auto', borderLeft: 1, borderColor: 'divider',
      }}>
        {grid.map(day => {
          const key = day.format('YYYY-MM-DD');
          return (
            <DayCell
              key={key}
              day={day}
              isCurrentMonth={day.month() === currentMonth}
              isToday={day.isSame(today, 'day')}
              tasks={tasksByDay.get(key) ?? []}
              onOpen={openTask}
            />
          );
        })}
      </Box>
    </Box>
  );
}

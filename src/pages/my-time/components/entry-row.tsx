import { useState } from 'react';
import {
  Box, IconButton, InputBase, Stack, Tooltip, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { ProjectDto, TaskSummaryDto, WorklogMode } from '../../../api/types';
import {
  addMinutesToHM, computeMinutes, fmtHM, normalizeHM, parseDuration,
} from '../../../lib/time';
import TaskPicker from './task-picker';

export interface EntryDraft {
  id: string;
  taskId: string | null;
  mode: WorklogMode;
  start: string | null;
  end: string | null;
  minutes: number;
  note: string;
  kind: 'TASK' | 'MEETING';
  _state: 'unchanged' | 'created' | 'modified' | 'deleted';
}

interface Props {
  draft: EntryDraft;
  tasks: TaskSummaryDto[];
  projects: ProjectDto[];
  disabled?: boolean;
  onChange: (patch: Partial<EntryDraft>) => void;
  onDelete: () => void;
}

const PURPLE = '#a855f7';

export default function EntryRow({ draft, tasks, projects, disabled, onChange, onDelete }: Props) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '152px 1fr 1.4fr 90px 28px',
        gap: 1, alignItems: 'center',
        px: 1, py: 0.75,
        borderTop: 1, borderColor: 'divider',
        '&:first-of-type': { borderTop: 0 },
        '& .row-actions': { opacity: 0 },
        '&:hover .row-actions': { opacity: 1 },
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <Box>
        {draft.mode === 'TIME' ? (
          <TimeInputs
            start={draft.start}
            end={draft.end}
            disabled={disabled}
            onChange={(start, end) => {
              const mins = computeMinutes(start, end);
              onChange({ start, end, minutes: mins ?? draft.minutes });
            }}
            onToggleMode={!disabled ? () => onChange({ mode: 'DURATION' }) : undefined}
          />
        ) : (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Box sx={{
              px: 0.75, py: 0.25, borderRadius: 0.75,
              bgcolor: `${PURPLE}20`, color: PURPLE,
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>JEN DOBA</Box>
            {!disabled && (
              <Tooltip title="Přepnout na čas">
                <IconButton size="small" className="row-actions"
                  onClick={() => {
                    const start = draft.start ?? '09:00';
                    const end = addMinutesToHM(start, draft.minutes) ?? start;
                    onChange({ mode: 'TIME', start, end });
                  }}
                  sx={{ p: 0.25 }}
                >
                  <SwapIcon/>
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )}
      </Box>

      <Box>
        <TaskPicker
          value={draft.taskId}
          tasks={tasks}
          projects={projects}
          disabled={disabled}
          onChange={(taskId) => onChange({
            taskId,
            kind: taskId === null ? 'MEETING' : 'TASK',
          })}
        />
      </Box>

      <Box>
        <InputBase
          value={draft.note}
          placeholder="Popis…"
          disabled={disabled}
          onChange={(e) => onChange({ note: e.target.value })}
          fullWidth
          sx={{
            fontSize: '13px', px: 1, py: 0.5,
            border: 1, borderColor: 'transparent', borderRadius: 1,
            '&:hover':  { borderColor: 'divider' },
            '&:focus-within': { borderColor: theme.palette.primary.main },
          }}
        />
      </Box>

      <Box>
        {draft.mode === 'TIME' ? (
          <Typography variant="body2" sx={{
            textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600,
          }}>
            {fmtHM(draft.minutes)}
          </Typography>
        ) : (
          <DurationInput
            minutes={draft.minutes}
            disabled={disabled}
            onChange={(min) => onChange({ minutes: min })}
          />
        )}
      </Box>

      <IconButton
        size="small"
        disabled={disabled}
        onClick={onDelete}
        aria-label="Smazat záznam"
        className="row-actions"
        sx={{
          p: 0.25, color: 'text.disabled',
          '&:hover': { color: 'error.main' },
        }}
      >
        <TrashIcon/>
      </IconButton>
    </Box>
  );
}

function TimeInputs({ start, end, disabled, onChange, onToggleMode }: {
  start: string | null; end: string | null; disabled?: boolean;
  onChange: (start: string | null, end: string | null) => void;
  onToggleMode?: () => void;
}) {
  return (
    <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
      <TimeBox value={start} disabled={disabled} onCommit={(v) => onChange(v, end)} />
      <Typography variant="caption" color="text.disabled">–</Typography>
      <TimeBox value={end} disabled={disabled} onCommit={(v) => onChange(start, v)} />
      {onToggleMode && (
        <Tooltip title="Přepnout na jen dobu">
          <IconButton size="small" className="row-actions" onClick={onToggleMode}
            sx={{ p: 0.25, ml: 0.25 }}>
            <SwapIcon/>
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

function TimeBox({ value, disabled, onCommit }: {
  value: string | null; disabled?: boolean; onCommit: (v: string | null) => void;
}) {
  const [prev, setPrev] = useState(value);
  const [local, setLocal] = useState(value ?? '');
  if (prev !== value) {
    setPrev(value);
    setLocal(value ?? '');
  }
  return (
    <InputBase
      value={local}
      disabled={disabled}
      placeholder="hh:mm"
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        const norm = normalizeHM(local);
        onCommit(norm);
        setLocal(norm ?? local);
      }}
      inputProps={{
        inputMode: 'numeric',
        pattern: '\\d{1,2}:\\d{2}',
        'aria-label': 'Čas',
      }}
      sx={{
        width: 54, fontSize: '13px', fontVariantNumeric: 'tabular-nums',
        px: 0.75, py: 0.25, borderRadius: 0.75,
        border: 1, borderColor: 'divider',
        '&:focus-within': { borderColor: 'primary.main' },
      }}
    />
  );
}

function DurationInput({ minutes, disabled, onChange }: {
  minutes: number; disabled?: boolean; onChange: (min: number) => void;
}) {
  const [prev, setPrev] = useState(minutes);
  const [local, setLocal] = useState(() => fmtHM(minutes));
  if (prev !== minutes) {
    setPrev(minutes);
    setLocal(fmtHM(minutes));
  }
  return (
    <InputBase
      value={local}
      disabled={disabled}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        const min = parseDuration(local);
        if (min !== null) {
          onChange(min);
          setLocal(fmtHM(min));
        } else {
          setLocal(fmtHM(minutes));
        }
      }}
      inputProps={{ inputMode: 'text', 'aria-label': 'Trvání' }}
      sx={{
        width: '100%', fontSize: '13px', fontVariantNumeric: 'tabular-nums',
        textAlign: 'right',
        px: 0.75, py: 0.25, borderRadius: 0.75,
        border: 1, borderColor: PURPLE,
        bgcolor: `${PURPLE}10`,
        '&:focus-within': { borderColor: PURPLE, boxShadow: `0 0 0 2px ${PURPLE}33` },
      }}
    />
  );
}

function SwapIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 5h9l-2-2M13 11H4l2 2"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M3 4h10M6 4V2.5h4V4M5 4l.5 9h5L11 4M7 7v4M9 7v4"/>
    </svg>
  );
}

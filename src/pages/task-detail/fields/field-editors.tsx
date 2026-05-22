import { useState, useRef, useEffect } from 'react';
import { Box, Menu, MenuItem, Popover, Stack, Typography, InputBase } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTeamMembers } from '../../../hooks/useTeam';
import { useEpics } from '../../../hooks/useEpics';
import { useSprints } from '../../../hooks/useSprints';
import { useReleases } from '../../../hooks/useReleases';
import { PRIORITIES } from '../../../constants/priorities';
import { TASK_TYPES } from '../../../constants/taskTypes';
import FluxAvatar from '../../../components/flux-avatar';
import PriorityIcon from '../../../components/icons/priority-icon';
import TypeIcon from '../../../components/icons/type-icon';
import { FieldPill } from './field-helpers';
import type { TaskDto, UpdateTaskRequest } from '../../../api/types';

export type PatchFn = (patch: UpdateTaskRequest) => void;

const DOT_SX = { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 };
const TRIGGER_SX = { cursor: 'default', display: 'inline-flex' } as const;
const MENU_ROW_SX = { alignItems: 'center' };

function daysUntil(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null;
  return Math.ceil((new Date(isoDate).getTime() - Date.now()) / 86_400_000);
}

export function TitleEditor({ title, onChange }: { title: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const [prevTitle, setPrevTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  if (prevTitle !== title) {
    setPrevTitle(title);
    setDraft(title);
  }

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft.trim() !== title) onChange(draft.trim());
    else setDraft(title);
  };

  if (editing) {
    return (
      <InputBase
        inputRef={inputRef}
        fullWidth
        multiline
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); } if (e.key === 'Escape') { setDraft(title); setEditing(false); } }}
        sx={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', p: 0.5, mx: -0.5,
          borderRadius: 1, border: 1, borderColor: 'primary.main', bgcolor: 'background.paper' }}
      />
    );
  }

  return (
    <Typography
      variant="h3"
      onClick={() => setEditing(true)}
      sx={{ mb: 0.5, cursor: 'text', '&:hover': { bgcolor: 'action.hover' }, p: 0.5, mx: -0.5, borderRadius: 1 }}
    >
      {title}
    </Typography>
  );
}

export function AssigneeEditor({ task, onPatch }: { task: TaskDto; onPatch: PatchFn }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const { data: members = [] } = useTeamMembers();
  const assignee = task.assignee;

  return (
    <>
      <Stack
        direction="row"
        spacing={0.75}
        onClick={e => setAnchor(e.currentTarget)}
        sx={{ alignItems: 'center', cursor: 'default',
          '&:hover': { bgcolor: 'action.hover' }, p: 0.5, mx: -0.5, borderRadius: 0.8 }}
      >
        {assignee ? (
          <><FluxAvatar user={assignee} size={20}/> <Typography variant="body2">{assignee.name}</Typography></>
        ) : (
          <FieldPill dashed>Přiřadit</FieldPill>
        )}
      </Stack>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { onPatch({ assigneeId: null }); setAnchor(null); }}>
          <Typography variant="body2" color="text.secondary">Nepřiřazeno</Typography>
        </MenuItem>
        {members.map(u => (
          <MenuItem key={u.id} onClick={() => { onPatch({ assigneeId: u.id }); setAnchor(null); }}
            selected={task.assigneeId === u.id}>
            <Stack direction="row" spacing={1} sx={MENU_ROW_SX}>
              <FluxAvatar user={u} size={20}/>
              <Typography variant="body2">{u.name}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function PriorityEditor({ task, onPatch }: { task: TaskDto; onPatch: PatchFn }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const prio = PRIORITIES.find(p => p.id === task.priority) ?? PRIORITIES[2];

  return (
    <>
      <Box onClick={e => setAnchor(e.currentTarget)} sx={TRIGGER_SX}>
        <FieldPill color={prio.color}>
          <PriorityIcon priority={task.priority}/> {prio.name}
        </FieldPill>
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        {PRIORITIES.map(p => (
          <MenuItem key={p.id} onClick={() => { onPatch({ priority: p.id }); setAnchor(null); }}
            selected={task.priority === p.id}>
            <Stack direction="row" spacing={1} sx={MENU_ROW_SX}>
              <PriorityIcon priority={p.id}/>
              <Typography variant="body2">{p.name}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function TypeEditor({ task, onPatch }: { task: TaskDto; onPatch: PatchFn }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const type = TASK_TYPES.find(t => t.id === task.type) ?? TASK_TYPES[1];

  return (
    <>
      <Box onClick={e => setAnchor(e.currentTarget)} sx={TRIGGER_SX}>
        <FieldPill><TypeIcon type={task.type} size={13}/> {type.name}</FieldPill>
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        {TASK_TYPES.map(tt => (
          <MenuItem key={tt.id} onClick={() => { onPatch({ type: tt.id }); setAnchor(null); }}
            selected={task.type === tt.id}>
            <Stack direction="row" spacing={1} sx={MENU_ROW_SX}>
              <TypeIcon type={tt.id} size={14}/>
              <Typography variant="body2">{tt.name}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function EpicEditor({ task, onPatch }: { task: TaskDto; onPatch: PatchFn }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const { data: epics = [] } = useEpics(task.projectId);
  const epic = task.epicId ? epics.find(e => e.id === task.epicId) : null;

  return (
    <>
      <Box onClick={e => setAnchor(e.currentTarget)} sx={TRIGGER_SX}>
        {epic ? (
          <FieldPill color={epic.color}>
            <Box sx={{ ...DOT_SX, bgcolor: epic.color }}/>{epic.title}
          </FieldPill>
        ) : (
          <FieldPill dashed>Nastavit epic</FieldPill>
        )}
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { onPatch({ epicId: null }); setAnchor(null); }}>
          <Typography variant="body2" color="text.secondary">Žádný epic</Typography>
        </MenuItem>
        {epics.map(e => (
          <MenuItem key={e.id} onClick={() => { onPatch({ epicId: e.id }); setAnchor(null); }}
            selected={task.epicId === e.id}>
            <Stack direction="row" spacing={1} sx={MENU_ROW_SX}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: e.color, flexShrink: 0 }}/>
              <Typography variant="body2">{e.title}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function SprintEditor({ task, onPatch }: { task: TaskDto; onPatch: PatchFn }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const { data: sprints = [] } = useSprints(task.projectId);
  const sprint = task.sprintId ? sprints.find(s => s.id === task.sprintId) : null;

  return (
    <>
      <Box onClick={e => setAnchor(e.currentTarget)}
        sx={{ cursor: 'default', '&:hover': { bgcolor: 'action.hover' }, px: 0.5, borderRadius: 0.8, display: 'inline-flex' }}>
        <Typography variant="body2">
          {sprint ? sprint.name : <Box component="span" sx={{ color: 'text.disabled' }}>Nastavit sprint</Box>}
        </Typography>
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { onPatch({ sprintId: null }); setAnchor(null); }}>
          <Typography variant="body2" color="text.secondary">Backlog</Typography>
        </MenuItem>
        {sprints.map(s => (
          <MenuItem key={s.id} onClick={() => { onPatch({ sprintId: s.id }); setAnchor(null); }}
            selected={task.sprintId === s.id}>
            <Typography variant="body2">{s.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function FixVersionEditor({ task, onPatch }: { task: TaskDto; onPatch: PatchFn }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const { data: releases = [] } = useReleases(task.projectId);
  const release = task.fixVersionId ? releases.find(r => r.id === task.fixVersionId) : null;
  const selectable = releases.filter(r => r.status !== 'archived');

  return (
    <>
      <Box onClick={e => setAnchor(e.currentTarget)} sx={TRIGGER_SX}>
        {release ? (
          <FieldPill>
            <Box sx={{ ...DOT_SX,
              bgcolor: release.status === 'released' ? 'success.main' : 'warning.main' }}/>
            {release.name}
          </FieldPill>
        ) : (
          <FieldPill dashed>Set version</FieldPill>
        )}
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { onPatch({ fixVersionId: null }); setAnchor(null); }}>
          <Typography variant="body2" color="text.secondary">Žádná verze</Typography>
        </MenuItem>
        {selectable.map(r => (
          <MenuItem key={r.id} onClick={() => { onPatch({ fixVersionId: r.id }); setAnchor(null); }}
            selected={task.fixVersionId === r.id}>
            <Stack direction="row" spacing={1} sx={MENU_ROW_SX}>
              <Box sx={{ ...DOT_SX,
                bgcolor: r.status === 'released' ? 'success.main' : 'warning.main' }}/>
              <Typography variant="body2">{r.name}</Typography>
            </Stack>
          </MenuItem>
        ))}
        {selectable.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.disabled">Žádné verze nejsou nastaveny</Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

export function LabelsEditor({ task, onPatch }: { task: TaskDto; onPatch: PatchFn }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const labels = task.labels ?? [];

  const toggle = (id: string) => {
    const next = labels.some(l => l.id === id)
      ? labels.filter(l => l.id !== id).map(l => l.id)
      : [...labels.map(l => l.id), id];
    onPatch({ labelIds: next });
  };

  return (
    <>
      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
        {labels.map(l => (
          <FieldPill key={l.id} color={l.color}>{l.name}</FieldPill>
        ))}
        <Box onClick={e => setAnchor(e.currentTarget)}>
          <FieldPill dashed>+ přidat</FieldPill>
        </Box>
      </Stack>
      <Popover open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Stack direction="row" spacing={0.75} sx={{ p: 1, flexWrap: 'wrap', maxWidth: 220 }}>
          {labels.map(l => {
            const active = true;
            return (
              <Stack key={l.id} direction="row" spacing={0.5} onClick={() => toggle(l.id)}
                sx={{ alignItems: 'center',
                  px: 0.75, py: 0.35, borderRadius: 0.8, cursor: 'default',
                  transition: 'all 0.12s',
                  bgcolor: active ? alpha(l.color, 0.13) : 'action.hover',
                  color: active ? l.color : 'text.secondary',
                  border: 1, borderColor: active ? alpha(l.color, 0.4) : 'transparent',
                  fontWeight: active ? 600 : 400,
                  '&:hover': { bgcolor: alpha(l.color, 0.2) } }}>
                <Box sx={{ ...DOT_SX, bgcolor: l.color }}/>
                <Typography variant="body2" sx={{ color: 'inherit', fontWeight: 'inherit' }}>{l.name}</Typography>
              </Stack>
            );
          })}
          {labels.length === 0 && (
            <Typography variant="body2" color="text.disabled" sx={{ p: 0.5 }}>Žádné štítky</Typography>
          )}
        </Stack>
      </Popover>
    </>
  );
}

export function EstimateEditor({ task, onPatch }: { task: TaskDto; onPatch: PatchFn }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(task.estimate ?? ''));
  const [prevEstimate, setPrevEstimate] = useState(task.estimate);
  const inputRef = useRef<HTMLInputElement>(null);

  if (prevEstimate !== task.estimate) {
    setPrevEstimate(task.estimate);
    setDraft(String(task.estimate ?? ''));
  }

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    setEditing(false);
    const val = parseFloat(draft);
    if (!isNaN(val) && val >= 0) onPatch({ estimate: val });
    else if (draft.trim() === '') onPatch({ estimate: null });
    else setDraft(String(task.estimate ?? ''));
  };

  if (editing) {
    return (
      <InputBase
        inputRef={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(String(task.estimate ?? '')); setEditing(false); } }}
        slotProps={{ input: { sx: { width: 60, p: '2px 4px' } } }}
        sx={{ border: 1, borderColor: 'primary.main', borderRadius: 0.5, px: 0.5, fontSize: '14px', fontWeight: 600 }}
        placeholder="h"
      />
    );
  }

  return (
    <Typography
      variant="body2"
      onClick={() => setEditing(true)}
      sx={{ fontWeight: 600, cursor: 'text', px: 0.5, borderRadius: 0.5,
        '&:hover': { bgcolor: 'action.hover' } }}
    >
      {task.estimate != null ? `${task.estimate} h` : <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>}
    </Typography>
  );
}

export function DueDateEditor({ task, onPatch }: { task: TaskDto; onPatch: PatchFn }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.showPicker?.(); }, [editing]);

  const commit = (val: string) => {
    setEditing(false);
    onPatch({ dueDate: val || null });
  };

  const display = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
    : null;

  const daysUntilDue = daysUntil(task.dueDate);

  const color =
    daysUntilDue === null ? 'text.disabled' :
    daysUntilDue < 0 ? 'error.main' :
    daysUntilDue <= 3 ? 'warning.main' :
    'text.primary';

  if (editing) {
    return (
      <InputBase
        inputRef={inputRef}
        type="date"
        defaultValue={task.dueDate ?? ''}
        onBlur={e => commit(e.target.value)}
        onChange={e => { if (e.target.value) commit(e.target.value); }}
        autoFocus
        sx={{ border: 1, borderColor: 'primary.main', borderRadius: 0.5, px: 0.5, fontSize: '14px' }}
      />
    );
  }

  return (
    <Typography
      variant="body2"
      onClick={() => setEditing(true)}
      sx={{ cursor: 'text', px: 0.5, borderRadius: 0.5,
        '&:hover': { bgcolor: 'action.hover' }, color }}
    >
      {display ?? '—'}
      {daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7 && (
        <Box component="span" sx={{ ml: 0.5, fontSize: '11px' }}>
          · za {daysUntilDue} {daysUntilDue === 1 ? 'den' : daysUntilDue < 5 ? 'dny' : 'dní'}
        </Box>
      )}
      {daysUntilDue !== null && daysUntilDue < 0 && (
        <Box component="span" sx={{ ml: 0.5, fontSize: '11px' }}>
          · po termínu
        </Box>
      )}
    </Typography>
  );
}

export function EstimateProgressCard({ task, onPatch }: { task: TaskDto; onPatch: PatchFn }) {
  const { logged, estimate } = task;
  const hasEstimate = estimate != null && estimate > 0;
  const pct = hasEstimate ? Math.min(logged / estimate, 1) : 0;
  const overBudget = hasEstimate && logged > estimate;

  return (
    <Stack spacing={0.5} sx={{ width: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <EstimateEditor task={task} onPatch={onPatch}/>
        {hasEstimate ? (
          <Typography component="span" variant="caption" color="text.disabled" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            ({logged}h / {estimate}h · {Math.round(pct * 100)}%)
          </Typography>
        ) : logged > 0 ? (
          <Typography component="span" variant="caption" color="text.disabled">
            ({logged}h zalogováno)
          </Typography>
        ) : null}
      </Stack>
      {hasEstimate && (
        <Box sx={{ width: '100%', height: 3, bgcolor: 'action.hover', borderRadius: 1, overflow: 'hidden' }}>
          <Box sx={{
            width: `${pct * 100}%`, height: '100%',
            bgcolor: overBudget ? 'error.main' : 'warning.main',
            transition: '0.3s',
          }}/>
        </Box>
      )}
    </Stack>
  );
}

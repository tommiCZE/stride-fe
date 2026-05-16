import { useState, useRef, useEffect } from 'react';
import { Box, Menu, MenuItem, Popover, Typography, InputBase } from '@mui/material';
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

export function TitleEditor({ title, onChange }: { title: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(title); }, [title]);
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
        sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', p: 0.5, mx: -0.5,
          borderRadius: 1, border: 1, borderColor: 'primary.main', bgcolor: 'background.paper' }}
      />
    );
  }

  return (
    <Typography
      onClick={() => setEditing(true)}
      sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', mb: 0.5,
        cursor: 'text', '&:hover': { bgcolor: 'action.hover' }, p: 0.5, mx: -0.5, borderRadius: 1 }}
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
      <Box
        onClick={e => setAnchor(e.currentTarget)}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 14, cursor: 'default',
          '&:hover': { bgcolor: 'action.hover' }, p: 0.5, mx: -0.5, borderRadius: 0.8 }}
      >
        {assignee ? (
          <><FluxAvatar user={assignee} size={20}/> {assignee.name}</>
        ) : (
          <FieldPill dashed>Přiřadit</FieldPill>
        )}
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { onPatch({ assigneeId: null }); setAnchor(null); }}>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Nepřiřazeno</Typography>
        </MenuItem>
        {members.map(u => (
          <MenuItem key={u.id} onClick={() => { onPatch({ assigneeId: u.id }); setAnchor(null); }}
            selected={task.assigneeId === u.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FluxAvatar user={u} size={20}/>
              <Typography sx={{ fontSize: 14 }}>{u.name}</Typography>
            </Box>
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
      <Box onClick={e => setAnchor(e.currentTarget)} sx={{ cursor: 'default', display: 'inline-flex' }}>
        <FieldPill color={prio.color}>
          <PriorityIcon priority={task.priority}/> {prio.name}
        </FieldPill>
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        {PRIORITIES.map(p => (
          <MenuItem key={p.id} onClick={() => { onPatch({ priority: p.id }); setAnchor(null); }}
            selected={task.priority === p.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PriorityIcon priority={p.id}/>
              <Typography sx={{ fontSize: 14 }}>{p.name}</Typography>
            </Box>
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
      <Box onClick={e => setAnchor(e.currentTarget)} sx={{ cursor: 'default', display: 'inline-flex' }}>
        <FieldPill><TypeIcon type={task.type} size={13}/> {type.name}</FieldPill>
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        {TASK_TYPES.map(tt => (
          <MenuItem key={tt.id} onClick={() => { onPatch({ type: tt.id }); setAnchor(null); }}
            selected={task.type === tt.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TypeIcon type={tt.id} size={14}/>
              <Typography sx={{ fontSize: 14 }}>{tt.name}</Typography>
            </Box>
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
      <Box onClick={e => setAnchor(e.currentTarget)} sx={{ cursor: 'default', display: 'inline-flex' }}>
        {epic ? (
          <FieldPill color={epic.color}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: epic.color }}/>{epic.title}
          </FieldPill>
        ) : (
          <FieldPill dashed>Nastavit epic</FieldPill>
        )}
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { onPatch({ epicId: null }); setAnchor(null); }}>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Žádný epic</Typography>
        </MenuItem>
        {epics.map(e => (
          <MenuItem key={e.id} onClick={() => { onPatch({ epicId: e.id }); setAnchor(null); }}
            selected={task.epicId === e.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: e.color, flexShrink: 0 }}/>
              <Typography sx={{ fontSize: 14 }}>{e.title}</Typography>
            </Box>
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
        <Typography sx={{ fontSize: 14 }}>
          {sprint ? sprint.name : <Box component="span" sx={{ color: 'text.disabled' }}>Nastavit sprint</Box>}
        </Typography>
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { onPatch({ sprintId: null }); setAnchor(null); }}>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Backlog</Typography>
        </MenuItem>
        {sprints.map(s => (
          <MenuItem key={s.id} onClick={() => { onPatch({ sprintId: s.id }); setAnchor(null); }}
            selected={task.sprintId === s.id}>
            <Typography sx={{ fontSize: 14 }}>{s.name}</Typography>
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
      <Box onClick={e => setAnchor(e.currentTarget)} sx={{ cursor: 'default', display: 'inline-flex' }}>
        {release ? (
          <FieldPill>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%',
              bgcolor: release.status === 'released' ? 'success.main' : 'warning.main' }}/>
            {release.name}
          </FieldPill>
        ) : (
          <FieldPill dashed>Set version</FieldPill>
        )}
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { onPatch({ fixVersionId: null }); setAnchor(null); }}>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Žádná verze</Typography>
        </MenuItem>
        {selectable.map(r => (
          <MenuItem key={r.id} onClick={() => { onPatch({ fixVersionId: r.id }); setAnchor(null); }}
            selected={task.fixVersionId === r.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%',
                bgcolor: r.status === 'released' ? 'success.main' : 'warning.main' }}/>
              <Typography sx={{ fontSize: 14 }}>{r.name}</Typography>
            </Box>
          </MenuItem>
        ))}
        {selectable.length === 0 && (
          <MenuItem disabled>
            <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>Žádné verze nejsou nastaveny</Typography>
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
        {labels.map(l => (
          <FieldPill key={l.id} color={l.color}>{l.name}</FieldPill>
        ))}
        <Box onClick={e => setAnchor(e.currentTarget)}>
          <FieldPill dashed>+ přidat</FieldPill>
        </Box>
      </Box>
      <Popover open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75, maxWidth: 220 }}>
          {labels.map(l => {
            const active = true;
            return (
              <Box key={l.id} onClick={() => toggle(l.id)}
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5,
                  px: 0.75, py: 0.35, borderRadius: 0.8, fontSize: 14, cursor: 'default',
                  transition: 'all 0.12s',
                  bgcolor: active ? alpha(l.color, 0.13) : 'action.hover',
                  color: active ? l.color : 'text.secondary',
                  border: 1, borderColor: active ? alpha(l.color, 0.4) : 'transparent',
                  fontWeight: active ? 600 : 400,
                  '&:hover': { bgcolor: alpha(l.color, 0.2) } }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: l.color, flexShrink: 0 }}/>
                {l.name}
              </Box>
            );
          })}
          {labels.length === 0 && (
            <Typography sx={{ fontSize: 14, color: 'text.disabled', p: 0.5 }}>Žádné štítky</Typography>
          )}
        </Box>
      </Popover>
    </>
  );
}

export function EstimateEditor({ task, onPatch }: { task: TaskDto; onPatch: PatchFn }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(task.estimate ?? ''));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(String(task.estimate ?? '')); }, [task.estimate]);
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
        sx={{ border: 1, borderColor: 'primary.main', borderRadius: 0.5, px: 0.5, fontSize: 14, fontWeight: 600 }}
        placeholder="h"
      />
    );
  }

  return (
    <Typography
      onClick={() => setEditing(true)}
      sx={{ fontSize: 14, fontWeight: 600, cursor: 'text', px: 0.5, borderRadius: 0.5,
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

  if (editing) {
    return (
      <InputBase
        inputRef={inputRef}
        type="date"
        defaultValue={task.dueDate ?? ''}
        onBlur={e => commit(e.target.value)}
        onChange={e => { if (e.target.value) commit(e.target.value); }}
        autoFocus
        sx={{ border: 1, borderColor: 'primary.main', borderRadius: 0.5, px: 0.5, fontSize: 14 }}
      />
    );
  }

  return (
    <Typography
      onClick={() => setEditing(true)}
      sx={{ fontSize: 14, cursor: 'text', px: 0.5, borderRadius: 0.5,
        '&:hover': { bgcolor: 'action.hover' },
        color: task.dueDate ? 'text.primary' : 'text.disabled' }}
    >
      {display ?? '—'}
    </Typography>
  );
}

export function LoggedBar({ logged, estimate }: { logged: number; estimate?: number | null }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 14, fontWeight: 600 }}>
      {logged}h{estimate != null && ` / ${estimate}h`}
      {estimate != null && (
        <Box sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'action.hover', overflow: 'hidden' }}>
          <Box sx={{ height: '100%',
            width: `${Math.min(100, (logged / estimate) * 100)}%`,
            bgcolor: logged > estimate ? 'error.main' : 'primary.main',
            transition: '0.3s' }}/>
        </Box>
      )}
    </Box>
  );
}

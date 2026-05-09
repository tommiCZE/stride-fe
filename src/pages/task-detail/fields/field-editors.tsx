import { useState, useRef, useEffect } from 'react';
import { Box, Menu, MenuItem, Popover, Typography, InputBase } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { USERS, PRIORITIES, TASK_TYPES, EPICS, SPRINTS, LABELS } from '../../../mocks/data';
import FluxAvatar from '../../../components/flux-avatar';
import PriorityIcon from '../../../components/icons/priority-icon';
import TypeIcon from '../../../components/icons/type-icon';
import { FieldPill } from './field-helpers';
import type { Task } from '../../../types';

type Updater = (fn: (t: Task) => Task) => void;

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

export function AssigneeEditor({ task, setTask }: { task: Task; setTask: Updater }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const assignee = task.assignee ? USERS.find(u => u.id === task.assignee) : null;

  return (
    <>
      <Box
        onClick={e => setAnchor(e.currentTarget)}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12.5, cursor: 'default',
          '&:hover': { bgcolor: 'action.hover' }, p: 0.5, mx: -0.5, borderRadius: 0.8 }}
      >
        {assignee ? (
          <><FluxAvatar user={assignee} size={20}/> {assignee.name}</>
        ) : (
          <FieldPill dashed>Přiřadit</FieldPill>
        )}
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { setTask(t => ({ ...t, assignee: undefined })); setAnchor(null); }}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Nepřiřazeno</Typography>
        </MenuItem>
        {USERS.map(u => (
          <MenuItem key={u.id} onClick={() => { setTask(t => ({ ...t, assignee: u.id })); setAnchor(null); }}
            selected={task.assignee === u.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FluxAvatar user={u} size={20}/>
              <Typography sx={{ fontSize: 12.5 }}>{u.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function PriorityEditor({ task, setTask }: { task: Task; setTask: Updater }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const prio = PRIORITIES.find(p => p.id === task.priority)!;

  return (
    <>
      <Box onClick={e => setAnchor(e.currentTarget)} sx={{ cursor: 'default', display: 'inline-flex' }}>
        <FieldPill color={prio.color}>
          <PriorityIcon priority={task.priority}/> {prio.name}
        </FieldPill>
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        {PRIORITIES.map(p => (
          <MenuItem key={p.id} onClick={() => { setTask(t => ({ ...t, priority: p.id })); setAnchor(null); }}
            selected={task.priority === p.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PriorityIcon priority={p.id}/>
              <Typography sx={{ fontSize: 12.5 }}>{p.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function TypeEditor({ task, setTask }: { task: Task; setTask: Updater }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const type = TASK_TYPES.find(t => t.id === task.type)!;

  return (
    <>
      <Box onClick={e => setAnchor(e.currentTarget)} sx={{ cursor: 'default', display: 'inline-flex' }}>
        <FieldPill><TypeIcon type={task.type} size={13}/> {type.name}</FieldPill>
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        {TASK_TYPES.map(tt => (
          <MenuItem key={tt.id} onClick={() => { setTask(t => ({ ...t, type: tt.id })); setAnchor(null); }}
            selected={task.type === tt.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TypeIcon type={tt.id} size={14}/>
              <Typography sx={{ fontSize: 12.5 }}>{tt.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function EpicEditor({ task, setTask }: { task: Task; setTask: Updater }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const projectEpics = EPICS.filter(e => e.project === task.project);
  const epic = task.epic ? projectEpics.find(e => e.id === task.epic) : null;

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
        <MenuItem onClick={() => { setTask(t => ({ ...t, epic: undefined })); setAnchor(null); }}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Žádný epic</Typography>
        </MenuItem>
        {projectEpics.map(e => (
          <MenuItem key={e.id} onClick={() => { setTask(t => ({ ...t, epic: e.id })); setAnchor(null); }}
            selected={task.epic === e.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: e.color, flexShrink: 0 }}/>
              <Typography sx={{ fontSize: 12.5 }}>{e.title}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function SprintEditor({ task, setTask }: { task: Task; setTask: Updater }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const projectSprints = SPRINTS.filter(s => s.project === task.project);
  const sprint = task.sprint ? projectSprints.find(s => s.id === task.sprint) : null;

  return (
    <>
      <Box onClick={e => setAnchor(e.currentTarget)}
        sx={{ cursor: 'default', '&:hover': { bgcolor: 'action.hover' }, px: 0.5, borderRadius: 0.8, display: 'inline-flex' }}>
        <Typography sx={{ fontSize: 12.5 }}>
          {sprint ? sprint.name.split(' — ')[0] : <Box component="span" sx={{ color: 'text.disabled' }}>Nastavit sprint</Box>}
        </Typography>
      </Box>
      <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { setTask(t => ({ ...t, sprint: undefined })); setAnchor(null); }}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Backlog</Typography>
        </MenuItem>
        {projectSprints.map(s => (
          <MenuItem key={s.id} onClick={() => { setTask(t => ({ ...t, sprint: s.id })); setAnchor(null); }}
            selected={task.sprint === s.id}>
            <Typography sx={{ fontSize: 12.5 }}>{s.name.split(' — ')[0]}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function LabelsEditor({ task, setTask }: { task: Task; setTask: Updater }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const toggle = (lid: string) => {
    setTask(t => ({
      ...t,
      labels: t.labels.includes(lid) ? t.labels.filter(l => l !== lid) : [...t.labels, lid],
    }));
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
        {task.labels.map(lid => {
          const l = LABELS.find(x => x.id === lid)!;
          return <FieldPill key={lid} color={l.color}>{l.name}</FieldPill>;
        })}
        <Box onClick={e => setAnchor(e.currentTarget)}>
          <FieldPill dashed>+ přidat</FieldPill>
        </Box>
      </Box>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75, maxWidth: 220 }}>
          {LABELS.map(l => {
            const active = task.labels.includes(l.id);
            return (
              <Box
                key={l.id}
                onClick={() => toggle(l.id)}
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.5,
                  px: 0.75, py: 0.35, borderRadius: 0.8, fontSize: 12, cursor: 'default',
                  transition: 'all 0.12s',
                  bgcolor: active ? alpha(l.color, 0.13) : 'action.hover',
                  color: active ? l.color : 'text.secondary',
                  border: 1,
                  borderColor: active ? alpha(l.color, 0.4) : 'transparent',
                  fontWeight: active ? 600 : 400,
                  '&:hover': { bgcolor: active ? alpha(l.color, 0.2) : 'action.selected' },
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: active ? l.color : 'text.disabled', flexShrink: 0 }}/>
                {l.name}
              </Box>
            );
          })}
        </Box>
      </Popover>
    </>
  );
}

export function EstimateEditor({ task, setTask }: { task: Task; setTask: Updater }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(task.estimate ?? ''));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(String(task.estimate ?? '')); }, [task.estimate]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    setEditing(false);
    const val = parseFloat(draft);
    if (!isNaN(val) && val >= 0) setTask(t => ({ ...t, estimate: val }));
    else if (draft.trim() === '') setTask(t => ({ ...t, estimate: undefined }));
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
        sx={{ border: 1, borderColor: 'primary.main', borderRadius: 0.5, px: 0.5, fontSize: 12.5, fontWeight: 600 }}
        placeholder="h"
      />
    );
  }

  return (
    <Typography
      onClick={() => setEditing(true)}
      sx={{ fontSize: 12.5, fontWeight: 600, cursor: 'text', px: 0.5, borderRadius: 0.5,
        '&:hover': { bgcolor: 'action.hover' } }}
    >
      {task.estimate != null ? `${task.estimate} h` : <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>}
    </Typography>
  );
}

export function DueDateEditor({ task, setTask }: { task: Task; setTask: Updater }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.showPicker?.(); }, [editing]);

  const commit = (val: string) => {
    setEditing(false);
    setTask(t => ({ ...t, due: val || undefined }));
  };

  const display = task.due
    ? new Date(task.due).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
    : null;

  if (editing) {
    return (
      <InputBase
        inputRef={inputRef}
        type="date"
        defaultValue={task.due ?? ''}
        onBlur={e => commit(e.target.value)}
        onChange={e => { if (e.target.value) commit(e.target.value); }}
        autoFocus
        sx={{ border: 1, borderColor: 'primary.main', borderRadius: 0.5, px: 0.5, fontSize: 12.5 }}
      />
    );
  }

  return (
    <Typography
      onClick={() => setEditing(true)}
      sx={{ fontSize: 12.5, cursor: 'text', px: 0.5, borderRadius: 0.5,
        '&:hover': { bgcolor: 'action.hover' },
        color: task.due ? 'text.primary' : 'text.disabled' }}
    >
      {display ?? '—'}
    </Typography>
  );
}

export function LoggedBar({ logged, estimate }: { logged: number; estimate?: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12.5, fontWeight: 600 }}>
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

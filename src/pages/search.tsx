import { useEffect, useMemo, useState } from 'react';
import { Box, Chip, IconButton, InputBase, Menu, MenuItem, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useTeamMembers } from '../hooks/useTeam';
import { useSearch } from '../hooks/useSearch';
import FluxAvatar from '../components/flux-avatar';
import TypeIcon from '../components/icons/type-icon';
import PriorityIcon from '../components/icons/priority-icon';
import { SearchIcon, CloseIcon } from '../components/icons/icons';
import { BOARD_STATUSES } from '../constants/statuses';
import { TASK_TYPES } from '../constants/taskTypes';
import { PRIORITIES } from '../constants/priorities';
import type { ProjectDto, TaskSummaryDto, UserDto } from '../api/types';
import type { SearchFilters } from '../api/search';

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <Box
        component="span"
        sx={{
          bgcolor: theme => alpha(theme.palette.warning.light, 0.45),
          color: 'text.primary',
          borderRadius: 0.5,
          px: 0.25,
        }}
      >
        {text.slice(idx, idx + query.length)}
      </Box>
      {text.slice(idx + query.length)}
    </>
  );
}

function MultiSelectChip({ label, options, selected, onChange }: {
  label: string;
  options: Array<{ id: string; name: string; color?: string }>;
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const selLabel = selected.length === 0
    ? label
    : selected.length === 1
      ? options.find(o => o.id === selected[0])?.name ?? label
      : `${label} · ${selected.length}`;
  const active = selected.length > 0;

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  };

  return (
    <>
      <Chip
        size="small"
        label={selLabel}
        onClick={e => setAnchor(e.currentTarget)}
        onDelete={active ? () => onChange([]) : undefined}
        variant={active ? 'filled' : 'outlined'}
        color={active ? 'primary' : 'default'}
      />
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {options.map(o => (
          <MenuItem
            key={o.id}
            onClick={() => toggle(o.id)}
            selected={selected.includes(o.id)}
            sx={{ fontSize: 14, gap: 1 }}
          >
            {o.color && (
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: o.color }}/>
            )}
            {o.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function TaskRow({ task, projects, members, query }: {
  task: TaskSummaryDto;
  projects: ProjectDto[];
  members: UserDto[];
  query: string;
}) {
  const [, setSearchParams] = useSearchParams();
  const project = projects.find(p => p.id === task.projectId);
  const assignee = task.assigneeId ? members.find(m => m.id === task.assigneeId) : null;
  const status = BOARD_STATUSES.find(s => s.id === task.status);

  const open = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('task', task.key);
      return next;
    });
  };

  return (
    <Box
      onClick={open}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1, borderRadius: 1,
        cursor: 'default',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <TypeIcon type={task.type} size={14}/>
      <Typography sx={{
        fontFamily: 'ui-monospace, monospace', fontSize: 13, fontWeight: 600,
        color: 'text.disabled', width: 80, flexShrink: 0,
      }}>
        {task.key}
      </Typography>
      <Typography sx={{ fontSize: 13, flex: 1, minWidth: 0,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <Highlight text={task.title} query={query}/>
      </Typography>
      <PriorityIcon priority={task.priority}/>
      {status && (
        <Box sx={{
          px: 0.75, py: 0.1, borderRadius: 0.75,
          fontSize: 14, fontWeight: 700,
          color: status.color, bgcolor: alpha(status.color, 0.13),
          border: 1, borderColor: alpha(status.color, 0.4),
          flexShrink: 0,
        }}>
          {status.name}
        </Box>
      )}
      {project && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0,
          color: 'text.disabled', fontSize: 13 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: 0.4, bgcolor: project.color }}/>
          {project.key}
        </Box>
      )}
      {assignee ? <FluxAvatar user={assignee} size={20}/>
        : <Box sx={{ width: 20, height: 20 }}/>}
    </Box>
  );
}

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';

  const [draft, setDraft] = useState(initialQ);
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');

  useEffect(() => { setDraft(initialQ); }, [initialQ]);

  const filters: SearchFilters = useMemo(() => ({
    q: initialQ,
    projectIds: projectIds.length ? projectIds : undefined,
    types: types.length ? types : undefined,
    statuses: statuses.length ? statuses : undefined,
    assigneeIds: assigneeIds.length ? assigneeIds : undefined,
    dueFrom: dueFrom || undefined,
    dueTo: dueTo || undefined,
  }), [initialQ, projectIds, types, statuses, assigneeIds, dueFrom, dueTo]);

  const { results, isLoading, total } = useSearch(filters);
  const { data: projects = [] } = useProjects();
  const { data: members = [] } = useTeamMembers();

  const commitQuery = (q: string) => {
    const next = new URLSearchParams(searchParams);
    if (q.trim()) next.set('q', q.trim()); else next.delete('q');
    setSearchParams(next, { replace: true });
  };

  const hasAnyFilter = projectIds.length || types.length || statuses.length ||
    assigneeIds.length || dueFrom || dueTo;

  const clearAll = () => {
    setProjectIds([]); setTypes([]); setStatuses([]);
    setAssigneeIds([]); setDueFrom(''); setDueTo('');
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      bgcolor: 'background.default' }}>
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 1,
        px: { xs: 2, md: 4 }, pt: 2.5, pb: 1.5,
        bgcolor: 'background.default',
        borderBottom: 1, borderColor: 'divider',
      }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 1, borderRadius: 1.5,
          bgcolor: 'background.paper', border: 1, borderColor: 'divider',
          maxWidth: 720,
        }}>
          <SearchIcon/>
          <InputBase
            autoFocus
            fullWidth
            value={draft}
            placeholder="Hledat tasky, projekty, lidi…"
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') commitQuery(draft);
              if (e.key === 'Escape') { setDraft(''); commitQuery(''); }
            }}
            sx={{ fontSize: 14 }}
          />
          {draft && (
            <IconButton size="small" onClick={() => { setDraft(''); commitQuery(''); }}>
              <CloseIcon/>
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5, flexWrap: 'wrap' }}>
          <MultiSelectChip
            label="Projekt"
            options={projects.map(p => ({ id: p.id, name: p.name, color: p.color }))}
            selected={projectIds} onChange={setProjectIds}
          />
          <MultiSelectChip
            label="Typ"
            options={TASK_TYPES.map(t => ({ id: t.id.toUpperCase(), name: t.name, color: t.color }))}
            selected={types} onChange={setTypes}
          />
          <MultiSelectChip
            label="Status"
            options={BOARD_STATUSES.map(s => ({ id: s.id, name: s.name, color: s.color }))}
            selected={statuses} onChange={setStatuses}
          />
          <MultiSelectChip
            label="Assignee"
            options={members.map(m => ({ id: m.id, name: m.name, color: m.color }))}
            selected={assigneeIds} onChange={setAssigneeIds}
          />
          <Chip
            size="small"
            label={dueFrom || dueTo ? `Due ${dueFrom || '*'} → ${dueTo || '*'}` : 'Due range'}
            variant={dueFrom || dueTo ? 'filled' : 'outlined'}
            color={dueFrom || dueTo ? 'primary' : 'default'}
            onClick={() => {
              const f = window.prompt('Due from (YYYY-MM-DD)', dueFrom) ?? dueFrom;
              const t = window.prompt('Due to (YYYY-MM-DD)', dueTo) ?? dueTo;
              setDueFrom(f); setDueTo(t);
            }}
            onDelete={dueFrom || dueTo ? () => { setDueFrom(''); setDueTo(''); } : undefined}
          />
          {hasAnyFilter && (
            <Chip
              size="small" label="Vyčistit filtry" variant="outlined"
              onClick={clearAll}
            />
          )}
          <Box sx={{ flex: 1 }}/>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            {isLoading ? 'Hledám…' : `${total} ${total === 1 ? 'výsledek' : total < 5 ? 'výsledky' : 'výsledků'}`}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 1.5, md: 3 }, py: 2 }}>
        {!initialQ && !hasAnyFilter && (
          <EmptyState
            title="Začni hledat"
            hint="Zadej slovo nebo klíč tasku (např. 'login' nebo 'WEB-142') a stiskni Enter."
          />
        )}

        {(initialQ || hasAnyFilter) && total === 0 && !isLoading && (
          <EmptyState
            title="Nic jsme nenašli"
            hint="Zkus jiné slovo nebo méně filtrů."
          />
        )}

        {results.tasks.length > 0 && (
          <ResultGroup label="Úkoly" count={results.tasks.length}>
            {results.tasks.map(t => (
              <TaskRow key={t.id} task={t} projects={projects} members={members} query={initialQ}/>
            ))}
          </ResultGroup>
        )}

        {results.projects.length > 0 && (
          <ResultGroup label="Projekty" count={results.projects.length}>
            {results.projects.map(p => (
              <Box
                key={p.id}
                onClick={() => navigate(`/projects/${p.key}/board`)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
                  px: 1.5, py: 1, borderRadius: 1, cursor: 'default',
                  '&:hover': { bgcolor: 'action.hover' } }}
              >
                <Box sx={{ width: 22, height: 22, borderRadius: 0.7, bgcolor: p.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'common.white', fontSize: 13, fontWeight: 700 }}>
                  {p.key[0]}
                </Box>
                <Typography sx={{ fontSize: 13, flex: 1 }}>
                  <Highlight text={p.name} query={initialQ}/>
                </Typography>
                <Typography sx={{ fontSize: 13, color: 'text.disabled',
                  fontFamily: 'ui-monospace, monospace' }}>
                  {p.key}
                </Typography>
                <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>
                  {p.taskCount} tasků · {p.openCount} otevřených
                </Typography>
              </Box>
            ))}
          </ResultGroup>
        )}

        {results.people.length > 0 && (
          <ResultGroup label="Lidé" count={results.people.length}>
            {results.people.map(u => (
              <Box
                key={u.id}
                onClick={() => navigate('/team')}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
                  px: 1.5, py: 1, borderRadius: 1, cursor: 'default',
                  '&:hover': { bgcolor: 'action.hover' } }}
              >
                <FluxAvatar user={u} size={26}/>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    <Highlight text={u.name} query={initialQ}/>
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    {u.email}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>
                  {u.workspaceRole}
                </Typography>
              </Box>
            ))}
          </ResultGroup>
        )}
      </Box>
    </Box>
  );
}

function ResultGroup({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{
        fontSize: 14, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'text.disabled',
        px: 1.5, mb: 0.5,
      }}>
        {label} <Box component="span" sx={{ color: 'text.secondary' }}>· {count}</Box>
      </Typography>
      {children}
    </Box>
  );
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <Box sx={{
      maxWidth: 480, mx: 'auto', mt: 8, textAlign: 'center',
      color: 'text.secondary',
    }}>
      <Box sx={{ display: 'inline-flex', mb: 1.5, p: 1.5, borderRadius: '50%',
        bgcolor: 'action.hover', color: 'text.disabled' }}>
        <SearchIcon/>
      </Box>
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 14 }}>{hint}</Typography>
    </Box>
  );
}

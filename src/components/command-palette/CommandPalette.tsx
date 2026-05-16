import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Dialog, InputBase, List, ListItemButton, Typography, useTheme,
} from '@mui/material';
import { useProjects } from '../../hooks/useProjects';
import { useAllProjectTasks } from '../../hooks/useTasks';
import { useTeamMembers } from '../../hooks/useTeam';
import FluxAvatar from '../flux-avatar';
import {
  SearchIcon, DashboardIcon, CheckIcon, CalendarIcon, ReportsIcon,
  TeamIcon, SettingsIcon, BellIcon,
} from '../icons/icons';
import type { ProjectDto, TaskSummaryDto, UserDto } from '../../api/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

type ActionKey =
  | 'dashboard' | 'inbox' | 'my-work' | 'calendar'
  | 'reports' | 'team' | 'settings' | 'profile';

interface NavAction {
  id: string;
  key: ActionKey;
  label: string;
  path: string;
  icon: ReactElement;
}

interface ResultBase {
  id: string;
  score: number;
  label: string;
  sublabel?: string;
}

interface TaskResult extends ResultBase {
  kind: 'task';
  task: TaskSummaryDto;
  projectKey: string | undefined;
}

interface ProjectResult extends ResultBase {
  kind: 'project';
  project: ProjectDto;
}

interface UserResult extends ResultBase {
  kind: 'user';
  user: UserDto;
}

interface ActionResult extends ResultBase {
  kind: 'action';
  action: NavAction;
}

type Result = TaskResult | ProjectResult | UserResult | ActionResult;

const NAV_ACTIONS: NavAction[] = [
  { id: 'nav-dashboard', key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { id: 'nav-inbox',     key: 'inbox',     label: 'Inbox',     path: '/inbox',     icon: <BellIcon /> },
  { id: 'nav-mywork',    key: 'my-work',   label: 'My Work',   path: '/my-work',   icon: <CheckIcon /> },
  { id: 'nav-calendar',  key: 'calendar',  label: 'Kalendář',  path: '/calendar',  icon: <CalendarIcon /> },
  { id: 'nav-reports',   key: 'reports',   label: 'Reporty',   path: '/reports',   icon: <ReportsIcon /> },
  { id: 'nav-team',      key: 'team',      label: 'Tým',       path: '/settings/members', icon: <TeamIcon /> },
  { id: 'nav-profile',   key: 'profile',   label: 'Můj profil', path: '/profile',         icon: <TeamIcon /> },
  { id: 'nav-settings',  key: 'settings',  label: 'Nastavení',  path: '/settings',        icon: <SettingsIcon /> },
];

const MAX_RESULTS = 8;

/**
 * Score a haystack against a needle.
 * Higher = better match. 0 = no match.
 * Prefix matches rank above contains; key-prefix matches (e.g. "WEB-12")
 * get a small boost so typing a task key surfaces tasks first.
 */
function scoreMatch(haystack: string | null | undefined, needle: string): number {
  if (!haystack) return 0;
  if (!needle) return 1;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (h === n) return 100;
  if (h.startsWith(n)) return 60;
  const idx = h.indexOf(n);
  if (idx >= 0) return 30 - Math.min(idx, 20);
  return 0;
}

function bestScore(parts: (string | null | undefined)[], needle: string, boosts: number[] = []): number {
  let best = 0;
  parts.forEach((p, i) => {
    const s = scoreMatch(p, needle) + (boosts[i] ?? 0);
    if (s > best) best = s;
  });
  return best;
}

export default function CommandPalette({ open, onClose }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const { data: projects = [] } = useProjects();
  const { data: members = [] } = useTeamMembers();
  const projectIds = useMemo(() => projects.map(p => p.id), [projects]);
  const { data: tasks = [] } = useAllProjectTasks(projectIds);

  // Reset state every time the dialog re-opens so the user starts fresh.
  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlight(0);
    }
  }, [open]);

  const projectKeyById = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach(p => map.set(p.id, p.key));
    return map;
  }, [projects]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim();

    // No query → show navigation actions as the default "recent" pick.
    if (!q) {
      return NAV_ACTIONS.slice(0, MAX_RESULTS).map<ActionResult>(a => ({
        id: a.id,
        kind: 'action',
        score: 1,
        label: a.label,
        action: a,
      }));
    }

    const out: Result[] = [];

    // Tasks: match against key + title, with a tiny boost on key-prefix.
    for (const t of tasks) {
      const score = bestScore([t.key, t.title], q, [10, 0]);
      if (score > 0) {
        out.push({
          id: `task-${t.id}`,
          kind: 'task',
          score,
          label: t.title,
          sublabel: t.key,
          task: t,
          projectKey: projectKeyById.get(t.projectId),
        });
      }
    }

    for (const p of projects) {
      const score = bestScore([p.key, p.name], q, [5, 0]);
      if (score > 0) {
        out.push({
          id: `project-${p.id}`,
          kind: 'project',
          score,
          label: p.name,
          sublabel: p.key,
          project: p,
        });
      }
    }

    for (const u of members) {
      const score = bestScore([u.name, u.email], q);
      if (score > 0) {
        out.push({
          id: `user-${u.id}`,
          kind: 'user',
          score,
          label: u.name,
          sublabel: u.email,
          user: u,
        });
      }
    }

    for (const a of NAV_ACTIONS) {
      const score = bestScore([a.label], q);
      if (score > 0) {
        out.push({
          id: a.id,
          kind: 'action',
          score,
          label: a.label,
          action: a,
        });
      }
    }

    out.sort((a, b) => b.score - a.score);
    return out.slice(0, MAX_RESULTS);
  }, [query, tasks, projects, members, projectKeyById]);

  // Clamp highlight whenever the result set shrinks/grows.
  useEffect(() => {
    if (highlight >= results.length) setHighlight(0);
  }, [results.length, highlight]);

  // Scroll the highlighted row into view on arrow-key navigation.
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${highlight}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlight]);

  const activate = (r: Result) => {
    onClose();
    switch (r.kind) {
      case 'task':
        setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          next.set('task', r.task.key);
          return next;
        });
        break;
      case 'project':
        navigate(`/projects/${r.project.key}/board`);
        break;
      case 'user':
        navigate('/team');
        break;
      case 'action':
        navigate(r.action.path);
        break;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => (results.length === 0 ? 0 : (h + 1) % results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => (results.length === 0 ? 0 : (h - 1 + results.length) % results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = results[highlight];
      if (r) activate(r);
    }
    // Escape is handled by the global shortcut hook + Dialog onClose.
  };

  // Group results in display order, preserving sort.
  const grouped = useMemo(() => {
    const groups: { title: string; items: Result[] }[] = [];
    const titleFor = (r: Result) =>
      r.kind === 'task' ? 'Úkoly'
      : r.kind === 'project' ? 'Projekty'
      : r.kind === 'user' ? 'Lidé'
      : 'Navigace';
    for (const r of results) {
      const title = titleFor(r);
      let g = groups.find(x => x.title === title);
      if (!g) { g = { title, items: [] }; groups.push(g); }
      g.items.push(r);
    }
    return groups;
  }, [results]);

  // Flat index → so highlight maps correctly across grouped render.
  const flatIndex = (r: Result) => results.indexOf(r);

  const activeId = results[highlight]?.id;
  const listboxId = 'command-palette-listbox';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-label="Rychlé hledání"
      slotProps={{ paper: { sx: { borderRadius: 1.5, overflow: 'hidden' } } }}
    >
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 2, py: 1.25,
          borderBottom: 1, borderColor: 'divider',
        }}
      >
        <Box aria-hidden="true" sx={{ display: 'flex', color: 'text.secondary' }}>
          <SearchIcon />
        </Box>
        <InputBase
          inputRef={inputRef}
          autoFocus
          fullWidth
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Hledat úkoly, projekty, lidi…"
          inputProps={{
            role: 'combobox',
            'aria-expanded': results.length > 0,
            'aria-controls': listboxId,
            'aria-autocomplete': 'list',
            'aria-activedescendant': activeId,
            'aria-label': 'Hledat úkoly, projekty, lidi',
          }}
          sx={{ fontSize: 14, '& input': { py: 0.5 } }}
        />
        <Box
          sx={{
            fontSize: 14, fontWeight: 600,
            px: 0.75, py: 0.25,
            borderRadius: 0.75,
            border: 1, borderColor: 'divider',
            color: 'text.secondary',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          }}
        >
          ESC
        </Box>
      </Box>

      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {results.length === 0 ? (
          <Box
            role="status"
            aria-live="polite"
            sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}
          >
            <Typography sx={{ fontSize: 13 }}>Žádné výsledky</Typography>
          </Box>
        ) : (
          <List
            ref={listRef}
            dense
            disablePadding
            id={listboxId}
            role="listbox"
            aria-label="Výsledky hledání"
          >
            {grouped.map(group => (
              <Box
                key={group.title}
                component="li"
                role="group"
                aria-label={group.title}
                sx={{ listStyle: 'none' }}
              >
                <Typography
                  aria-hidden="true"
                  sx={{
                    px: 2, pt: 1.25, pb: 0.5,
                    fontSize: 14, fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: 'text.disabled',
                  }}
                >
                  {group.title}
                </Typography>
                {group.items.map(r => {
                  const idx = flatIndex(r);
                  const active = idx === highlight;
                  return (
                    <ListItemButton
                      key={r.id}
                      id={r.id}
                      data-idx={idx}
                      selected={active}
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => activate(r)}
                      role="option"
                      aria-selected={active}
                      sx={{
                        px: 2, py: 0.75, gap: 1.25, minHeight: 36,
                        '&.Mui-selected': {
                          bgcolor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <ResultIcon result={r} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 13, fontWeight: 500,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}
                        >
                          {r.label}
                        </Typography>
                        {r.sublabel && (
                          <Typography
                            sx={{
                              fontSize: 13, color: 'text.secondary',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}
                          >
                            {renderSublabel(r)}
                          </Typography>
                        )}
                      </Box>
                      <ResultRightLabel result={r} />
                    </ListItemButton>
                  );
                })}
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Dialog>
  );
}

function renderSublabel(r: Result): string {
  if (r.kind === 'task') {
    return r.projectKey ? `${r.sublabel} · ${r.projectKey}` : (r.sublabel ?? '');
  }
  return r.sublabel ?? '';
}

function ResultIcon({ result }: { result: Result }) {
  if (result.kind === 'task') {
    return (
      <Box
        sx={{
          width: 22, height: 22, borderRadius: 0.75,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: 'action.hover', color: 'text.secondary',
          fontSize: 14, fontWeight: 700,
        }}
      >
        T
      </Box>
    );
  }
  if (result.kind === 'project') {
    const p = result.project;
    return (
      <Box
        sx={{
          width: 22, height: 22, borderRadius: 0.75,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: p.color, color: '#fff',
          fontSize: 13, fontWeight: 700,
        }}
      >
        {p.key[0]}
      </Box>
    );
  }
  if (result.kind === 'user') {
    return <FluxAvatar user={result.user} size={22} />;
  }
  // action
  return (
    <Box sx={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
      {result.action.icon}
    </Box>
  );
}

function ResultRightLabel({ result }: { result: Result }) {
  const text =
    result.kind === 'task' ? 'Úkol'
    : result.kind === 'project' ? 'Projekt'
    : result.kind === 'user' ? 'Osoba'
    : 'Navigace';
  return (
    <Typography sx={{ fontSize: 14, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
      {text}
    </Typography>
  );
}

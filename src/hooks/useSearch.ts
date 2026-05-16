import { useMemo } from 'react';
import { useProjects } from './useProjects';
import { useAllProjectTasks } from './useTasks';
import { useTeamMembers } from './useTeam';
import type { SearchFilters, SearchResults } from '../api/search';

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
    const s = scoreMatch(p, needle);
    const score = s === 0 ? 0 : s + (boosts[i] ?? 0);
    if (score > best) best = score;
  });
  return best;
}

interface UseSearchReturn {
  results: SearchResults;
  isLoading: boolean;
  total: number;
}

export function useSearch(filters: SearchFilters): UseSearchReturn {
  const { data: projects = [], isLoading: lp } = useProjects();
  const projectIds = useMemo(() => projects.map(p => p.id), [projects]);
  const { data: tasks = [], isLoading: lt } = useAllProjectTasks(projectIds);
  const { data: members = [], isLoading: lm } = useTeamMembers();

  const results = useMemo<SearchResults>(() => {
    const q = filters.q.trim();
    if (!q && !filters.projectIds?.length && !filters.types?.length &&
        !filters.statuses?.length && !filters.assigneeIds?.length &&
        !filters.dueFrom && !filters.dueTo) {
      return { tasks: [], projects: [], people: [] };
    }

    const projectIdSet = filters.projectIds?.length ? new Set(filters.projectIds) : null;
    const typeSet = filters.types?.length ? new Set(filters.types) : null;
    const statusSet = filters.statuses?.length ? new Set(filters.statuses) : null;
    const assigneeSet = filters.assigneeIds?.length ? new Set(filters.assigneeIds) : null;

    const taskMatches: Array<{ t: typeof tasks[number]; score: number }> = [];
    for (const t of tasks) {
      if (projectIdSet && !projectIdSet.has(t.projectId)) continue;
      if (typeSet && !typeSet.has(t.type)) continue;
      if (statusSet && !statusSet.has(t.status)) continue;
      if (assigneeSet && (t.assigneeId == null || !assigneeSet.has(t.assigneeId))) continue;
      if (filters.dueFrom && (!t.dueDate || t.dueDate < filters.dueFrom)) continue;
      if (filters.dueTo && (!t.dueDate || t.dueDate > filters.dueTo)) continue;
      const score = q ? bestScore([t.key, t.title, t.assigneeName], q, [10, 0, -5]) : 1;
      if (score > 0) taskMatches.push({ t, score });
    }

    const projMatches: Array<{ p: typeof projects[number]; score: number }> = [];
    for (const p of projects) {
      if (projectIdSet && !projectIdSet.has(p.id)) continue;
      const score = q ? bestScore([p.key, p.name], q, [5, 0]) : 1;
      if (score > 0) projMatches.push({ p, score });
    }

    const peopleMatches: Array<{ u: typeof members[number]; score: number }> = [];
    for (const u of members) {
      const score = q ? bestScore([u.name, u.email, u.username], q) : 0;
      if (score > 0) peopleMatches.push({ u, score });
    }

    taskMatches.sort((a, b) => b.score - a.score);
    projMatches.sort((a, b) => b.score - a.score);
    peopleMatches.sort((a, b) => b.score - a.score);

    return {
      tasks: taskMatches.slice(0, 200).map(x => x.t),
      projects: projMatches.slice(0, 50).map(x => x.p),
      people: peopleMatches.slice(0, 50).map(x => x.u),
    };
  }, [filters, projects, tasks, members]);

  return {
    results,
    isLoading: lp || lt || lm,
    total: results.tasks.length + results.projects.length + results.people.length,
  };
}

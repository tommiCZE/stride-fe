---
name: stride-query
description: Implement API clients and TanStack Query hooks for the Stride project. Use this skill when adding API calls, fetching data from the backend, creating query hooks, mutations, or wiring up the REST API (http://localhost:8080). Invoke for tasks like "fetch tasks from API", "add a mutation to create a project", "implement the API hook for X", "replace mock data with real API", "add TanStack Query for Y". Ensures correct patterns for the Stride Axios instance, JWT auth, QueryClient setup, and React Query v5 syntax.
---

# Stride API + TanStack Query Patterns

You are adding data fetching to the Stride frontend. The backend is Spring Boot REST at `http://localhost:8080`, authenticated with JWT Bearer tokens.

## Architecture

```
src/api/
├── axios.ts          # Shared Axios instance (already exists, DO NOT recreate)
├── tasks.ts          # Task API functions
├── projects.ts       # Project API functions
└── users.ts          # User/team API functions

src/hooks/            # (create if not present)
├── useTasks.ts
├── useProjects.ts
└── ...
```

## The Axios instance

`src/api/axios.ts` already exists — import from it, never create a new axios instance:

```ts
import api from './axios';  // JWT interceptor is already wired
```

## API client file pattern

One file per resource in `src/api/`. Export plain async functions (not hooks):

```ts
// src/api/tasks.ts
import api from './axios';
import type { Task } from '../types';

export interface CreateTaskPayload {
  title: string;
  projectId: string;
  status: string;
  priority: string;
  assigneeId?: string;
}

export async function fetchTasks(projectId: string): Promise<Task[]> {
  const { data } = await api.get<Task[]>(`/api/projects/${projectId}/tasks`);
  return data;
}

export async function fetchTask(taskId: string): Promise<Task> {
  const { data } = await api.get<Task>(`/api/tasks/${taskId}`);
  return data;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await api.post<Task>('/api/tasks', payload);
  return data;
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<Task> {
  const { data } = await api.patch<Task>(`/api/tasks/${id}`, patch);
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/api/tasks/${id}`);
}
```

Rules:
- Destructure `{ data }` from axios response — never return the full AxiosResponse
- Use generic type on axios method: `api.get<Task[]>(...)`
- Export payload interfaces alongside the functions
- No TanStack Query logic here — keep API layer pure

## TanStack Query hook pattern

Query hooks live in `src/hooks/` or inline in the component if used only once:

```ts
// src/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import type { CreateTaskPayload } from '../api/tasks';

// Query key factory — keep keys centralized
export const taskKeys = {
  all: ['tasks'] as const,
  byProject: (projectId: string) => ['tasks', projectId] as const,
  detail: (taskId: string) => ['tasks', 'detail', taskId] as const,
};

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId),
    queryFn: () => fetchTasks(projectId),
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => fetchTask(taskId),
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(newTask.project) });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Task> }) =>
      updateTask(id, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(taskKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(updated.project) });
    },
  });
}
```

## Using hooks in components

```tsx
function Board({ projectId }: { projectId: string }) {
  const { data: tasks = [], isPending, isError } = useTasks(projectId);
  const createTask = useCreateTask();

  if (isPending) return <CircularProgress />;
  if (isError) return <Alert severity="error">Nepodařilo se načíst tasky</Alert>;

  const handleCreate = () => {
    createTask.mutate({ title: 'Nový task', projectId, status: 'todo', priority: 'medium' });
  };

  return ( ... );
}
```

## QueryClient setup (main.tsx)

`src/main.tsx` should already have a QueryClient. If not:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,       // 1 minute
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
```

## Mock data fallback

While the backend endpoint isn't ready, fall back to mock data transparently:

```ts
// src/api/tasks.ts
import { mockTasks } from '../mocks/data';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function fetchTasks(projectId: string): Promise<Task[]> {
  if (USE_MOCK) return mockTasks.filter(t => t.project === projectId);
  const { data } = await api.get<Task[]>(`/api/projects/${projectId}/tasks`);
  return data;
}
```

Or use a simpler approach — if the request fails, return mock data:

```ts
export async function fetchTasks(projectId: string): Promise<Task[]> {
  try {
    const { data } = await api.get<Task[]>(`/api/projects/${projectId}/tasks`);
    return data;
  } catch {
    return mockTasks.filter(t => t.project === projectId);
  }
}
```

## React Query v5 syntax notes

TanStack Query v5 changed several APIs — use the new forms:

```ts
// v5 CORRECT
useQuery({ queryKey: [...], queryFn: ... })
useMutation({ mutationFn: ..., onSuccess: ... })
queryClient.invalidateQueries({ queryKey: [...] })

// v4 style — DO NOT use
useQuery([...], fetchFn)
useMutation(mutateFn)
queryClient.invalidateQueries([...])
```

## Checklist

- [ ] API functions in `src/api/<resource>.ts`, not in components
- [ ] Hooks in `src/hooks/` or component file if single-use
- [ ] Query key factory exported for cache invalidation
- [ ] `enabled` guard on queries that depend on a param
- [ ] `onSuccess` invalidates or updates affected queries
- [ ] No `any` in API response types — use proper generics
- [ ] Mock fallback for endpoints not yet implemented

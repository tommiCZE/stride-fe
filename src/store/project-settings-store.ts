import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useQuery, useQueryClient, useIsMutating } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { projectSettingsApi, type ProjectSettingsBlob } from '../api/project-settings';
import { projectsApi } from '../api/projects';
import { useMutationWithToast } from '../hooks/use-mutation-with-toast';
import { useProjects, projectKeys } from '../hooks/useProjects';
import type { UpdateProjectRequest } from '../api/types';

/* ===== Types ===== */
export type ProjectVisibility = 'private' | 'workspace' | 'public';
export type ProjectKind = 'scrum' | 'kanban' | 'bugtracker';
export type EstimateUnit = 'points' | 'hours' | 'tshirt';
export type DefaultView = 'board' | 'backlog' | 'list' | 'calendar';
export type DigestCadence = 'realtime' | 'daily' | 'weekly' | 'off';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export interface Holiday {
  date: string;   // ISO date YYYY-MM-DD
  name: string;
}

export interface WorkingHoursPolicy {
  days: number[];  // 1 = Monday … 7 = Sunday
  start: string;   // HH:mm
  end: string;     // HH:mm
  holidays: Holiday[];
}

export interface AutoTransitions {
  prOpened: TaskStatus | null;
  prMerged: TaskStatus | null;
  branchCreated: TaskStatus | null;
}

export type ProjectRoleId = 'project_admin' | 'contributor' | 'viewer';

export type PermissionKey =
  | 'task.edit'
  | 'task.delete'
  | 'comment.delete'
  | 'sprint.manage'
  | 'settings.manage'
  | 'member.manage'
  | 'integration.manage';

export type PermissionMatrix = Record<ProjectRoleId, Record<PermissionKey, boolean>>;

export interface ProjectSettings {
  // scalars on `projects` row
  description: string;
  category: string;
  kind: ProjectKind;
  visibility: ProjectVisibility;
  archived: boolean;
  slackChannel: string;
  defaultAssigneeId: string | null;
  estimateUnit: EstimateUnit;
  defaultTaskType: string;
  defaultPriority: string;
  sprintLengthWeeks: number;
  sprintCapacity: number;
  sprintStartWeekday: number;
  sprintRollover: 'backlog' | 'next' | 'ask';
  velocityBaseline: number;
  definitionOfDone: string[];

  // JSONB blob — small configurational data without identity
  permissions: PermissionMatrix;
  notifications: {
    channels: { inApp: boolean; email: boolean; slack: boolean };
    events: {
      taskAssigned: boolean;
      mention: boolean;
      statusChange: boolean;
      dueSoon: boolean;
      commentAdded: boolean;
      sprintUpdated: boolean;
    };
    digest: DigestCadence;
  };
  appearance: {
    defaultView: DefaultView;
    cardShowEstimate: boolean;
    cardShowLabels: boolean;
    cardShowAssignee: boolean;
    cardShowDue: boolean;
    cardColorBy: 'none' | 'priority' | 'type' | 'label';
    swimlanesBy: 'none' | 'assignee' | 'epic' | 'priority';
  };
  autoTransitions: AutoTransitions;
  workingHours: WorkingHoursPolicy;
  branchNamingTemplate: string;
}

const defaultPermissionMatrix: PermissionMatrix = {
  project_admin: {
    'task.edit': true,
    'task.delete': true,
    'comment.delete': true,
    'sprint.manage': true,
    'settings.manage': true,
    'member.manage': true,
    'integration.manage': true,
  },
  contributor: {
    'task.edit': true,
    'task.delete': false,
    'comment.delete': false,
    'sprint.manage': true,
    'settings.manage': false,
    'member.manage': false,
    'integration.manage': false,
  },
  viewer: {
    'task.edit': false,
    'task.delete': false,
    'comment.delete': false,
    'sprint.manage': false,
    'settings.manage': false,
    'member.manage': false,
    'integration.manage': false,
  },
};

function defaultBlob(): Required<ProjectSettingsBlob> {
  return {
    permissions: defaultPermissionMatrix,
    notifications: {
      channels: { inApp: true, email: true, slack: false },
      events: {
        taskAssigned: true,
        mention: true,
        statusChange: false,
        dueSoon: true,
        commentAdded: true,
        sprintUpdated: true,
      },
      digest: 'realtime',
    },
    appearance: {
      defaultView: 'board',
      cardShowEstimate: true,
      cardShowLabels: true,
      cardShowAssignee: true,
      cardShowDue: true,
      cardColorBy: 'priority',
      swimlanesBy: 'none',
    },
    autoTransitions: {
      prOpened: null,
      prMerged: null,
      branchCreated: null,
    },
    workingHours: {
      days: [1, 2, 3, 4, 5],
      start: '09:00',
      end: '17:00',
      holidays: [],
    },
    branchNamingTemplate: '{key}-{slug}',
  };
}

function defaults(): ProjectSettings {
  const blob = defaultBlob();
  return {
    description: '',
    category: 'engineering',
    kind: 'scrum',
    visibility: 'workspace',
    archived: false,
    slackChannel: '',
    defaultAssigneeId: null,
    estimateUnit: 'points',
    defaultTaskType: 'TASK',
    defaultPriority: 'MEDIUM',
    sprintLengthWeeks: 2,
    sprintCapacity: 40,
    sprintStartWeekday: 1,
    sprintRollover: 'backlog',
    velocityBaseline: 32,
    definitionOfDone: [],
    permissions: blob.permissions as PermissionMatrix,
    notifications: blob.notifications as ProjectSettings['notifications'],
    appearance: blob.appearance as ProjectSettings['appearance'],
    autoTransitions: blob.autoTransitions as AutoTransitions,
    workingHours: blob.workingHours as WorkingHoursPolicy,
    branchNamingTemplate: blob.branchNamingTemplate as string,
  };
}

/* ===== Local cache (offline) ===== */

interface ProjectSettingsStore {
  byProject: Record<string, ProjectSettings>;
  update: (projectKey: string, patch: Partial<ProjectSettings>) => void;
  reset: (projectKey: string) => void;
}

export const useProjectSettingsStore = create<ProjectSettingsStore>()(
  persist(
    (set) => ({
      byProject: {},
      update: (projectKey, patch) =>
        set(s => {
          const current = s.byProject[projectKey] ?? defaults();
          return { byProject: { ...s.byProject, [projectKey]: { ...current, ...patch } } };
        }),
      reset: (projectKey) =>
        set(s => ({ byProject: { ...s.byProject, [projectKey]: defaults() } })),
    }),
    { name: 'stride-project-settings' },
  ),
);

export const projectSettingsKeys = {
  all: ['project-settings'] as const,
  byKey: (key: string) => [...projectSettingsKeys.all, key] as const,
};

const SCALAR_KEYS = new Set<keyof ProjectSettings>([
  'description', 'category', 'kind', 'visibility', 'archived', 'slackChannel',
  'defaultAssigneeId', 'estimateUnit', 'defaultTaskType', 'defaultPriority',
  'sprintLengthWeeks', 'sprintCapacity', 'sprintStartWeekday', 'sprintRollover',
  'velocityBaseline', 'definitionOfDone',
]);

const BLOB_KEYS = new Set<keyof ProjectSettings>([
  'permissions', 'notifications', 'appearance', 'autoTransitions',
  'workingHours', 'branchNamingTemplate',
]);

/**
 * Hook for reading & writing the parts of project settings that aren't
 * first-class resources:
 *   - scalars stored as columns on `projects` (description, sprint config…)
 *   - small JSONB blob with permissions / notifications / appearance prefs
 *
 * List-based settings (members, statuses, automations, audit log, …) live
 * in their own tables and have dedicated hooks in
 * `src/hooks/useProjectSettingsResources.ts`.
 */
export function useProjectSettings(projectKey: string) {
  const cached = useProjectSettingsStore(s => s.byProject[projectKey]);
  const setCache = useProjectSettingsStore(s => s.update);
  const resetCache = useProjectSettingsStore(s => s.reset);
  const qc = useQueryClient();
  const { data: projects } = useProjects();
  const project = projects?.find(p => p.key === projectKey);

  const blobQuery = useQuery({
    queryKey: projectSettingsKeys.byKey(projectKey),
    queryFn: () => projectSettingsApi.get(projectKey),
    enabled: !!projectKey,
    staleTime: 1000 * 30,
    retry: 1,
  });

  const merged: ProjectSettings = {
    ...defaults(),
    ...cached,
    description:          project?.description          ?? cached?.description          ?? '',
    category:             project?.category             ?? cached?.category             ?? 'engineering',
    kind:                 (project?.kind as ProjectKind) ?? cached?.kind ?? 'scrum',
    visibility:           (project?.visibility as ProjectVisibility) ?? cached?.visibility ?? 'workspace',
    archived:             project?.archived             ?? cached?.archived             ?? false,
    slackChannel:         project?.slackChannel         ?? cached?.slackChannel         ?? '',
    defaultAssigneeId:    project?.defaultAssigneeId    ?? cached?.defaultAssigneeId    ?? null,
    estimateUnit:         (project?.estimateUnit as EstimateUnit) ?? cached?.estimateUnit ?? 'points',
    defaultTaskType:      project?.defaultTaskType      ?? cached?.defaultTaskType      ?? 'TASK',
    defaultPriority:      project?.defaultPriority      ?? cached?.defaultPriority      ?? 'MEDIUM',
    sprintLengthWeeks:    project?.sprintLengthWeeks    ?? cached?.sprintLengthWeeks    ?? 2,
    sprintCapacity:       project?.sprintCapacity       ?? cached?.sprintCapacity       ?? 40,
    sprintStartWeekday:   project?.sprintStartWeekday   ?? cached?.sprintStartWeekday   ?? 1,
    sprintRollover:       (project?.sprintRollover as 'backlog' | 'next' | 'ask') ?? cached?.sprintRollover ?? 'backlog',
    velocityBaseline:     project?.velocityBaseline     ?? cached?.velocityBaseline     ?? 32,
    definitionOfDone:     project?.definitionOfDone     ?? cached?.definitionOfDone     ?? [],
    permissions:    (blobQuery.data?.permissions   as PermissionMatrix | undefined)               ?? cached?.permissions    ?? defaultPermissionMatrix,
    notifications:  (blobQuery.data?.notifications as ProjectSettings['notifications'] | undefined) ?? cached?.notifications  ?? defaults().notifications,
    appearance:     (blobQuery.data?.appearance    as ProjectSettings['appearance']    | undefined) ?? cached?.appearance     ?? defaults().appearance,
    autoTransitions: (blobQuery.data?.autoTransitions as AutoTransitions | undefined)              ?? cached?.autoTransitions ?? defaults().autoTransitions,
    workingHours:   (blobQuery.data?.workingHours as WorkingHoursPolicy | undefined)               ?? cached?.workingHours   ?? defaults().workingHours,
    branchNamingTemplate: (blobQuery.data?.branchNamingTemplate as string | undefined)             ?? cached?.branchNamingTemplate ?? defaults().branchNamingTemplate,
  };

  // Mirror combined state into local persisted cache.
  useEffect(() => {
    if (project || blobQuery.data) {
      setCache(projectKey, merged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, blobQuery.data]);

  /* ----- Mutations: route each patch key to the right endpoint ----- */

  const projectMutation = useMutationWithToast({
    mutationKey: [...projectSettingsKeys.byKey(projectKey), 'project'],
    mutationFn: (body: UpdateProjectRequest) => {
      if (!project) return Promise.reject(new Error('Project not loaded'));
      return projectsApi.update(project.id, body);
    },
    errorMessage: 'Chyba při ukládání nastavení projektu.',
    onSettled: () => {
      qc.invalidateQueries({ queryKey: projectKeys.lists() });
      qc.invalidateQueries({ queryKey: projectKeys.byKey(projectKey) });
    },
  });

  const blobMutation = useMutationWithToast<
    ProjectSettingsBlob,
    unknown,
    Partial<ProjectSettingsBlob>,
    { prev: ProjectSettingsBlob | undefined }
  >({
    mutationKey: projectSettingsKeys.byKey(projectKey),
    mutationFn: (patch) => projectSettingsApi.update(projectKey, patch),
    errorMessage: 'Chyba při ukládání nastavení.',
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: projectSettingsKeys.byKey(projectKey) });
      const prev = qc.getQueryData<ProjectSettingsBlob>(projectSettingsKeys.byKey(projectKey));
      qc.setQueryData(projectSettingsKeys.byKey(projectKey), { ...(prev ?? {}), ...patch });
      return { prev };
    },
    onError: (_e, _patch, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(projectSettingsKeys.byKey(projectKey), ctx.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: projectSettingsKeys.byKey(projectKey) });
    },
  });

  // Debounce: batch consecutive update() calls into a single round-trip.
  const pendingProject = useRef<UpdateProjectRequest>({});
  const pendingBlob = useRef<Partial<ProjectSettingsBlob>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const projPatch = pendingProject.current;
    const blobPatch = pendingBlob.current;
    pendingProject.current = {};
    pendingBlob.current = {};
    if (Object.keys(projPatch).length > 0) projectMutation.mutate(projPatch);
    if (Object.keys(blobPatch).length > 0) blobMutation.mutate(blobPatch);
  }, [projectMutation, blobMutation]);

  const update = useCallback((patch: Partial<ProjectSettings>) => {
    setCache(projectKey, patch);
    for (const [k, v] of Object.entries(patch)) {
      const key = k as keyof ProjectSettings;
      if (SCALAR_KEYS.has(key)) {
        (pendingProject.current as Record<string, unknown>)[k] = v;
      } else if (BLOB_KEYS.has(key)) {
        (pendingBlob.current as Record<string, unknown>)[k] = v;
      }
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, 400);
  }, [projectKey, setCache, flush]);

  // Flush pending changes on unmount so they don't get lost.
  useEffect(() => () => flush(), [flush]);

  return {
    settings: merged,
    update,
    flush,
    reset: () => {
      resetCache(projectKey);
      qc.invalidateQueries({ queryKey: projectSettingsKeys.byKey(projectKey) });
      qc.invalidateQueries({ queryKey: projectKeys.byKey(projectKey) });
    },
    isLoading: blobQuery.isLoading,
    isSaving: projectMutation.isPending || blobMutation.isPending,
  };
}

/** Convenience helper to detect any pending settings save across the app. */
export function useProjectSettingsSaving(projectKey: string): boolean {
  const blobPending = useIsMutating({ mutationKey: projectSettingsKeys.byKey(projectKey) }) > 0;
  const projPending = useIsMutating({ mutationKey: [...projectSettingsKeys.byKey(projectKey), 'project'] }) > 0;
  return blobPending || projPending;
}

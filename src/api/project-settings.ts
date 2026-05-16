import api from './axios';

/* ===== Shared types matching BE DTOs ===== */

export interface ProjectMemberDto {
  userId: string;
  role: 'project_admin' | 'contributor' | 'viewer';
  addedAt: string;
}

export interface ProjectStatusDto {
  id: string;
  key: string;
  name: string;
  color: string;
  category: 'todo' | 'in_progress' | 'done';
  wipLimit: number | null;
  sortOrder: number;
}

export interface ProjectPriorityDto {
  id: string;
  key: string;
  name: string;
  color: string;
  enabled: boolean;
  sortOrder: number;
}

export interface ProjectTaskTypeDto {
  id: string;
  key: string;
  name: string;
  color: string;
  enabled: boolean;
  requiredFields: string[];
  sortOrder: number;
}

export interface ProjectWorkflowTransitionDto {
  id: string;
  fromStatusKey: string;
  toStatusKey: string;
  allowedRoles: string[];
  sortOrder: number;
}

export interface ProjectCustomFieldDto {
  id: string;
  key: string;
  name: string;
  fieldType: 'text' | 'number' | 'select' | 'date' | 'user';
  options: string[];
  required: boolean;
  appliesTo: string[];
  sortOrder: number;
}

export interface ProjectAutomationDto {
  id: string;
  name: string;
  enabled: boolean;
  trigger: string;
  action: string;
  sortOrder: number;
}

export interface ProjectApiTokenDto {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
}

export interface ProjectWebhookDto {
  id: string;
  url: string;
  events: string[];
  enabled: boolean;
  sortOrder: number;
}

export interface ProjectTaskTemplateDto {
  id: string;
  name: string;
  typeKey: string;
  title: string;
  description: string;
  sortOrder: number;
}

export interface ProjectIssueLinkTypeDto {
  id: string;
  key: string;
  outwardLabel: string;
  inwardLabel: string;
  color: string;
  sortOrder: number;
}

export interface ProjectAuditLogDto {
  id: string;
  actorId: string | null;
  section: string;
  summary: string;
  occurredAt: string;
}

/**
 * Shape of the small JSONB-backed settings blob the BE still serves at
 * /api/projects/by-key/{key}/settings. Holds purely configurational data
 * (permissions matrix, notifications prefs, board appearance) that is
 * always read/written as a whole.
 */
export interface ProjectSettingsBlob {
  permissions?: Record<string, Record<string, boolean>>;
  notifications?: {
    channels: { inApp: boolean; email: boolean; slack: boolean };
    events: Record<string, boolean>;
    digest: string;
  };
  appearance?: {
    defaultView: string;
    cardShowEstimate: boolean;
    cardShowLabels: boolean;
    cardShowAssignee: boolean;
    cardShowDue: boolean;
    cardColorBy: string;
    swimlanesBy: string;
  };
  autoTransitions?: {
    prOpened: string | null;
    prMerged: string | null;
    branchCreated: string | null;
  };
  workingHours?: {
    days: number[];
    start: string;
    end: string;
    holidays: Array<{ date: string; name: string }>;
  };
  branchNamingTemplate?: string;
}

/* ===== Per-resource REST clients ===== */

const base = (key: string) => `/api/projects/by-key/${key}`;

function makeResource<T>(suffix: string) {
  return {
    list: (key: string) =>
      api.get<T[]>(`${base(key)}/${suffix}`).then(r => r.data),
    replace: (key: string, body: T[]) =>
      api.put<T[]>(`${base(key)}/${suffix}`, body).then(r => r.data),
  };
}

export const projectMembersApi      = makeResource<ProjectMemberDto>('members');
export const projectStatusesApi     = makeResource<ProjectStatusDto>('statuses');
export const projectPrioritiesApi   = makeResource<ProjectPriorityDto>('priorities');
export const projectTaskTypesApi    = makeResource<ProjectTaskTypeDto>('task-types');
export const projectTransitionsApi  = makeResource<ProjectWorkflowTransitionDto>('transitions');
export const projectCustomFieldsApi = makeResource<ProjectCustomFieldDto>('custom-fields');
export const projectAutomationsApi  = makeResource<ProjectAutomationDto>('automations');
export const projectApiTokensApi    = makeResource<ProjectApiTokenDto>('api-tokens');
export const projectWebhooksApi     = makeResource<ProjectWebhookDto>('webhooks');
export const projectTaskTemplatesApi = makeResource<ProjectTaskTemplateDto>('task-templates');
export const projectIssueLinkTypesApi = makeResource<ProjectIssueLinkTypeDto>('issue-link-types');

export const projectAuditApi = {
  list: (key: string) => api.get<ProjectAuditLogDto[]>(`${base(key)}/audit`).then(r => r.data),
};

export const projectSettingsApi = {
  get: (projectKey: string) =>
    api.get<ProjectSettingsBlob>(`${base(projectKey)}/settings`).then(r => r.data),
  update: (projectKey: string, body: Partial<ProjectSettingsBlob>) =>
    api.patch<ProjectSettingsBlob>(`${base(projectKey)}/settings`, body).then(r => r.data),
};

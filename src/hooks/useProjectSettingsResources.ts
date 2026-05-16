import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useMutationWithToast } from './use-mutation-with-toast';
import {
  projectMembersApi, projectStatusesApi, projectPrioritiesApi, projectTaskTypesApi,
  projectTransitionsApi, projectCustomFieldsApi, projectAutomationsApi,
  projectApiTokensApi, projectWebhooksApi, projectTaskTemplatesApi, projectAuditApi,
  projectIssueLinkTypesApi,
  type ProjectMemberDto, type ProjectStatusDto, type ProjectPriorityDto,
  type ProjectTaskTypeDto, type ProjectWorkflowTransitionDto, type ProjectCustomFieldDto,
  type ProjectAutomationDto, type ProjectApiTokenDto, type ProjectWebhookDto,
  type ProjectTaskTemplateDto, type ProjectAuditLogDto,
  type ProjectIssueLinkTypeDto,
} from '../api/project-settings';

interface ResourceApi<T> {
  list: (projectKey: string) => Promise<T[]>;
  replace: (projectKey: string, body: T[]) => Promise<T[]>;
}

function useReplaceableList<T>(
  projectKey: string,
  apiKey: string,
  client: ResourceApi<T>,
  errorMessage: string,
) {
  const qc = useQueryClient();
  const queryKey: QueryKey = [apiKey, projectKey];

  const query = useQuery({
    queryKey,
    queryFn: () => client.list(projectKey),
    enabled: !!projectKey,
    staleTime: 1000 * 30,
  });

  const mutation = useMutationWithToast<T[], unknown, T[], { prev: T[] | undefined }>({
    mutationKey: queryKey,
    mutationFn: (next: T[]) => client.replace(projectKey, next),
    errorMessage,
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData<T[]>(queryKey);
      qc.setQueryData(queryKey, next);
      return { prev };
    },
    onError: (_e, _next, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    replace: (next: T[]) => mutation.mutate(next),
  };
}

export const useProjectMembersRes      = (k: string) => useReplaceableList<ProjectMemberDto>(k,             'project-members',      projectMembersApi,      'Chyba při ukládání členů');
export const useProjectStatusesRes     = (k: string) => useReplaceableList<ProjectStatusDto>(k,             'project-statuses',     projectStatusesApi,     'Chyba při ukládání statusů');
export const useProjectPrioritiesRes   = (k: string) => useReplaceableList<ProjectPriorityDto>(k,           'project-priorities',   projectPrioritiesApi,   'Chyba při ukládání priorit');
export const useProjectTaskTypesRes    = (k: string) => useReplaceableList<ProjectTaskTypeDto>(k,           'project-task-types',   projectTaskTypesApi,    'Chyba při ukládání typů tasků');
export const useProjectTransitionsRes  = (k: string) => useReplaceableList<ProjectWorkflowTransitionDto>(k, 'project-transitions',  projectTransitionsApi,  'Chyba při ukládání přechodů');
export const useProjectCustomFieldsRes = (k: string) => useReplaceableList<ProjectCustomFieldDto>(k,        'project-custom-fields',projectCustomFieldsApi, 'Chyba při ukládání custom fields');
export const useProjectAutomationsRes  = (k: string) => useReplaceableList<ProjectAutomationDto>(k,         'project-automations',  projectAutomationsApi,  'Chyba při ukládání automatizací');
export const useProjectApiTokensRes    = (k: string) => useReplaceableList<ProjectApiTokenDto>(k,           'project-api-tokens',   projectApiTokensApi,    'Chyba při ukládání API tokenů');
export const useProjectWebhooksRes     = (k: string) => useReplaceableList<ProjectWebhookDto>(k,            'project-webhooks',     projectWebhooksApi,     'Chyba při ukládání webhooků');
export const useProjectTaskTemplatesRes = (k: string) => useReplaceableList<ProjectTaskTemplateDto>(k,      'project-task-templates',projectTaskTemplatesApi,'Chyba při ukládání šablon');
export const useProjectIssueLinkTypesRes = (k: string) => useReplaceableList<ProjectIssueLinkTypeDto>(k,   'project-issue-link-types',projectIssueLinkTypesApi,'Chyba při ukládání typů linků');

export function useProjectAuditLog(projectKey: string) {
  const query = useQuery({
    queryKey: ['project-audit', projectKey],
    queryFn: () => projectAuditApi.list(projectKey),
    enabled: !!projectKey,
    staleTime: 1000 * 30,
  });
  return {
    data: (query.data ?? []) as ProjectAuditLogDto[],
    isLoading: query.isLoading,
  };
}

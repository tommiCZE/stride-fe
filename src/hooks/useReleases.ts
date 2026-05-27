import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { releasesApi } from '../api/releases';
import type {
  ReleaseDto, CreateReleaseRequest, UpdateReleaseRequest, TaskSummaryDto,
  ReleaseActivityItemDto,
} from '../api/types';

export const releaseKeys = {
  all: ['releases'] as const,
  byProject: (projectId: string) => [...releaseKeys.all, 'by-project', projectId] as const,
  detail: (id: string) => [...releaseKeys.all, 'detail', id] as const,
  tasks: (id: string) => [...releaseKeys.all, 'tasks', id] as const,
  activity: (id: string) => [...releaseKeys.all, 'activity', id] as const,
};

function isNotFound(err: unknown): boolean {
  return (err as AxiosError | undefined)?.response?.status === 404;
}

export function useReleases(projectId: string | undefined) {
  return useQuery({
    queryKey: releaseKeys.byProject(projectId ?? ''),
    queryFn: async (): Promise<ReleaseDto[]> => {
      try {
        return await releasesApi.listByProject(projectId as string);
      } catch (e) {
        if (isNotFound(e)) return [];
        throw e;
      }
    },
    enabled: !!projectId,
    staleTime: 1000 * 30,
  });
}

export function useRelease(id: string | undefined) {
  return useQuery({
    queryKey: releaseKeys.detail(id ?? ''),
    queryFn: () => releasesApi.get(id as string),
    enabled: !!id,
  });
}

export function useReleaseTasks(id: string | undefined) {
  return useQuery({
    queryKey: releaseKeys.tasks(id ?? ''),
    queryFn: async (): Promise<TaskSummaryDto[]> => {
      try {
        return await releasesApi.tasks(id as string);
      } catch (e) {
        if (isNotFound(e)) return [];
        throw e;
      }
    },
    enabled: !!id,
  });
}

export function useReleaseActivity(id: string | undefined) {
  return useQuery({
    queryKey: releaseKeys.activity(id ?? ''),
    queryFn: async (): Promise<ReleaseActivityItemDto[]> => {
      try {
        return await releasesApi.activity(id as string);
      } catch (e) {
        if (isNotFound(e)) return [];
        throw e;
      }
    },
    enabled: !!id,
  });
}

export function useCreateRelease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReleaseRequest) => releasesApi.create(body),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: releaseKeys.byProject(r.projectId) });
    },
  });
}

export function useUpdateRelease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateReleaseRequest }) =>
      releasesApi.update(id, body),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: releaseKeys.byProject(r.projectId) });
      qc.invalidateQueries({ queryKey: releaseKeys.detail(r.id) });
    },
  });
}

export function useDeleteRelease(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => releasesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: releaseKeys.byProject(projectId) });
    },
  });
}

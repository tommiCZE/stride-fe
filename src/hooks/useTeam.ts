import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '../api/team';
import type { InviteMemberRequest, UpdateMemberRequest } from '../api/types';

export const teamKeys = {
  all: ['team'] as const,
  members: () => [...teamKeys.all, 'members'] as const,
};

export function useTeamMembers() {
  return useQuery({
    queryKey: teamKeys.members(),
    queryFn: teamApi.list,
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: InviteMemberRequest) => teamApi.invite(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.members() }),
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateMemberRequest }) =>
      teamApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.members() }),
  });
}

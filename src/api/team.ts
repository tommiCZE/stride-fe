import api from './axios';
import type { UserDto, InviteMemberRequest, UpdateMemberRequest } from './types';

export const teamApi = {
  list: () =>
    api.get<UserDto[]>('/api/team/members').then(r => r.data),

  invite: (body: InviteMemberRequest) =>
    api.post<void>('/api/team/invite', body).then(r => r.data),

  update: (id: string, body: UpdateMemberRequest) =>
    api.patch<void>(`/api/team/members/${id}`, body).then(r => r.data),
};

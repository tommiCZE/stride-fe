import api from './axios';
import type { UserDto } from './types';

export interface UpdateProfileRequest {
  name?: string;
  initials?: string;
  color?: string;
}

export const usersApi = {
  getMe: () => api.get<UserDto>('/api/users/me').then(r => r.data),
  updateMe: (body: UpdateProfileRequest) => api.patch('/api/users/me', body),
};

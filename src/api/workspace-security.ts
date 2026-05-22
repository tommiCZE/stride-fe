import api from './axios';

export interface WorkspaceSecurityPolicyDto {
  samlSsoEnabled: boolean;
  googleSsoEnabled: boolean;
  enforce2fa: boolean;
  passwordMinLength: number;
  passwordRequireUpper: boolean;
  passwordRequireDigit: boolean;
  passwordRequireSpecial: boolean;
  passwordExpiryDays: number | null;
}

export type UpdateSecurityPolicyRequest = Partial<WorkspaceSecurityPolicyDto>;

export const workspaceSecurityApi = {
  get: () => api.get<WorkspaceSecurityPolicyDto>('/api/workspace/security').then(r => r.data),
  update: (body: UpdateSecurityPolicyRequest) =>
    api.patch<void>('/api/workspace/security', body),
};

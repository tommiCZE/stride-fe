import api from './axios';

export interface WorkspaceAuditEntryDto {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorInitials: string | null;
  actorColor: string | null;
  section: string;
  action: string;
  target: string | null;
  summary: string;
  ip: string | null;
  userAgent: string | null;
  occurredAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuditSearchParams {
  actorIds?: string[];
  action?: string;
  from?: string;     // ISO instant
  to?: string;       // ISO instant
  q?: string;
  page?: number;
  size?: number;
}

function toQuery(p: AuditSearchParams): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.actorIds && p.actorIds.length > 0) out.actorIds = p.actorIds;
  if (p.action)  out.action = p.action;
  if (p.from)    out.from = p.from;
  if (p.to)      out.to = p.to;
  if (p.q)       out.q = p.q;
  if (p.page != null) out.page = p.page;
  if (p.size != null) out.size = p.size;
  return out;
}

export const workspaceAuditApi = {
  search: (p: AuditSearchParams) =>
    api.get<PageResponse<WorkspaceAuditEntryDto>>('/api/workspace/audit', {
      params: toQuery(p),
      paramsSerializer: { indexes: null },  // actorIds=a&actorIds=b
    }).then(r => r.data),

  exportCsv: (p: AuditSearchParams) =>
    api.get<Blob>('/api/workspace/audit/export', {
      params: toQuery(p),
      paramsSerializer: { indexes: null },
      responseType: 'blob',
    }).then(r => r.data),
};

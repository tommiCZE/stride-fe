import type { UserDto } from '../api/types';
import type { TaskDevActivity } from '../types/dev-activity';

const USERS: Record<string, UserDto> = {
  tv: {
    id: 'mock-tv', name: 'Tomáš Veselý', initials: 'TV', color: '#6366f1',
    email: 'tomas.vesely@acme.cz', username: 'tomas.vesely',
    workspaceRole: 'admin', status: 'active',
  },
  jl: {
    id: 'mock-jl', name: 'Jakub Linhart', initials: 'JL', color: '#10b981',
    email: 'jakub.linhart@acme.cz', username: 'jakub.linhart',
    workspaceRole: 'member', status: 'active',
  },
  km: {
    id: 'mock-km', name: 'Klára Marková', initials: 'KM', color: '#ec4899',
    email: 'klara.markova@acme.cz', username: 'klara.markova',
    workspaceRole: 'member', status: 'active',
  },
  pd: {
    id: 'mock-pd', name: 'Pavel Dvořák', initials: 'PD', color: '#0ea5e9',
    email: 'pavel.dvorak@acme.cz', username: 'pavel.dvorak',
    workspaceRole: 'member', status: 'active',
  },
};

const MOCK: Record<string, TaskDevActivity> = {
  'DEMO-3': {
    branches: [
      {
        name: 'DEMO-3-fix-login-redirect',
        repo: 'acme/web',
        provider: 'gitlab',
        url: 'https://gitlab.com/acme/web/-/tree/DEMO-3-fix-login-redirect',
        createdAt: '2026-05-25T09:12:00Z',
        createdBy: USERS.tv,
        commits: [
          { sha: 'd4f01a2', message: 'strip query from target URL', at: '2026-05-25T10:48:00Z', author: USERS.tv },
          { sha: '7c83b12', message: 'cover OAuth callback edge case', at: '2026-05-25T13:20:00Z', author: USERS.tv },
          { sha: 'a1f24e9', message: 'validate redirect_uri against allowlist', at: '2026-05-25T15:02:00Z', author: USERS.tv },
        ],
        mr: {
          id: '1',
          title: 'Fix login redirect',
          branch: 'DEMO-3-fix-login-redirect',
          base: 'main',
          state: 'open',
          plus: 412,
          minus: 38,
          files: 9,
          openedAt: '2026-05-25T16:30:00Z',
          openedBy: USERS.tv,
          url: 'https://gitlab.com/acme/web/-/merge_requests/1',
          reviewers: [
            { user: USERS.km, verdict: 'approved' },
            { user: USERS.jl, verdict: 'awaiting' },
          ],
        },
        build: {
          state: 'failed',
          total: 6,
          passed: 5,
          failedJob: 'test:unit',
          duration: '4m 18s',
          mrId: '1',
          at: '2026-05-26T08:14:00Z',
        },
      },
    ],
    reviews: [
      {
        id: 'rev-1', mrId: '1', reviewer: USERS.km, verdict: 'approved',
        at: '2026-05-26T07:40:00Z',
      },
    ],
  },

  'WEB-142': {
    branches: [
      {
        name: 'WEB-142-slash-menu-editor',
        repo: 'flexo-team/flux-web',
        provider: 'gitlab',
        url: 'https://gitlab.com/flexo-team/flux-web/-/tree/WEB-142-slash-menu-editor',
        createdAt: '2026-05-20T08:30:00Z',
        createdBy: USERS.km,
        commits: [
          { sha: '8b2c134', message: 'scaffold SlashMenu component', at: '2026-05-20T11:10:00Z', author: USERS.km },
          { sha: '3e4abc7', message: 'add fuzzy search over block names', at: '2026-05-21T09:48:00Z', author: USERS.km },
          { sha: 'f02d901', message: 'keyboard navigation (↑ ↓ Enter Esc)', at: '2026-05-21T14:33:00Z', author: USERS.km },
          { sha: 'c91ee72', message: 'insert block at cursor position', at: '2026-05-22T10:05:00Z', author: USERS.km },
        ],
        mr: {
          id: '142',
          title: 'WEB-142: Slash menu v rich-text editoru',
          branch: 'WEB-142-slash-menu-editor',
          base: 'main',
          state: 'open',
          plus: 218,
          minus: 14,
          files: 7,
          openedAt: '2026-05-22T15:00:00Z',
          openedBy: USERS.km,
          url: 'https://gitlab.com/flexo-team/flux-web/-/merge_requests/142',
          reviewers: [
            { user: USERS.tv, verdict: 'approved' },
            { user: USERS.pd, verdict: 'commented' },
          ],
        },
        build: {
          state: 'success',
          total: 6,
          passed: 6,
          duration: '3m 42s',
          mrId: '142',
          at: '2026-05-23T07:30:00Z',
        },
      },
    ],
    reviews: [
      { id: 'rev-2', mrId: '142', reviewer: USERS.tv, verdict: 'approved', at: '2026-05-23T09:15:00Z' },
      { id: 'rev-3', mrId: '142', reviewer: USERS.pd, verdict: 'commented', body: 'Drobnost u escape handleru — mrkni komentář.', at: '2026-05-23T11:42:00Z' },
    ],
  },
};

export function getMockDevActivity(taskKey: string | undefined): TaskDevActivity {
  if (!taskKey) return { branches: [], reviews: [] };
  return MOCK[taskKey] ?? { branches: [], reviews: [] };
}

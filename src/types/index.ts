import type { JSONContent } from '@tiptap/core';

export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  email?: string;
  workspaceRole?: 'admin' | 'member' | 'viewer';
  status?: 'active' | 'pending';
}

export interface Project {
  id: string;
  key: string;
  name: string;
  color: string;
  icon: string;
  lead: string;
  tasks: number;
  open: number;
}

export interface Status {
  id: string;
  name: string;
  color: string;
  wip: number | null;
}

export interface Priority {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface TaskType {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Sprint {
  id: string;
  name: string;
  project: string;
  start: string;
  end: string;
  state: 'active' | 'planned' | 'completed';
  goal: string;
}

export interface Epic {
  id: string;
  key: string;
  title: string;
  project: string;
  color: string;
  progress: number;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskLink {
  type: 'blocks' | 'relates';
  key: string;
}

export type { JSONContent } from '@tiptap/core';

export type RichBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'callout'; tone: 'info' | 'warn' | 'error'; text: string }
  | { type: 'code'; lang: string; text: string };

export interface Task {
  id: string;
  key: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  project: string;
  epic?: string;
  sprint?: string;
  assignee: string | null;
  reporter: string;
  labels: string[];
  estimate: number | null;
  logged: number;
  due: string | null;
  subtasks: Subtask[];
  comments: number;
  attachments: number;
  links: TaskLink[];
  description: string | RichBlock[] | JSONContent;
  updated: string;
  created: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  from?: string;
  to?: string;
  at: string;
  preview?: string;
}

/** User information returned by /api/activity (subset of User). */
export interface ActivityActorDto {
  id: string;
  name: string;
  initials: string;
  color: string;
  email?: string | null;
}

/** Backend-shaped activity event. Fields mirror BE ActivityItemDto with task/project denormalization. */
export interface ActivityDto {
  id: string;
  userId: string;
  actor: ActivityActorDto | null;
  taskId: string;
  taskKey: string;
  taskTitle?: string | null;
  projectId: string;
  projectName?: string | null;
  action: string;
  target: string;
  fromValue?: string | null;
  toValue?: string | null;
  createdAt: string;
}

export interface GitRepo {
  full: string;
  stars: number;
  lang: string;
  linked: boolean;
}

export interface GitIntegration {
  id: string;
  provider: 'github' | 'gitlab';
  name: string;
  org: string;
  connected: boolean;
  repos: GitRepo[];
  webhooks: string[];
  smartCommits: boolean;
  autoTransition: boolean;
  lastSync: string;
}

export interface DevBranch {
  name: string;
  repo: string;
  provider: 'github' | 'gitlab';
  author: string;
  ahead: number;
  behind: number;
  updated: string;
}

export interface ReviewState {
  user: string;
  state: 'approved' | 'comment' | 'changes';
}

export interface CheckCounts {
  passed: number;
  failed: number;
  pending: number;
}

export interface DevPull {
  id: string;
  title: string;
  repo: string;
  provider: 'github' | 'gitlab';
  author: string;
  state: 'open' | 'merged' | 'closed' | 'draft';
  draft: boolean;
  head: string;
  base: string;
  additions: number;
  deletions: number;
  files: number;
  reviews: ReviewState[];
  checks: CheckCounts;
  updated: string;
}

export interface DevCommit {
  sha: string;
  message: string;
  author: string;
  repo: string;
  provider: 'github' | 'gitlab';
  at: string;
}

export interface DevBuild {
  id: string;
  name: string;
  state: 'success' | 'failed' | 'running' | 'pending';
  duration: string;
  at: string;
}

export interface DevData {
  branches: DevBranch[];
  pulls: DevPull[];
  commits: DevCommit[];
  builds: DevBuild[];
}

export type NavView = 'dashboard' | 'inbox' | 'mywork' | 'reports' | 'board' | 'backlog' | 'list' | 'settings';

export interface NavRoute {
  view: NavView;
}

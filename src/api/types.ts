export interface UserDto {
  id: string;
  name: string;
  initials: string;
  color: string;
  email: string;
  username: string;
  workspaceRole: string;
  status: string;
}

export interface LabelDto {
  id: string;
  name: string;
  color: string;
  projectId: string;
}

export interface SlackIntegrationDto {
  id: string;
  projectId: string;
  teamId: string;
  teamName: string;
  defaultChannelId: string | null;
  defaultChannelName: string | null;
  installedAt: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
}

export interface GithubIntegrationDto {
  id: string;
  projectId: string;
  accountLogin: string;
  accountAvatarUrl: string | null;
  defaultRepoId: number | null;
  defaultRepoFullName: string | null;
  installedAt: string;
}

export interface GithubRepo {
  id: number;
  fullName: string;
  name: string;
  isPrivate: boolean;
  htmlUrl: string;
}

export interface GitlabIntegrationDto {
  id: string;
  projectId: string;
  baseUrl: string;
  accountUsername: string;
  accountAvatarUrl: string | null;
  defaultProjectId: number | null;
  defaultProjectPath: string | null;
  installedAt: string;
}

export interface GitlabProject {
  id: number;
  pathWithNamespace: string;
  name: string;
  visibility: string;
  webUrl: string;
}

export type RemoteLinkProvider = 'github' | 'gitlab';
export type RemoteLinkKind = 'pull_request' | 'merge_request';
export type RemoteLinkState = 'open' | 'closed' | 'merged';

export interface TaskRemoteLinkDto {
  id: string;
  taskId: string;
  provider: RemoteLinkProvider;
  remoteKind: RemoteLinkKind;
  remoteNumber: number;
  remoteUrl: string;
  state: RemoteLinkState;
  title: string;
  repoRef: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDto {
  id: string;
  key: string;
  name: string;
  color: string;
  icon: string;
  leadId: string | null;
  lead: UserDto | null;
  taskCount: number;
  openCount: number;
  description: string;
  category: string;
  kind: string;
  visibility: string;
  archived: boolean;
  slackChannel: string;
  defaultAssigneeId: string | null;
  estimateUnit: string;
  defaultTaskType: string;
  defaultPriority: string;
  sprintLengthWeeks: number;
  sprintCapacity: number;
  sprintStartWeekday: number;
  sprintRollover: string;
  velocityBaseline: number;
  definitionOfDone: string[];
}

export interface CreateProjectRequest {
  key: string;
  name: string;
  color: string;
  icon: string;
  leadId?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  color?: string;
  icon?: string;
  leadId?: string | null;
  description?: string;
  category?: string;
  kind?: string;
  visibility?: string;
  archived?: boolean;
  slackChannel?: string;
  defaultAssigneeId?: string | null;
  estimateUnit?: string;
  defaultTaskType?: string;
  defaultPriority?: string;
  sprintLengthWeeks?: number;
  sprintCapacity?: number;
  sprintStartWeekday?: number;
  sprintRollover?: string;
  velocityBaseline?: number;
  definitionOfDone?: string[];
}

export interface SprintDto {
  id: string;
  name: string;
  projectId: string;
  number: number;
  startDate: string | null;
  endDate: string | null;
  state: string;
  goal: string | null;
}

export interface CreateSprintRequest {
  name: string;
  projectId: string;
  startDate?: string;
  endDate?: string;
  goal?: string;
}

export interface UpdateSprintRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
  state?: string;
  goal?: string;
}

export interface EpicDto {
  id: string;
  key: string;
  title: string;
  projectId: string;
  color: string;
  progress: number;
}

export type ReleaseStatus = 'unreleased' | 'released' | 'archived';

export interface ReleaseDto {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  status: ReleaseStatus;
  startDate: string | null;
  releaseDate: string | null;
  goal: string | null;
  taskCount: number;
  doneCount: number;
  createdAt: string;
}

export interface CreateReleaseRequest {
  projectId: string;
  name: string;
  description?: string;
  startDate?: string;
  releaseDate?: string;
  goal?: string;
}

export interface UpdateReleaseRequest {
  name?: string;
  description?: string | null;
  status?: ReleaseStatus;
  startDate?: string | null;
  releaseDate?: string | null;
  goal?: string | null;
}

export interface TaskSummaryDto {
  id: string;
  key: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  projectId: string;
  epicId: string | null;
  sprintId: string | null;
  fixVersionId: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeInitials: string | null;
  assigneeColor: string | null;
  commentCount: number;
  estimate: number | null;
  logged: number;
  dueDate: string | null;
  updatedAt?: string;
  needsGrooming?: boolean;
}

export interface TaskDto {
  id: string;
  key: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  projectId: string;
  epicId: string | null;
  sprintId: string | null;
  fixVersionId: string | null;
  assigneeId: string | null;
  assignee: UserDto | null;
  reporterId: string | null;
  reporter: UserDto | null;
  labels: LabelDto[];
  description: string | null;
  estimate: number | null;
  logged: number;
  dueDate: string | null;
  commentCount: number;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreatedResponse {
  id: string;
  key: string;
}

export interface CreateTaskRequest {
  title: string;
  projectId: string;
  type?: string;
  status?: string;
  priority?: string;
  epicId?: string;
  sprintId?: string;
  fixVersionId?: string;
  assigneeId?: string;
  labelIds?: string[];
  description?: string;
  estimate?: number;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  type?: string;
  status?: string;
  priority?: string;
  epicId?: string | null;
  sprintId?: string | null;
  fixVersionId?: string | null;
  assigneeId?: string | null;
  labelIds?: string[];
  description?: string | null;
  estimate?: number | null;
  dueDate?: string | null;
}

export interface TaskFilters {
  sprint?: string;
  status?: string;
  assignee?: string;
  label?: string;
  priority?: string;
  page?: number;
  size?: number;
}

export interface CommentDto {
  id: string;
  taskId: string;
  userId: string;
  user: UserDto;
  text: string;
  parentCommentId: string | null;
  sequence: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  text: string;
  parentCommentId?: string | null;
}

export interface UpdateCommentRequest {
  text: string;
}

export interface WorklogDto {
  id: string;
  taskId: string;
  userId: string;
  user: UserDto;
  minutes: number;
  loggedAt: string;
  comment: string | null;
}

export interface CreateWorklogRequest {
  minutes: number;
  loggedAt: string;
  comment?: string;
}

export interface RunningTimerDto {
  taskId: string;
  taskKey: string;
  startedAt: string;
}

export interface StartTimerRequest {
  taskId: string;
}

export interface StopTimerResponse {
  taskId: string;
  taskKey: string;
  startedAt: string;
  stoppedAt: string;
  elapsedSeconds: number;
}

export interface ActivityItemDto {
  id: string;
  taskId: string;
  userId: string;
  user: UserDto;
  action: string;
  target: string | null;
  fromValue: string | null;
  toValue: string | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserDto;
}

export interface InviteMemberRequest {
  name: string;
  email: string;
  workspaceRole: string;
}

export interface UpdateMemberRequest {
  workspaceRole?: string;
  status?: string;
}

export interface SubtaskDto {
  id: string;
  taskId: string;
  title: string;
  done: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubtaskRequest {
  title: string;
}

export interface UpdateSubtaskRequest {
  title?: string;
  done?: boolean;
}

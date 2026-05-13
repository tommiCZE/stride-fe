export interface UserDto {
  id: string;
  name: string;
  initials: string;
  color: string;
  email: string;
  workspaceRole: string;
  status: string;
}

export interface LabelDto {
  id: string;
  name: string;
  color: string;
  projectId: string;
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
  leadId?: string;
}

export interface SprintDto {
  id: string;
  name: string;
  projectId: string;
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
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeInitials: string | null;
  assigneeColor: string | null;
  commentCount: number;
  estimate: number | null;
  logged: number;
  dueDate: string | null;
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

export interface CreateTaskRequest {
  title: string;
  projectId: string;
  type?: string;
  status?: string;
  priority?: string;
  epicId?: string;
  sprintId?: string;
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

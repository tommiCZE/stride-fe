import type { ProjectDto, TaskSummaryDto, UserDto } from './types';

export interface SearchFilters {
  q: string;
  projectIds?: string[];
  types?: string[];
  statuses?: string[];
  assigneeIds?: string[];
  dueFrom?: string;
  dueTo?: string;
}

export interface SearchResults {
  tasks: TaskSummaryDto[];
  projects: ProjectDto[];
  people: UserDto[];
}

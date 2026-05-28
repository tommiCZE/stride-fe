import type { UserDto } from '../api/types';

export type ReviewVerdict = 'approved' | 'commented' | 'changes' | 'awaiting';
export type CiState = 'success' | 'failed' | 'running';
export type MrState = 'open' | 'merged' | 'closed';

export interface DevCommit {
  sha: string;
  message: string;
  at: string;
  author: UserDto;
}

export interface DevReviewer {
  user: UserDto;
  verdict: ReviewVerdict;
}

export interface DevBuild {
  state: CiState;
  total: number;
  passed: number;
  failedJob?: string;
  duration: string;
  mrId?: string;
  at?: string;
}

export interface DevMergeRequest {
  id: string;
  title: string;
  branch: string;
  base: string;
  state: MrState;
  plus: number;
  minus: number;
  files: number;
  reviewers: DevReviewer[];
  assignee?: UserDto | null;
  unresolvedThreadCount?: number;
  url: string;
  openedAt: string;
  mergedAt?: string;
  openedBy: UserDto;
}

export interface DevBranch {
  name: string;
  repo: string;
  url: string;
  provider: 'gitlab' | 'github';
  createdAt: string;
  createdBy: UserDto;
  commits: DevCommit[];
  mr?: DevMergeRequest;
  build?: DevBuild;
}

export interface TaskDevActivity {
  branches: DevBranch[];
  reviews: DevReviewEvent[];
}

export interface DevReviewEvent {
  id: string;
  mrId: string;
  reviewer: UserDto;
  verdict: 'approved' | 'commented' | 'changes';
  body?: string;
  at: string;
}

---
name: frontend-mock-data
description: Use when creating realistic mock data, TypeScript domain types, fixtures, demo issues, projects, users, board columns, priorities, statuses, and frontend-only prototypes.
---

# Frontend Mock Data Skill

Use this skill when the app is frontend-only or when backend is not ready.

## Goals
- Create realistic demo data.
- Keep mock data separate from components.
- Use the same types the real app will later use.
- Make UI states testable: empty, loading, error, dense data.

## Suggested domain types

```ts
export type IssueType = 'bug' | 'task' | 'story' | 'epic';
export type IssuePriority = 'highest' | 'high' | 'medium' | 'low';
export type IssueStatus =
  | 'backlog'
  | 'todo'
  | 'inProgress'
  | 'codeReview'
  | 'testing'
  | 'done';

export type Issue = {
  id: string;
  key: string;
  title: string;
  description: string;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  assigneeId?: string;
  reporterId: string;
  labels: string[];
  storyPoints?: number;
  projectId: string;
  epicId?: string;
  createdAt: string;
  updatedAt: string;
};
```

## Mock data rules
- Use 3–5 projects.
- Use 8–12 users.
- Use 30–80 issues for realistic board/list testing.
- Include different priorities, statuses, issue types, labels, and assignees.
- Include some unassigned issues.
- Include at least one empty column scenario.
- Include long titles and long descriptions to test layout.

## Files
Use:

```txt
features/issues/types.ts
features/issues/mockData.ts
features/projects/mockData.ts
features/users/mockData.ts
```

## When generating UI
- Do not fetch from real API.
- Use mock hooks such as `useIssues()` only if useful.
- Make mock layer easy to replace with real API later.

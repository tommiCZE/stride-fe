---
name: jira-like-frontend
description: Use when designing or implementing Jira-like frontend screens, issue tracking UI, boards, backlog, issue detail panels, dashboards, project pages, filters, and reports.
---

# Jira-like Frontend Skill

Use this skill for a frontend-only Jira/Linear/GitHub Projects style application.

## Product scope
Frontend prototype or frontend implementation for:
- Dashboard
- Projects
- Project detail
- Kanban board
- Backlog
- Issue list
- Issue detail
- Create/edit issue form
- Reports
- Settings
- My Work

## Core UX rules
- The app must feel like a real productivity tool, not a landing page.
- Navigation: left sidebar + top toolbar.
- Top toolbar: global search, create issue button, notifications, user avatar.
- Use realistic demo data.
- Use empty, loading, error, and dense-data states.
- Prefer fast scanning: compact cards, clear badges, visible priority/type/status.

## Issue card content
Each issue card should usually show:
- Key, e.g. `COCO-123`
- Title
- Issue type icon/name
- Priority chip/icon
- Labels
- Assignee avatar
- Story points or estimate
- Optional parent epic indicator

## Board columns
Default columns:
- Backlog
- To Do
- In Progress
- Code Review
- Testing
- Done

## Filters
Board and issue list should support:
- text search
- assignee
- priority
- label
- issue type
- status
- epic

## Issue detail
Prefer a right drawer for board context and full-page detail for deep work.

Fields:
- title
- description
- status
- assignee
- reporter
- priority
- labels
- story points
- parent epic
- comments
- activity/history
- related issues
- attachments placeholder

## Reports prototype
Use mock charts/cards:
- issues by status
- issues by assignee
- velocity
- burndown
- cycle time

## Deliverables
When asked to create a design/prototype:
1. Create a navigable multi-screen React UI.
2. Use mock data.
3. Keep backend/API out unless explicitly requested.
4. Prioritize reusable components and clear file structure.

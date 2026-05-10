---
name: react-ts-architecture
description: Use when designing or refactoring a React + TypeScript frontend architecture, feature structure, component boundaries, hooks, state management, or maintainable app layout.
---

# React TypeScript Architecture Skill

You are working in a React + TypeScript codebase. Prefer a feature-based architecture with reusable UI primitives and clear separation between domain features, shared UI, hooks, and services.

## Goals
- Keep business logic out of visual components.
- Keep components small, typed, and composable.
- Prefer feature folders for domain areas.
- Avoid global coupling.
- Make future backend integration easy.

## Recommended folder structure

```txt
src/
  app/
    App.tsx
    routes.tsx
    providers/
      AppProviders.tsx
  layouts/
    AppShell/
      AppShell.tsx
      Sidebar.tsx
      Topbar.tsx
  features/
    issues/
      components/
      hooks/
      types.ts
      mockData.ts
    board/
      components/
      hooks/
      types.ts
    projects/
      components/
      hooks/
      types.ts
  components/
    ui/
    feedback/
    data-display/
  theme/
    theme.ts
    palette.ts
    typography.ts
  hooks/
  utils/
  services/
```

## Rules
- Use functional components only.
- Use explicit props interfaces or type aliases.
- Prefer named exports except for app entry points.
- Extract complex logic into hooks.
- Keep API/data access out of components.
- Use discriminated unions for variants such as issue type and priority.
- Avoid `any`; use `unknown` when necessary and narrow it.
- Avoid inline object literals in hot render paths when they can cause unnecessary renders.
- Use `useMemo` and `useCallback` only when they solve a real stability/performance problem.

## Component style

```tsx
type IssueCardProps = {
  issue: Issue;
  compact?: boolean;
  onOpen: (issueId: string) => void;
};

export function IssueCard({ issue, compact = false, onOpen }: IssueCardProps) {
  return (
    // UI only
  );
}
```

## When asked to create code
- First inspect existing project conventions.
- Match existing imports, path aliases, formatting, and MUI version.
- Do not introduce a new state library unless requested.
- For prototypes, use local mock data in `mockData.ts`.
- For production-ready code, isolate data fetching behind hooks/services.

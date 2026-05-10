---
name: react-component-patterns
description: Use when creating reusable React components, compound components, headless hooks, controlled/uncontrolled components, forms, dialogs, drawers, tabs, filters, or complex UI composition.
---

# React Component Patterns Skill

## Prefer these patterns

### 1. Presentational component + hook
Use a hook for behavior and a component for rendering.

```tsx
const board = useBoardFilters(issues);

return <BoardView columns={board.columns} onFilterChange={board.setFilter} />;
```

### 2. Controlled components
For forms and reusable widgets, prefer controlled props:

```tsx
type FilterBarProps = {
  value: IssueFilters;
  onChange: (next: IssueFilters) => void;
};
```

### 3. Compound components
Use for components with multiple semantic parts:

```tsx
<AppDialog open={open} onClose={onClose}>
  <AppDialog.Title>Create issue</AppDialog.Title>
  <AppDialog.Content>...</AppDialog.Content>
  <AppDialog.Actions>...</AppDialog.Actions>
</AppDialog>
```

### 4. Headless hook + MUI rendering
Keep interaction state in hooks, render through MUI.

```tsx
const { open, selectedId, openIssue, closeIssue } = useIssueDrawer();
```

## Rules
- Keep prop names predictable: `value`, `onChange`, `open`, `onClose`, `onSubmit`.
- Do not over-abstract too early.
- Extract a component after it appears twice or it has independent behavior.
- Avoid passing whole app state into deep components.
- Prefer composition over boolean prop explosion.
- For variant-heavy components, use discriminated union props.

## Forms
- For simple prototypes, local state is fine.
- For larger forms, use a form library only if already present.
- Validate required fields visibly.
- Keep create/edit forms shareable.

## Performance
- Virtualize large lists if issue count is high.
- Memoize cards/columns only when rendering is actually expensive.
- Use stable keys such as issue ID, never array index for board cards.

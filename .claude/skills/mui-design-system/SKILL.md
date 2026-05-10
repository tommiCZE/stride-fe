---
name: mui-design-system
description: Use when creating or improving Material UI themes, reusable MUI wrapper components, design tokens, dark mode, spacing, typography, cards, buttons, chips, tables, dialogs, or app layout.
---

# MUI Design System Skill

Use Material UI consistently. Prefer theme-driven styling over ad-hoc inline styling.

## Goals
- Centralized theme.
- Reusable UI wrappers.
- Consistent spacing, radius, shadows, typography, and status colors.
- Easy light/dark mode support.

## Theme rules
- Define palette, typography, shape, spacing, and component overrides in `src/theme`.
- Use semantic colors for issue status, issue type, and priority.
- Prefer `sx` for local layout only.
- Avoid repeating colors directly inside components.
- Prefer `theme.palette.*` and named tokens.

## Suggested tokens

Priority:
- highest: red
- high: orange
- medium: amber/yellow
- low: green

Issue types:
- bug: red
- task: blue
- story: green
- epic: purple

Status:
- backlog: neutral
- todo: gray/blue
- inProgress: blue
- review: purple
- testing: amber
- done: green

## Reusable components
Create wrappers when the same pattern appears repeatedly:

```txt
components/ui/
  AppButton.tsx
  AppCard.tsx
  AppDialog.tsx
  AppChip.tsx
  EmptyState.tsx
  LoadingState.tsx
  PageHeader.tsx
  SectionCard.tsx
```

## MUI component guidance
- Use `Box`, `Stack`, `Grid`, `Paper`, `Card`, `Chip`, `Avatar`, `Typography`.
- Use MUI `Drawer` or permanent sidebar for app shell.
- Use `Dialog` or right-side drawer for issue detail.
- Use `DataGrid` or MUI table for dense issue list.
- Use `Skeleton` for loading states.
- Use `Alert` or Snackbar for feedback.

## Accessibility
- Icon-only buttons must have `aria-label`.
- Dialogs need clear titles.
- Use visible focus states.
- Do not rely only on color; combine color with labels/icons.

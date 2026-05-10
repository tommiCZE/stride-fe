---
name: frontend-quality-review
description: Use when reviewing React + TypeScript + MUI frontend code for maintainability, UX, accessibility, performance, bugs, or production readiness.
---

# Frontend Quality Review Skill

Review React + TypeScript + MUI code with a practical production mindset.

## Review checklist

### TypeScript
- No unnecessary `any`.
- Props and domain models are typed.
- Union types for known values.
- Null/undefined handled explicitly.
- No unsafe casts unless justified.

### React
- Components are not too large.
- Hooks are used correctly.
- No accidental stale closures.
- Effects have correct dependencies.
- Derived state is not duplicated unnecessarily.
- Keys are stable.

### MUI / UI
- Theme is used consistently.
- No hardcoded colors where theme token should exist.
- Layout is responsive.
- Dense views remain readable.
- Loading, empty, and error states exist.

### Accessibility
- Buttons have accessible labels.
- Forms have labels and helper text.
- Dialogs/drawers have clear titles.
- Keyboard navigation is not broken.
- Color is not the only information channel.

### Performance
- Avoid unnecessary full-board re-renders.
- Large tables/boards should paginate or virtualize.
- Heavy filtering should be memoized.
- Avoid expensive work in render loops.

### Maintainability
- Feature logic belongs in feature folders.
- Shared components are generic and not domain-leaky.
- Mock data is isolated.
- Imports are clean and consistent.

## Output format
When reviewing, return:
1. Critical issues
2. Recommended improvements
3. Nice-to-have improvements
4. Suggested patch or example code when useful

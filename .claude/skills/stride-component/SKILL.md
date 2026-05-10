---
name: stride-component
description: Create React components for the Stride project following project conventions. Use this skill whenever creating a new component, page, or UI element in the Stride frontend. Invoke it for tasks like "add a new component", "create a page for X", "build a card/modal/dialog", "add a new icon/badge/avatar", "refactor this into a component". The skill ensures correct MUI v9 usage, TypeScript strict patterns, theme-based styling, and the project's file structure conventions.
---

# Stride Component Patterns

You are creating a React component for the Stride issue manager frontend. Follow these patterns exactly.

## Stack
- React 19 + TypeScript strict (no `any`, use `unknown` or proper types)
- MUI v9 (`@mui/material`)
- One file per component, PascalCase filename matching the export name
- Place in `src/components/` (shared) or `src/pages/` (page-level)

## Component anatomy

```tsx
// src/components/MyComponent.tsx
import { Box, Typography } from '@mui/material';
import type { SomeType } from '../types';

interface Props {
  label: string;
  value?: number;       // optional props get defaults
  onClick?: () => void;
}

export default function MyComponent({ label, value = 0, onClick }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}
```

Rules:
- Named `Props` interface directly above the component (not exported unless needed elsewhere)
- Default parameter values in destructuring, not inside the body
- `export default` for the main component; named exports for sub-components if co-located

## Styling rules

**sx prop** — use only for one-off layout: `display`, `flex`, `gap`, `mt`, `mb`, `p`, `width`, `height`, responsive breakpoints. Never for colors, typography, borders — those belong in the theme.

```tsx
// CORRECT: layout-only sx
<Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>

// WRONG: hardcoded design values
<Box sx={{ color: '#5A5BFF', borderRadius: 8, fontWeight: 600 }}>

// CORRECT: semantic palette tokens
<Typography sx={{ color: 'text.secondary' }}>
<Box sx={{ bgcolor: 'primary.main' }}>
```

**Inline styles** — forbidden. No `style={{ }}` attributes.

**Hardcoded hex colors** — forbidden. Always use `theme.palette.*` or palette tokens in sx.

**Reusable styled blocks** — add to `src/components/ui.tsx`:
```tsx
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

export const StatusBadge = styled(Box, {
  shouldForwardProp: p => p !== 'badgeColor',
})<{ badgeColor: string }>(({ badgeColor }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 7px',
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 600,
  color: badgeColor,
  backgroundColor: alpha(badgeColor, 0.14),
}));
```

## Theme-driven overrides

Global styles (border-radius, text transforms, font weights, shadows) belong in `src/theme.ts` via `components` overrides — not in every component:

```ts
// theme.ts
components: {
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { borderRadius: 7, fontWeight: 500, textTransform: 'none' },
    },
  },
}
```

Never add `sx={{ textTransform: 'none', borderRadius: 7 }}` to every Button.

## Responsive design

Use `useMediaQuery` + `theme.breakpoints`:

```tsx
import { useTheme, useMediaQuery } from '@mui/material';

const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));
```

Or sx breakpoints: `sx={{ display: { xs: 'none', md: 'flex' } }}`

## TypeScript patterns

```tsx
// Import types explicitly
import type { Task, User } from '../types';

// Union types for variants
type Variant = 'filled' | 'outlined' | 'ghost';

// Event handlers with proper types
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { ... };

// Children
interface Props { children: React.ReactNode; }

// Ref forwarding when needed
const Input = React.forwardRef<HTMLInputElement, Props>((props, ref) => ...);
```

## Co-located sub-components

When a sub-component is only used by one parent, co-locate it in the same file:

```tsx
// src/pages/Board.tsx

function TaskCard({ task }: { task: Task }) { ... }      // private
function Column({ statusId }: { statusId: string }) { ... } // private

export default function Board() { ... }   // public export at bottom
```

## dnd-kit drag & drop

```tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCard({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      sx={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {children}
    </Box>
  );
}
```

Wrap the list with `<SortableContext items={ids} strategy={verticalListSortingStrategy}>` and the page with `<DndContext sensors={sensors} onDragEnd={handleDragEnd}>`.

## TipTap rich editor

Use the existing `<RichEditor>` and `<RichContent>` components from `src/components/`:

```tsx
import RichEditor from '../components/RichEditor';
import RichContent from '../components/RichContent';

// Edit mode
<RichEditor value={description} onChange={setDescription} />

// Read-only display
<RichContent blocks={description} />
```

## Checklist before finishing

- [ ] No `any` types
- [ ] No inline `style={{ }}`
- [ ] No hardcoded hex colors
- [ ] `sx` prop used only for layout
- [ ] Props interface defined and typed
- [ ] Default values in destructuring
- [ ] File placed in correct directory (`components/` vs `pages/`)

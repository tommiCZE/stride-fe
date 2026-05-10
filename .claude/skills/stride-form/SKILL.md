---
name: stride-form
description: Implement forms, validation, and Zustand state slices for the Stride project. Use this skill when building any form (login, create task, edit project, settings), adding field validation, or creating a new Zustand store slice. Invoke for tasks like "add a form to create X", "validate this field", "add Zod schema for Y", "create a store slice for Z", "persist state with Zustand". Ensures correct React Hook Form v7 + Zod v4 + Zustand v5 patterns for this project.
---

# Stride Forms, Validation & State Patterns

## Forms: React Hook Form + Zod

Always use the schema-first approach: define Zod schema → infer type → connect resolver.

### Basic form pattern

```tsx
// src/pages/CreateProject.tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, TextField, Button } from '@mui/material';

const schema = z.object({
  name: z.string().min(1, 'Název projektu je povinný').max(80),
  key: z.string()
    .min(2, 'Klíč musí mít alespoň 2 znaky')
    .max(10, 'Klíč musí mít max 10 znaků')
    .regex(/^[A-Z]+$/, 'Klíč musí být velká písmena'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;   // infer TypeScript type from schema

export default function CreateProject() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', key: '', description: '' },
  });

  const onSubmit = async (data: FormData) => {
    await createProjectMutation.mutateAsync(data);
    reset();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Název projektu"
        fullWidth
        error={!!errors.name}
        helperText={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="Klíč (např. STRIDE)"
        fullWidth
        error={!!errors.key}
        helperText={errors.key?.message}
        {...register('key')}
      />
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {isSubmitting ? 'Vytváření...' : 'Vytvořit projekt'}
      </Button>
    </Box>
  );
}
```

### MUI Select / Autocomplete with Controller

Use `Controller` when the field isn't a plain input (Select, DatePicker, Autocomplete):

```tsx
import { Controller } from 'react-hook-form';
import { Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';

<Controller
  name="priority"
  control={control}
  render={({ field, fieldState }) => (
    <FormControl fullWidth error={!!fieldState.error}>
      <InputLabel>Priorita</InputLabel>
      <Select {...field} label="Priorita">
        <MenuItem value="low">Nízká</MenuItem>
        <MenuItem value="medium">Střední</MenuItem>
        <MenuItem value="high">Vysoká</MenuItem>
        <MenuItem value="urgent">Urgentní</MenuItem>
      </Select>
      <FormHelperText>{fieldState.error?.message}</FormHelperText>
    </FormControl>
  )}
/>
```

### DatePicker with Controller

```tsx
import { DatePicker } from '@mui/x-date-pickers';
import { Controller } from 'react-hook-form';
import dayjs from 'dayjs';

<Controller
  name="dueDate"
  control={control}
  render={({ field }) => (
    <DatePicker
      label="Termín"
      value={field.value ? dayjs(field.value) : null}
      onChange={(date) => field.onChange(date?.toISOString() ?? null)}
      slotProps={{ textField: { size: 'small', fullWidth: true } }}
    />
  )}
/>
```

### Zod v4 patterns

```ts
import { z } from 'zod';

// Basic
z.string().min(1).max(255)
z.string().email('Neplatná e-mailová adresa')
z.string().url()
z.number().int().min(0)

// Optional vs nullable
z.string().optional()          // string | undefined
z.string().nullable()          // string | null
z.string().nullish()           // string | null | undefined

// Enums
z.enum(['todo', 'in_progress', 'done'])

// Object with refinement
z.object({
  password: z.string().min(8),
  confirm: z.string(),
}).refine(data => data.password === data.confirm, {
  message: 'Hesla se neshodují',
  path: ['confirm'],
});

// Transformation
z.string().transform(s => s.toUpperCase())

// Array
z.array(z.string()).min(1, 'Přidejte alespoň jeden štítek')
```

## Server errors + loading state

```tsx
const [serverError, setServerError] = useState<string | null>(null);

const onSubmit = async (data: FormData) => {
  setServerError(null);
  try {
    await mutation.mutateAsync(data);
  } catch {
    setServerError('Operace selhala. Zkuste to prosím znovu.');
  }
};

// In JSX:
{serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
```

## Zustand store slices

### Basic slice (no persistence)

```ts
// src/store/projectStore.ts
import { create } from 'zustand';
import type { Project } from '../types';

interface ProjectStore {
  // State
  selectedProjectId: string | null;
  filterStatus: string[];

  // Actions
  selectProject: (id: string | null) => void;
  setFilterStatus: (statuses: string[]) => void;
  toggleFilterStatus: (status: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  selectedProjectId: null,
  filterStatus: [],

  selectProject: (id) => set({ selectedProjectId: id }),

  setFilterStatus: (statuses) => set({ filterStatus: statuses }),

  toggleFilterStatus: (status) =>
    set((s) => ({
      filterStatus: s.filterStatus.includes(status)
        ? s.filterStatus.filter((f) => f !== status)
        : [...s.filterStatus, status],
    })),
}));
```

### Persisted slice (localStorage)

```ts
// src/store/authStore.ts pattern
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  language: 'cs' | 'en';
  compactMode: boolean;
  setLanguage: (lang: 'cs' | 'en') => void;
  toggleCompact: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: 'cs',
      compactMode: false,
      setLanguage: (language) => set({ language }),
      toggleCompact: () => set((s) => ({ compactMode: !s.compactMode })),
    }),
    { name: 'stride-settings' },   // localStorage key
  ),
);
```

### Nested state updates

```ts
// Correct — spread nested object
set((s) => ({
  timer: { ...s.timer, running: true, elapsed: 0 },
}));

// Wrong — never mutate directly
set((s) => { s.timer.running = true; });   // ❌
```

### Using the store in components

```tsx
// Select only what you need (avoids unnecessary re-renders)
const selectedProjectId = useProjectStore((s) => s.selectedProjectId);
const selectProject = useProjectStore((s) => s.selectProject);

// Or destructure multiple values
const { filterStatus, toggleFilterStatus } = useProjectStore();
```

### Zustand v5 notes

- No `immer` middleware needed for shallow updates — plain object spread is fine
- `persist` still works the same as v4
- No `devtools` middleware needed unless debugging

## Modals with forms

Pattern for forms inside MUI Dialog:

```tsx
interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export default function CreateTaskModal({ open, onClose, projectId }: CreateTaskModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const createTask = useCreateTask();

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = async (data: FormData) => {
    await createTask.mutateAsync({ ...data, projectId });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nový task</DialogTitle>
      <DialogContent>
        <Box component="form" id="create-task-form" onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Název" fullWidth error={!!errors.title}
            helperText={errors.title?.message} {...register('title')} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Zrušit</Button>
        <Button type="submit" form="create-task-form" variant="contained"
          disabled={createTask.isPending}>
          Vytvořit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

## Checklist

- [ ] Zod schema defined before the component, type inferred with `z.infer`
- [ ] `zodResolver(schema)` connected in `useForm`
- [ ] `error={!!errors.field}` and `helperText={errors.field?.message}` on every TextField
- [ ] `Controller` used for Select, DatePicker, Autocomplete (not `register`)
- [ ] `isSubmitting` disables the submit button
- [ ] Server errors shown via `<Alert severity="error">`
- [ ] `reset()` called on successful submit or modal close
- [ ] Zustand actions use `set((state) => ...)` for derived updates
- [ ] Persisted stores use `persist` middleware with a unique `name` key

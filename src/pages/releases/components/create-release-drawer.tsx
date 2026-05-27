import { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Drawer, IconButton, Stack, TextField, Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs, { Dayjs } from 'dayjs';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useCreateRelease } from '../../../hooks/useReleases';
import { nextVersion, smartDefault, SEMVER_INPUT_RE } from '../../../utils/semver';
import { CloseIcon } from '../../../components/icons/icons';
import type { ReleaseDto } from '../../../api/types';

const schema = z.object({
  name: z.string().regex(SEMVER_INPUT_RE, 'Formát: vX.Y.Z (např. v1.2.0)'),
  startDate: z.custom<Dayjs | null>().nullable(),
  releaseDate: z.custom<Dayjs | null>().nullable(),
  goal: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectKey: string;
  releases: ReleaseDto[];
}

export default function CreateReleaseDrawer({ open, onClose, projectId, projectKey, releases }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const createRelease = useCreateRelease();
  const [bumpMode, setBumpMode] = useState<'patch' | 'minor' | 'major'>('patch');

  const defaults = useMemo(() => smartDefault(releases), [releases]);
  const majorName = useMemo(() => nextVersion(releases, 'major'), [releases]);

  const {
    control, handleSubmit, formState, reset, setValue, watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaults.name,
      startDate: dayjs(),
      releaseDate: dayjs().add(4, 'week'),
      goal: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: defaults.name,
        startDate: dayjs(),
        releaseDate: dayjs().add(4, 'week'),
        goal: '',
      });
      setBumpMode(defaults.bump === 'major' ? 'minor' : defaults.bump);
    }
  }, [open, defaults, reset]);

  const switchToMajor = () => {
    setValue('name', majorName, { shouldValidate: true });
    setBumpMode('major');
  };

  const isDirty = formState.isDirty;

  const attemptClose = () => {
    if (isDirty && !window.confirm('Zahodit rozdělaný formulář?')) return;
    onClose();
  };

  const onSubmit = handleSubmit(values => {
    createRelease.mutate(
      {
        projectId,
        name: values.name,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
        releaseDate: values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : undefined,
        goal: values.goal?.trim() || undefined,
      },
      {
        onSuccess: r => {
          enqueueSnackbar('Verze vytvořena', { variant: 'success' });
          onClose();
          navigate(`/projects/${projectKey}/releases/${r.id}`);
        },
        onError: () => enqueueSnackbar('Chyba při vytváření', { variant: 'error' }),
      },
    );
  });

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      void onSubmit();
    }
  };

  const nameWatch = watch('name');
  const showMajorHint = bumpMode !== 'major' && defaults.parent;

  return (
    <Drawer anchor="right" open={open} onClose={attemptClose}>
      <Stack
        component="form"
        onSubmit={onSubmit}
        onKeyDown={onKeyDown}
        sx={{
          width: { xs: '100vw', sm: 'auto' },
          minWidth: { sm: 520 },
          maxWidth: { sm: '90vw' },
          height: '100%',
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{
          alignItems: 'center',
          px: 2.5, py: 1.75, borderBottom: 1, borderColor: 'divider',
        }}>
          <Typography variant="h5" sx={{ flex: 1 }}>Nová verze</Typography>
          <IconButton size="small" onClick={attemptClose}>
            <CloseIcon/>
          </IconButton>
        </Stack>

        <Stack spacing={2.5} sx={{ flex: 1, px: 2.5, py: 2.5 }}>
          <Box>
            <Typography variant="label" sx={{ mb: 0.5, display: 'block' }}>Název</Typography>
            <Controller
              name="name" control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  autoFocus fullWidth size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message ?? ' '}
                  slotProps={{
                    input: {
                      sx: { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontWeight: 600 },
                    },
                  }}
                />
              )}
            />
            {showMajorHint && (
              <Stack direction="row" spacing={1} sx={{
                alignItems: 'center', mt: 0.5, px: 1.25, py: 0.75,
                bgcolor: theme => alpha(theme.palette.success.main, 0.10),
                border: 1, borderColor: theme => alpha(theme.palette.success.main, 0.3),
                borderRadius: 1,
              }}>
                <Typography sx={{ flex: 1, fontSize: 12, color: 'success.dark' }}>
                  ↗ Navazuje na {defaults.parent} ({defaults.bump})
                </Typography>
                {nameWatch !== majorName && (
                  <Button size="small" variant="text"
                    sx={{ minHeight: 22, py: 0.1, fontSize: 11 }}
                    onClick={switchToMajor}>
                    Major: {majorName}
                  </Button>
                )}
              </Stack>
            )}
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Controller
              name="startDate" control={control}
              render={({ field }) => (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="label" sx={{ mb: 0.5, display: 'block' }}>Start</Typography>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Box>
              )}
            />
            <Controller
              name="releaseDate" control={control}
              render={({ field }) => (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="label" sx={{ mb: 0.5, display: 'block' }}>Vydání</Typography>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Box>
              )}
            />
          </Stack>

          <Box>
            <Typography variant="label" sx={{ mb: 0.5, display: 'block' }}>
              Cíl <Box component="span" sx={{ color: 'text.disabled', fontWeight: 400, textTransform: 'none' }}>(volitelné)</Box>
            </Typography>
            <Controller
              name="goal" control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth size="small" multiline minRows={2} maxRows={3}
                  placeholder="Co tato verze přinese…"
                />
              )}
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{
          px: 2.5, py: 1.5, borderTop: 1, borderColor: 'divider', alignItems: 'center',
        }}>
          <Button onClick={attemptClose} disabled={createRelease.isPending}>
            Zrušit
          </Button>
          <Box sx={{ flex: 1 }}/>
          <Button type="submit" variant="contained" disabled={createRelease.isPending}>
            Vytvořit verzi
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

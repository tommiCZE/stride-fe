import { useMemo, useState } from 'react';
import {
  Box, ClickAwayListener, InputBase, Paper, Popper, Stack, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { ProjectDto, TaskSummaryDto } from '../../../api/types';

interface Props {
  value: string | null;
  tasks: TaskSummaryDto[];
  projects: ProjectDto[];
  onChange: (taskId: string | null) => void;
  disabled?: boolean;
}

const MEETING_LABEL = '📅 Meeting / jiná aktivita';
const MAX_RESULTS = 8;

export default function TaskPicker({ value, tasks, projects, onChange, disabled }: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
  const taskMap = useMemo(() => new Map(tasks.map(t => [t.id, t])), [tasks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks.slice(0, MAX_RESULTS);
    return tasks
      .filter(t => `${t.key} ${t.title}`.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS);
  }, [search, tasks]);

  const selected = value ? taskMap.get(value) ?? null : null;
  const project = selected ? projectMap.get(selected.projectId) : null;

  const close = () => { setOpen(false); setSearch(''); };
  const pick = (taskId: string | null) => { onChange(taskId); close(); };

  const width = anchorEl?.offsetWidth ?? 280;

  return (
    <Box ref={setAnchorEl} sx={{ position: 'relative', width: '100%' }}>
      <Stack
        direction="row"
        spacing={1}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-disabled={disabled}
        onClick={() => { if (!disabled) setOpen(true); }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        sx={{
          px: 1, py: 0.75, borderRadius: 1,
          border: 1, borderColor: 'divider',
          bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          minHeight: 32,
          alignItems: 'center',
          '&:hover': disabled ? undefined : { borderColor: theme.palette.primary.main },
        }}
      >
        {selected && project ? (
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
            <Box aria-hidden sx={{
              width: 6, height: 6, borderRadius: '50%', bgcolor: project.color, flexShrink: 0,
            }}/>
            <Typography variant="caption" sx={{
              fontWeight: 700, color: project.color, fontVariantNumeric: 'tabular-nums', flexShrink: 0,
            }}>{selected.key}</Typography>
            <Typography variant="body2" sx={{
              flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{selected.title}</Typography>
          </Stack>
        ) : value === null ? (
          <Typography variant="body2" sx={{ flex: 1 }}>{MEETING_LABEL}</Typography>
        ) : (
          <Typography variant="body2" color="text.disabled" sx={{ flex: 1 }}>Vyber task…</Typography>
        )}
      </Stack>

      <Popper open={open} anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: 1300 }}>
        <ClickAwayListener onClickAway={close}>
          <Paper elevation={6} sx={{
            mt: 0.5, width,
            maxHeight: 320, overflowY: 'auto', borderRadius: 1,
          }}>
            <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
              <InputBase
                autoFocus
                placeholder="Hledat task… (klíč nebo název)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                sx={{ fontSize: '13px' }}
              />
            </Box>
            <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }}/>}>
              <PickItem
                onClick={() => pick(null)}
                label={MEETING_LABEL}
              />
              {filtered.map(t => {
                const p = projectMap.get(t.projectId);
                return (
                  <PickItem
                    key={t.id}
                    onClick={() => pick(t.id)}
                    label={
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
                        <Box aria-hidden sx={{
                          width: 6, height: 6, borderRadius: '50%', bgcolor: p?.color ?? 'grey.400', flexShrink: 0,
                        }}/>
                        <Typography variant="caption" sx={{
                          fontWeight: 700, color: p?.color ?? 'text.secondary',
                          fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                        }}>{t.key}</Typography>
                        <Typography variant="body2" sx={{
                          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{t.title}</Typography>
                      </Stack>
                    }
                  />
                );
              })}
              {filtered.length === 0 && (
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.disabled">Nic nenalezeno</Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
}

function PickItem({ label, onClick }: { label: React.ReactNode; onClick: () => void }) {
  return (
    <Stack
      direction="row"
      role="option"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      sx={{
        px: 1.25, py: 0.75, cursor: 'pointer', alignItems: 'center',
        '&:hover, &:focus-visible': { bgcolor: 'action.hover', outline: 'none' },
      }}
    >
      {typeof label === 'string' ? <Typography variant="body2">{label}</Typography> : label}
    </Stack>
  );
}

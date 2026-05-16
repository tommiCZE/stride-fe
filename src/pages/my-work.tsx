import { Box, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useAllProjectTasks } from '../hooks/useTasks';
import { useAuthStore } from '../store/auth-store';
import { BOARD_STATUSES } from '../constants/statuses';
import TypeIcon from '../components/icons/type-icon';
import PriorityIcon from '../components/icons/priority-icon';
import { MonoKey, StatusBadge, ColorDot } from '../components/ui/ui';
import { CheckIcon } from '../components/icons/icons';
import EmptyState from '../components/empty-state/EmptyState';

export default function MyWork() {
  const [, setSearchParams] = useSearchParams();
  const openTask = (key: string) => setSearchParams({ task: key });

  const userId = useAuthStore(s => s.userId);
  const { data: projects = [] } = useProjects();
  const { data: allTasks } = useAllProjectTasks(projects.map(p => p.id));
  const myTasks = allTasks.filter(t => t.assigneeId === userId);

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: 'background.default', height: '100%' }}>
      <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>Moje práce</Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>{myTasks.length} přiřazených tasků</Typography>

      {myTasks.length === 0 ? (
        <EmptyState
          icon={<CheckIcon />}
          title="Nemáš žádné úkoly"
          description="Aktuálně nemáš přiřazené žádné úkoly. Užij si volnou chvíli nebo se podívej na nástěnku týmu."
        />
      ) : (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {myTasks.map(t => {
          const status = BOARD_STATUSES.find(s => s.id === t.status);
          return (
            <Box key={t.id} onClick={() => openTask(t.key)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1,
                borderRadius: 1.2, border: 1, borderColor: 'divider', bgcolor: 'background.paper',
                cursor: 'default', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}>
              <PriorityIcon priority={t.priority}/>
              <TypeIcon type={t.type} size={13}/>
              <MonoKey sx={{ minWidth: 72 }}>{t.key}</MonoKey>
              <Typography sx={{ fontSize: 13, flex: 1, minWidth: 0,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</Typography>
              {status && (
                <StatusBadge badgeColor={status.color}>
                  <ColorDot dotColor={status.color} dotSize={5}/>
                  {status.name}
                </StatusBadge>
              )}
              {t.dueDate && (
                <Typography sx={{ fontSize: 11, color: 'text.disabled', minWidth: 60, textAlign: 'right' }}>
                  {new Date(t.dueDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                </Typography>
              )}
            </Box>
          );
        })}
        {myTasks.length === 0 && (
          <Box sx={{ p: 3, color: 'text.disabled', fontSize: 12.5, textAlign: 'center' }}>
            Žádné přiřazené tasky
          </Box>
        )}
      </Box>
      )}
    </Box>
  );
}

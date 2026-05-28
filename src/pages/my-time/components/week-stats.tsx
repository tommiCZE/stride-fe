import { Box, Card, LinearProgress, Stack, Typography } from '@mui/material';
import { fmtHM } from '../../../lib/time';
import { WEEKLY_GOAL_MIN } from '../lib/week-math';

interface Props {
  loggedMin: number;
  closedCount: number;
  openCount: number;
  missingCount: number;
  workdaysInWeek: number;
}

export default function WeekStats({
  loggedMin, closedCount, openCount, missingCount, workdaysInWeek,
}: Props) {
  const goal = WEEKLY_GOAL_MIN;
  const remaining = Math.max(0, goal - loggedMin);
  const progress = Math.min(100, (loggedMin / goal) * 100);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
      <StatCard
        label="Vykázáno v týdnu"
        value={fmtHM(loggedMin)}
        sub={`z cíle ${fmtHM(goal)} · zbývá ${fmtHM(remaining)}`}
        accent="primary.main"
        progress={progress}
      />
      <StatCard
        label="Uzavřené dny"
        value={`${closedCount} / ${workdaysInWeek}`}
        sub={openCount > 0 ? `${openCount} pracovní k uzavření` : 'všechny pracovní dny zpracovány'}
        accent="success.main"
      />
      <StatCard
        label="Otevřené k uzavření"
        value={String(openCount)}
        sub="Dny s logy, ale nezavřené"
        accent={openCount > 0 ? 'warning.main' : 'text.disabled'}
      />
      <StatCard
        label="Chybí výkaz"
        value={String(missingCount)}
        sub="Pracovní dny bez záznamů"
        accent={missingCount > 0 ? 'error.main' : 'text.disabled'}
      />
    </Stack>
  );
}

function StatCard({
  label, value, sub, accent, progress,
}: { label: string; value: string; sub: string; accent: string; progress?: number }) {
  return (
    <Card sx={{ flex: 1, p: 1.75, borderRadius: 1.5 }}>
      <Typography variant="caption" sx={{
        textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', fontWeight: 600,
      }}>
        {label}
      </Typography>
      <Typography variant="h2"
        sx={{ color: accent, mt: 0.25, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
        {value}
      </Typography>
      {progress !== undefined && (
        <Box sx={{ mt: 0.75 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 4, borderRadius: 2 }}/>
        </Box>
      )}
      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>{sub}</Typography>
    </Card>
  );
}
